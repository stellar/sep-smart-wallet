import {
  Address,
  authorizeEntry,
  Contract,
  Keypair,
  Operation,
  SorobanRpc,
  TimeoutInfinite,
  Transaction,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";

import { NETWORK_PASSPHRASE, SOROBAN_RPC_URL } from "@/config/settings";
import { ERRORS } from "@/helpers/errors";
import { getSorobanClient } from "@/helpers/soroban";
import { ContractSigner, SimulationResult } from "@/types/types";
import { SvConvert } from "./SvConvert";

type SimulateContract = {
  sourceAccPubKey: string;
  contractId: string;
  method: string;
  args: xdr.ScVal[];
  signers?: ContractSigner[];
};

/**
 * Simulate the execution of a Soroban contract method.
 *
 * @param sourceAccPubKey - The public key of the transacton source account.
 * @param contractId - The ID of the Soroban contract.
 * @param method - The method to call on the contract.
 * @param args - The arguments to pass to the method.
 * @param signers - The signers that will sign the contract call entries.
 * @returns A Promise that resolves to the transaction and simulation response.
 * @throws An error if the transaction fails.
 */
export const simulateContract = async ({
  sourceAccPubKey,
  contractId,
  method,
  args,
  signers,
}: SimulateContract): Promise<SimulationResult> => {
  const rpcClient = getSorobanClient(SOROBAN_RPC_URL);

  // Fetch source account
  const sourceAcc = await rpcClient.getAccount(sourceAccPubKey);

  // Initialize the contract
  const tokenContract = new Contract(contractId);
  let contractCallOp = tokenContract.call(method, ...args);

  // Build the transaction
  let tx = new TransactionBuilder(sourceAcc, { fee: "10000" })
    .addOperation(contractCallOp)
    .setTimeout(TimeoutInfinite)
    .setNetworkPassphrase(NETWORK_PASSPHRASE)
    .build();

  // Simulate the transaction
  let simulationResponse = await rpcClient.simulateTransaction(tx);
  if (!SorobanRpc.Api.isSimulationSuccess(simulationResponse)) {
    throw new Error(`${ERRORS.TX_SIM_FAILED}: ${simulationResponse}`);
  }

  // Extract the Soroban authorization entry from the simulation
  let authEntries: xdr.SorobanAuthorizationEntry[] = simulationResponse.result?.auth ?? [];
  if (authEntries.length === 0) {
    console.log("No SorobanAuthorizationEntry found in the simulation response.");
  }

  // Use the signer, if provided, to sign slice of SorobanAuthorizationEntry
  if (signers && signers.length > 0) {
    console.log("Custom signer detected. Signing with custom signer.");
    tx = await signAuthEntries({
      authEntries,
      signers,
      networkPassphrase: NETWORK_PASSPHRASE,
      contractId,
      rpcClient,
      tx,
    });

    // Simulate the transaction again, after signing, to ensure the signatures are valid and to get the updated fees
    simulationResponse = (await rpcClient.simulateTransaction(tx)) as SorobanRpc.Api.SimulateTransactionSuccessResponse;
    if (!SorobanRpc.Api.isSimulationSuccess(simulationResponse)) {
      throw new Error(`${ERRORS.TX_SIM_FAILED}: ${simulationResponse}`);
    }
  } else {
    console.log(`no signer was provided to sign contract call for method: ${method}`);
  }

  return { tx, simulationResponse };
};

type CallContract = {
  tx: Transaction;
  simulationResponse: SorobanRpc.Api.SimulateTransactionSuccessResponse;
  kp: Keypair;
};

/**
 * Calls a Soroban contract method.
 *
 * @param tx - The transaction to submit.
 * @param simulationResponse - The simulation response for the transaction.
 * @param kp - The keypair of the Transaction source account.
 * @returns A Promise that resolves to the transaction response.
 * @throws An error if the transaction fails.
 */
export const callContract = async ({
  tx,
  simulationResponse,
  kp,
}: CallContract): Promise<SorobanRpc.Api.GetSuccessfulTransactionResponse> => {
  const rpcClient = getSorobanClient(SOROBAN_RPC_URL);

  // Assemble, build and sign the transaction
  const preparedTransaction = SorobanRpc.assembleTransaction(tx, simulationResponse);
  tx = preparedTransaction.build();
  tx.sign(kp);

  // Send the transaction
  const sendResponse = await rpcClient.sendTransaction(tx);
  if (sendResponse.errorResult) {
    throw new Error(`${ERRORS.SUBMIT_TX_FAILED}: ${sendResponse.errorResult}`);
  }

  // Poll for transaction status
  let txResponse = await rpcClient.getTransaction(sendResponse.hash);
  while (txResponse.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
    txResponse = await rpcClient.getTransaction(sendResponse.hash);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Check if transaction succeeded
  if (txResponse.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
    return txResponse;
  }

  throw new Error(`${ERRORS.SUBMIT_TX_FAILED}: ${txResponse}`);
};

type SignAuthEntry = {
  rpcClient: SorobanRpc.Server;
  networkPassphrase: string;
  contractId: string;
  entry: xdr.SorobanAuthorizationEntry;
  signer: ContractSigner;
};

/**
 * Signs an authorization entry for a Soroban contract.
 *
 * @param rpcClient - The Soroban RPC client used to interact with the network.
 * @param networkPassphrase - The Stellar network passphrase.
 * @param contractId - The ID of the Soroban contract.
 * @param entry - The authorization entry to sign.
 * @param signer - The signer of the entry.
 * @returns A Promise that resolves to the signed Soroban authorization entry.
 * @throws An error if the signer is not authorized to sign the entry or if there is an error authorizing the entry.
 */
export const signAuthEntry = async ({
  rpcClient,
  networkPassphrase,
  contractId,
  entry,
  signer,
}: SignAuthEntry): Promise<xdr.SorobanAuthorizationEntry> => {
  // no-op if it's source account auth
  if (entry.credentials().switch().value !== xdr.SorobanCredentialsType.sorobanCredentialsAddress().value) {
    return entry;
  }

  // Ensure the signer is authorized to sign the entry
  const entryAddress = SvConvert.sorobanEntryAddressFromScAddress(entry.credentials().address().address());
  if (signer.addressId !== entryAddress.id) {
    throw new Error(`${ERRORS.INVALID_SIGNER}: ${signer}`);
  }

  // Construct the ledger key
  const ledgerKey: xdr.LedgerKey = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: new Address(contractId).toScAddress(),
      key: xdr.ScVal.scvLedgerKeyContractInstance(),
      durability: xdr.ContractDataDurability.persistent(),
    }),
  );

  // Fetch the current contract ledger seq
  let expirationLedgerSeq = 0;
  const entryRes = await rpcClient.getLedgerEntries(ledgerKey);
  if (entryRes.entries && entryRes.entries.length) {
    // set auth entry to expire when contract data expires, but could any number of blocks in the future
    expirationLedgerSeq = entryRes.entries[0].liveUntilLedgerSeq || 0;
  } else {
    throw new Error(ERRORS.CANNOT_FETCH_LEDGER_ENTRY);
  }

  try {
    const authEntry = await authorizeEntry(entry, signer.method, expirationLedgerSeq, networkPassphrase);
    return authEntry;
  } catch (error) {
    throw new Error(`${ERRORS.UNABLE_TO_AUTHORIZE_ENTRY}: ${error}`);
  }
};

