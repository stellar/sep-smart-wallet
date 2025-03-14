import { useMutation } from "@tanstack/react-query";

import { WalletBackendService } from "@/services/WalletBackendService";
import { ScConvert } from "@/helpers/ScConvert";
import { ContractSigner } from "@/types/types";
import { Networks, Transaction, TransactionBuilder, xdr, XdrLargeInt } from "@stellar/stellar-sdk";
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

export const useBuildTransaction = () => {
  const mutation = useMutation<any, Error, TokenTransferProps>({
    mutationFn: async ({ contractId, fromAccId, toAccId, amount, signer }) => {
      const scFrom = ScConvert.accountIdToScVal(fromAccId);
      const scTo = ScConvert.accountIdToScVal(toAccId);
      const scAmount = new XdrLargeInt("i128", amount).toScVal();

      let signers: ContractSigner[] = [];
      if (signer) {
        signers.push(signer);
      }

      const ss = new SorobanService();
      let { tx } = await ss.simulateContract({
        contractId,
        method: "transfer",
        args: [scFrom, scTo, scAmount],
        signers,
      });

      const transactionEnvelope = xdr.TransactionEnvelope.fromXDR(tx.toXDR(), "base64");
      const operationXDRs = transactionEnvelope
        .v1()
        .tx()
        .operations()
        .map((op) => op.toXDR("base64")); // Convert each operation to XDR

      const wbs = WalletBackendService.getInstance();
      const now = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
      const oneMonthInSeconds = 30 * 24 * 60 * 60; // Approximate one month in seconds
      const timebounds = now + oneMonthInSeconds;

      return wbs.buildTransaction({ transactions: [{ operations: operationXDRs, timebounds }] });
    },
  });

  return mutation;
};
