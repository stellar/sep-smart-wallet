import { useMutation } from "@tanstack/react-query";
import { getSorobanClient } from "@/helpers/soroban";
import {
  NETWORK_PASSPHRASE,
  SOROBAN_RPC_URL,
  SOURCE_ACCOUNT_SECRET_KEY,
} from "@/config/settings";
import {
  Address,
  Contract,
  Keypair,
  SorobanRpc,
  TimeoutInfinite,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";
import { ERRORS } from "@/helpers/errors";

type TokenBalanceProps = {
  accountId: string;
  contractId: string;
};

export const useContractBalance = () => {
  const mutation = useMutation<xdr.TransactionResult, Error, TokenBalanceProps>(
    {
      mutationFn: async ({ accountId, contractId }: TokenBalanceProps) => {
        const sorobanClient = getSorobanClient(SOROBAN_RPC_URL);

        const kp = Keypair.fromSecret(SOURCE_ACCOUNT_SECRET_KEY);
        const sourceAcc = await sorobanClient.getAccount(kp.publicKey());
        const sorobanAccount = new Address(accountId).toScVal();
        const tokenContract = new Contract(contractId);
        let builtTx = new TransactionBuilder(sourceAcc, {
          fee: "10000",
          networkPassphrase: NETWORK_PASSPHRASE,
        })
          .addOperation(tokenContract.call("balance", sorobanAccount))
          .setTimeout(TimeoutInfinite)
          .build();

        const sim = (await sorobanClient.simulateTransaction(
          builtTx,
        )) as SorobanRpc.Api.SimulateTransactionSuccessResponse;
        const preparedTransaction = SorobanRpc.assembleTransaction(
          builtTx,
          sim,
        );
        if (!SorobanRpc.Api.isSimulationSuccess(sim)) {
          throw new Error(ERRORS.TX_SIM_FAILED);
        }

        // sign the stellar transaction
        builtTx = preparedTransaction.build();
        builtTx.sign(kp);

        const sendResponse = await sorobanClient.sendTransaction(builtTx);
        if (sendResponse.errorResult) {
          throw new Error(
            `${ERRORS.SUBMIT_TX_FAILED}: ${sendResponse.errorResult}`,
          );
        }

        let txResponse = await sorobanClient.getTransaction(sendResponse.hash);

        // Poll this until the status is not "NOT_FOUND"
        while (
          txResponse.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND
        ) {
          txResponse = await sorobanClient.getTransaction(sendResponse.hash);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        if (txResponse.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
          return txResponse.resultXdr;
        }

        throw new Error(`${ERRORS.SUBMIT_TX_FAILED}: ${txResponse}`);
      },
    },
  );

  return mutation;
};