type SignAuthEntries = {
  rpcClient: SorobanRpc.Server;
  networkPassphrase: string;
  contractId: string;
  authEntries: xdr.SorobanAuthorizationEntry[];
  tx: Transaction;
  signers: ContractSigner[];
};

/**
 * Signs the authorization entries for a Soroban transaction.
 *
 * @param rpcClient - The Soroban RPC client used to interact with the network.
 * @param networkPassphrase - The Stellar network passphrase.
 * @param contractId - The ID of the Soroban contract.
 * @param authEntries - The authorization entries to sign.
 * @param tx - The Stellar transaction that will be updated with the signed entries.
 * @param signers - The signers that will sign the entries.
 * @returns A Promise that resolves to the signed transaction.
 */
export const signAuthEntries = async ({
  rpcClient,
  networkPassphrase,
  contractId,
  authEntries,
  tx,
  signers,
}: SignAuthEntries): Promise<Transaction> => {
  let signedEntries: xdr.SorobanAuthorizationEntry[] = [];

  // Create a Map to index signers by their addressId
  const signerMap = new Map<string, ContractSigner>();
  for (const signer of signers) {
    signerMap.set(signer.addressId, signer);
  }

  for (const entry of authEntries) {
    const entryAddress = SvConvert.sorobanEntryAddressFromScAddress(entry.credentials().address().address());
    const signer = signerMap.get(entryAddress.id);
    if (signer) {
      signedEntries.push(
        await signAuthEntry({
          entry,
          signer,
          networkPassphrase: networkPassphrase,
          contractId,
          rpcClient,
        }),
      );
    }
  }

  // Soroban transaction can only have 1 operation
  const rawInvokeHostFunctionOp = tx.operations[0] as Operation.InvokeHostFunction;
  tx = TransactionBuilder.cloneFrom(tx)
    .clearOperations()
    .addOperation(
      Operation.invokeHostFunction({
        ...rawInvokeHostFunctionOp,
        auth: signedEntries,
      }),
    )
    .build();

  return tx;
};
