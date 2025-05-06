import { useMutation } from "@tanstack/react-query";

import { WalletBackendService } from "@/services/WalletBackendService";
import { ScConvert } from "@/helpers/ScConvert";
import { ContractSigner, NewSimulationResponse } from "@/types/types";
import { rpc, TransactionBuilder, xdr, XdrLargeInt } from "@stellar/stellar-sdk";
import { SorobanService } from "@/services/SorobanService";

export const useGetPayments = () => {
  const mutation = useMutation<any, Error>({
    mutationFn: async () => {
      const wbs = WalletBackendService.getInstance();
      return wbs.getPayments();
    },
  });

  return mutation;
};

type TokenTransferProps = {
  contractId: string;
  fromAccId: string;
  toAccId: string;
  amount: string;
  signer?: ContractSigner;
};

export const useWBFeeBumpedTransfer = () => {
  const mutation = useMutation<rpc.Api.GetSuccessfulTransactionResponse, Error, TokenTransferProps>({
    mutationFn: async ({ contractId, fromAccId, toAccId, amount, signer }) => {
      const scFrom = ScConvert.accountIdToScVal(fromAccId);
      const scTo = ScConvert.accountIdToScVal(toAccId);
      const scAmount = new XdrLargeInt("i128", amount).toScVal();

      let signers: ContractSigner[] = [];
      if (signer) {
        signers.push(signer);
      }

      const ss = new SorobanService();
      let { tx, simulationResponse } = await ss.simulateContract({
        contractId,
        method: "transfer",
        args: [scFrom, scTo, scAmount],
        signers,
      });

      const preparedTransaction = rpc.assembleTransaction(tx, simulationResponse);
      tx = preparedTransaction.build();

      const transactionEnvelope = xdr.TransactionEnvelope.fromXDR(tx.toXDR(), "base64");
      const operationXDRs = transactionEnvelope
        .v1()
        .tx()
        .operations()
        .map((op) => op.toXDR("base64")); // Convert each operation to XDR

      const wbs = WalletBackendService.getInstance();
      const timeout = 30; // seconds

      const buildTxResponse = await wbs.buildTransaction({
        transactions: [
          { operations: operationXDRs, timeout, simulationResult: NewSimulationResponse(simulationResponse) },
        ],
      });
      const feeBumpedTxResponse = await wbs.createFeeBumpTransaction(buildTxResponse.transactionXdrs[0]);
      console.warn("feeBumpedTxResponse: ", feeBumpedTxResponse.transaction);
      const rpcTxResponse = await ss.sendTransaction(feeBumpedTxResponse.transaction);

      return rpcTxResponse;
    },
  });

  return mutation;
};

export const useSelfFeeBumpedTransfer = () => {
  const mutation = useMutation<rpc.Api.GetSuccessfulTransactionResponse, Error, TokenTransferProps>({
    mutationFn: async ({ contractId, fromAccId, toAccId, amount, signer }) => {
      const scFrom = ScConvert.accountIdToScVal(fromAccId);
      const scTo = ScConvert.accountIdToScVal(toAccId);
      const scAmount = new XdrLargeInt("i128", amount).toScVal();

      let signers: ContractSigner[] = [];
      if (signer) {
        signers.push(signer);
      }

      const ss = new SorobanService();
      let { tx, simulationResponse } = await ss.simulateContract({
        contractId,
        method: "transfer",
        args: [scFrom, scTo, scAmount],
        signers,
      });
      tx.sign(ss.sourceAccountKP);

      // option1: manual
      const sorobanData = simulationResponse.transactionData.build();
      const preparedTransaction = TransactionBuilder.cloneFrom(tx, {
        fee: sorobanData.resourceFee().toString(), // NOTE inner tx fee cannot be less than the resource fee or the tx will be invalid
        sorobanData: sorobanData,
      });

      // option2: SDK method
      // const preparedTransaction = rpc.assembleTransaction(tx, simulationResponse);

      tx = preparedTransaction.build();
      tx.sign(ss.sourceAccountKP);

      const feeBumpFee = BigInt(tx.fee) * BigInt(3);

      const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
        ss.sourceAccountKP,
        feeBumpFee.toString(),
        tx,
        ss.networkPassphrase,
      );
      feeBumpTx.sign(ss.sourceAccountKP);

      console.warn("feeBumpTx: ", feeBumpTx.toXDR());

      const txResponse = await ss.sendTransaction(feeBumpTx);

      return txResponse;
    },
  });

  return mutation;
};
