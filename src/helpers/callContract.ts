import {
  Contract,
  Keypair,
  SigningCallback,
  SorobanRpc,
  TimeoutInfinite,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";

import { getSorobanClient } from "@/helpers/soroban";
import { NETWORK_PASSPHRASE, SOROBAN_RPC_URL, SOURCE_ACCOUNT_SECRET_KEY } from "@/config/settings";
import { ERRORS } from "@/helpers/errors";

type ContractArgs = {
  contractId: string;
  method: string;
  args: xdr.ScVal[];
  signer?: Keypair | SigningCallback | undefined;
};

export const callContract = async ({
  contractId,
  method,
  args,
  signer,
}: ContractArgs): Promise<SorobanRpc.Api.GetSuccessfulTransactionResponse> => {
  const kp = Keypair.fromSecret(SOURCE_ACCOUNT_SECRET_KEY);

  const sorobanClient = getSorobanClient(SOROBAN_RPC_URL);

  const sourceAcc = await sorobanClient.getAccount(kp.publicKey());
  const tokenContract = new Contract(contractId);
  let builtTx = new TransactionBuilder(sourceAcc, { fee: "10000" })
    .addOperation(tokenContract.call(method, ...args))
    .setTimeout(TimeoutInfinite)
    .setNetworkPassphrase(NETWORK_PASSPHRASE)
    .build();

  const sim = (await sorobanClient.simulateTransaction(builtTx)) as SorobanRpc.Api.SimulateTransactionSuccessResponse;
  if (!SorobanRpc.Api.isSimulationSuccess(sim)) {
    throw new Error(`${ERRORS.TX_SIM_FAILED}: ${sim}`);
  }

  if (!!signer) {
    console.error("signer is not implemented. Ignoring the signer input parameter: ", signer);
  }

  // sign the stellar transaction
  const preparedTransaction = SorobanRpc.assembleTransaction(builtTx, sim);
  builtTx = preparedTransaction.build();
  builtTx.sign(kp);

  const sendResponse = await sorobanClient.sendTransaction(builtTx);
  if (sendResponse.errorResult) {
    throw new Error(`${ERRORS.SUBMIT_TX_FAILED}: ${sendResponse.errorResult}`);
  }

  let txResponse = await sorobanClient.getTransaction(sendResponse.hash);
  while (txResponse.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
    txResponse = await sorobanClient.getTransaction(sendResponse.hash);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  if (txResponse.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
    txResponse.resultMetaXdr;
    return txResponse;
  }

  throw new Error(`${ERRORS.SUBMIT_TX_FAILED}: ${txResponse}`);
};
