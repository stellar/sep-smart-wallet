import {
  Address,
  authorizeEntry,
  Contract,
  Keypair,
  Operation,
  SorobanRpc,
  StrKey,
  TimeoutInfinite,
  Transaction,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";

import { NETWORK_PASSPHRASE, SOROBAN_RPC_URL, SOURCE_ACCOUNT_SECRET_KEY } from "@/config/settings";
import { ERRORS } from "@/helpers/errors";
import { getSorobanClient } from "@/helpers/soroban";
import { ContractSigner } from "@/types/types";

type ContractArgs = {
  contractId: string;
  method: string;
  args: xdr.ScVal[];
  signer?: ContractSigner;
};

export const callContract = async ({
  contractId,
  method,
  args,
  signer,
}: ContractArgs): Promise<SorobanRpc.Api.GetSuccessfulTransactionResponse> => {
  const kp = Keypair.fromSecret(SOURCE_ACCOUNT_SECRET_KEY);
  const rpcClient = getSorobanClient(SOROBAN_RPC_URL);

  // Fetch source account
  const sourceAcc = await rpcClient.getAccount(kp.publicKey());

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
  let sim = (await rpcClient.simulateTransaction(tx)) as SorobanRpc.Api.SimulateTransactionSuccessResponse;
  if (!SorobanRpc.Api.isSimulationSuccess(sim)) {
    throw new Error(`${ERRORS.TX_SIM_FAILED}: ${sim}`);
  }

  // Extract the Soroban authorization entry from the simulation
  let authEntries: xdr.SorobanAuthorizationEntry[] = sim.result?.auth ?? [];
  if (authEntries.length === 0) {
    console.log("No SorobanAuthorizationEntry found in the simulation response.");
  }

  // Use the signer, if provided, to sign slice of SorobanAuthorizationEntry
  if (signer) {
    console.log("Custom signer detected. Signing with custom signer.");
    tx = await updateTxWithSignatures({
      authEntries,
      signer,
      networkPassphrase: NETWORK_PASSPHRASE,
      contractId,
      rpcClient,
      tx,
    });

    // Simulate the transaction again, after signing, to ensure the signatures are valid and to get the updated fees
    sim = (await rpcClient.simulateTransaction(tx)) as SorobanRpc.Api.SimulateTransactionSuccessResponse;
    if (!SorobanRpc.Api.isSimulationSuccess(sim)) {
      throw new Error(`${ERRORS.TX_SIM_FAILED}: ${sim}`);
    }
  } else {
    console.log(`no signer was provided to sign contract call for method: ${method}`);
  }

  // Assemble, build and sign the transaction
  const preparedTransaction = SorobanRpc.assembleTransaction(tx, sim);
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

  // TODO: allow non ed25519 signers
  const entryAddress = entry.credentials().address().address().accountId();
  if (signer.addressId !== StrKey.encodeEd25519PublicKey(entryAddress.ed25519())) {
    throw new Error(ERRORS.INVALID_SIGNER);
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

type UpdateTxWithSignaturesProps = {
  rpcClient: SorobanRpc.Server;
  networkPassphrase: string;
  contractId: string;
  authEntries: xdr.SorobanAuthorizationEntry[];
  tx: Transaction;
  signer: ContractSigner;
};

export const updateTxWithSignatures = async ({
  rpcClient,
  networkPassphrase,
  contractId,
  authEntries,
  tx,
  signer,
}: UpdateTxWithSignaturesProps): Promise<Transaction> => {
  let signedEntries: xdr.SorobanAuthorizationEntry[] = [];

  for (let entry of authEntries) {
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

// export const signAuthEntry = (
//   entry: xdr.SorobanAuthorizationEntry,
//   options?: {
//     keyId?: "any" | string | Uint8Array;
//     rpId?: string;
//     ledgersToLive?: number;
//   },
// ): Promise<xdr.SorobanAuthorizationEntry> => {
//   let { keyId, rpId, ledgersToLive = DEFAULT_TIMEOUT } = options || {};

//   const lastLedger = await this.rpc.getLatestLedger().then(({ sequence }) => sequence);
//   const credentials = entry.credentials().address();
//   const preimage = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
//     new xdr.HashIdPreimageSorobanAuthorization({
//       networkId: hash(Buffer.from(this.networkPassphrase)),
//       nonce: credentials.nonce(),
//       signatureExpirationLedger: lastLedger + ledgersToLive,
//       invocation: entry.rootInvocation(),
//     }),
//   );
//   const payload = hash(preimage.toXDR());

//   const authenticationResponse = await this.WebAuthn.startAuthentication(
//     keyId === "any" || (!keyId && !this.keyId)
//       ? {
//           challenge: base64url(payload),
//           rpId,
//           // userVerification: "discouraged",
//           // timeout: 120_000
//         }
//       : {
//           challenge: base64url(payload),
//           rpId,
//           allowCredentials: [
//             {
//               id: keyId instanceof Uint8Array ? base64url(Buffer.from(keyId)) : keyId || this.keyId!,
//               type: "public-key",
//             },
//           ],
//           // userVerification: "discouraged",
//           // timeout: 120_000
//         },
//   );

//   const signature = this.compactSignature(base64url.toBuffer(authenticationResponse.response.signature));

//   credentials.signatureExpirationLedger(lastLedger + ledgersToLive);
//   credentials.signature(
//     xdr.ScVal.scvMap([
//       new xdr.ScMapEntry({
//         key: xdr.ScVal.scvSymbol("authenticator_data"),
//         val: xdr.ScVal.scvBytes(base64url.toBuffer(authenticationResponse.response.authenticatorData)),
//       }),
//       new xdr.ScMapEntry({
//         key: xdr.ScVal.scvSymbol("client_data_json"),
//         val: xdr.ScVal.scvBytes(base64url.toBuffer(authenticationResponse.response.clientDataJSON)),
//       }),
//       new xdr.ScMapEntry({
//         key: xdr.ScVal.scvSymbol("id"),
//         val: xdr.ScVal.scvBytes(base64url.toBuffer(authenticationResponse.id)),
//       }),
//       new xdr.ScMapEntry({
//         key: xdr.ScVal.scvSymbol("signature"),
//         val: xdr.ScVal.scvBytes(signature),
//       }),
//     ]),
//   );

//   return entry;
// };
