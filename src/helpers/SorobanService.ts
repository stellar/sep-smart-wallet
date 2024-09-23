import {
  Address,
  authorizeEntry,
  Contract,
  Keypair,
  Operation,
  SorobanRpc,
  Transaction,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";
import { getSorobanClient } from "./soroban";
import { STELLAR } from "@/config/settings";
import { ContractSigner, SimulationResult } from "@/types/types";
import { ERRORS } from "./errors";
import { ScConvert } from "@/helpers/ScConvert";

export class SorobanService {
  private static instance: SorobanService;

  public static getInstance(): SorobanService {
    if (!SorobanService.instance) {
      SorobanService.instance = new SorobanService();
    }

    return SorobanService.instance;
  }

  public rpcClient: SorobanRpc.Server;
  public networkPassphrase: string;
  public timeoutInSeconds: number;
  public fee: string;
  public sourceAccountKP: Keypair;

  constructor() {
    this.rpcClient = getSorobanClient(STELLAR.SOROBAN_RPC_URL);
    this.networkPassphrase = STELLAR.NETWORK_PASSPHRASE;
    this.timeoutInSeconds = 60;
    this.fee = STELLAR.MAX_FEE;
    this.sourceAccountKP = Keypair.fromSecret(STELLAR.SOURCE_ACCOUNT.PRIVATE_KEY);
  }

  public withSorobanRpcURL(sorobanRpcUrl: string): SorobanService {
    this.rpcClient = getSorobanClient(sorobanRpcUrl);
    return this;
  }

  public withNetworkPassphrase(networkPassphrase: string): SorobanService {
    this.networkPassphrase = networkPassphrase;
    return this;
  }

  public withTimeoutInSeconds(timeoutInSeconds: number): SorobanService {
    this.timeoutInSeconds = timeoutInSeconds;
    return this;
  }

  public withFee(fee: string): SorobanService {
    this.fee = fee;
    return this;
  }

  public withSourceAccountKP(sourceAccountKP: Keypair): SorobanService {
    this.sourceAccountKP = sourceAccountKP;
    return this;
  }

  /**
   * Signs an authorization entry for a Soroban contract.
   *
   * @param contractId - The ID of the Soroban contract.
   * @param entry - The authorization entry to sign.
   * @param signer - The signer of the entry.
   * @returns A Promise that resolves to the signed Soroban authorization entry.
   * @throws An error if the signer is not authorized to sign the entry or if there is an error authorizing the entry.
   */
  public async signAuthEntry({ contractId, entry, signer }: SignAuthEntry): Promise<xdr.SorobanAuthorizationEntry> {
    // no-op if it's source account auth
    if (entry.credentials().switch().value !== xdr.SorobanCredentialsType.sorobanCredentialsAddress().value) {
      return entry;
    }

    // Ensure the signer is authorized to sign the entry
    const entryAddress = ScConvert.sorobanEntryAddressFromScAddress(entry.credentials().address().address());
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
    const entryRes = await this.rpcClient.getLedgerEntries(ledgerKey);
    if (entryRes.entries && entryRes.entries.length) {
      // set auth entry to expire when contract data expires, but could any number of blocks in the future
      expirationLedgerSeq = entryRes.entries[0].liveUntilLedgerSeq || 0;
    } else {
      throw new Error(ERRORS.CANNOT_FETCH_LEDGER_ENTRY);
    }

    try {
      // TODO: use this approach to sign SorobaanAuthorizedInvocation
      // const contractFn = entry.rootInvocation().function().contractFn();
      // const rootInvocation = new xdr.SorobanAuthorizedInvocation({
      //   subInvocations: [],
      //   function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
      //     new xdr.InvokeContractArgs({
      //       contractAddress: contractFn.contractAddress(),
      //       functionName: contractFn.functionName(),
      //       args: contractFn.args(),
      //     }),
      //   ),
      // });
      // const authEntry = await authorizeInvocation(
      //   signer.method,
      //   expirationLedgerSeq,
      //   rootInvocation,
      //   signer.addressId,
      //   this.networkPassphrase,
      // );
      const authEntry = await authorizeEntry(entry, signer.method, expirationLedgerSeq, this.networkPassphrase);
      return authEntry;
    } catch (error) {
      throw new Error(`${ERRORS.UNABLE_TO_AUTHORIZE_ENTRY}: ${error}`);
    }
  }

  /**
   * Signs the authorization entries for a Soroban transaction.
   * @param authEntries - The authorization entries to sign.
   * @param signers - The signers that will sign the entries.
   * @param tx - The transaction that will be updated with the signed entries.
   * @param contractId - The ID of the Soroban contract.
   * @returns A Promise that resolves to the signed transaction.
   */
  public async signAuthEntries({ authEntries, signers, contractId, tx }: SignAuthEntries): Promise<Transaction> {
    let signedEntries: xdr.SorobanAuthorizationEntry[] = [];

    // Create a Map to index signers by their addressId
    const signerMap = new Map<string, ContractSigner>();
    for (const signer of signers) {
      signerMap.set(signer.addressId, signer);
    }

    for (const entry of authEntries) {
      const entryAddress = ScConvert.sorobanEntryAddressFromScAddress(entry.credentials().address().address());
      const signer = signerMap.get(entryAddress.id);
      if (signer) {
        signedEntries.push(
          await this.signAuthEntry({
            entry,
            signer,
            contractId,
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
  }

  /**
   * Simulates a Soroban contract method.
   * @param contractId - The ID of the Soroban contract.
   * @param method - The method to call.
   * @param args - The arguments for the contract call.
   * @param signers - (Optional) Signers for the contract call.
   * @returns The transaction and simulation result.
   */
  public async simulateContract({ contractId, method, args, signers }: SimulateContract): Promise<SimulationResult> {
    // Fetch source account
    const sourceAcc = await this.rpcClient.getAccount(this.sourceAccountKP.publicKey());

    // Initialize the contract
    const tokenContract = new Contract(contractId);
    let contractCallOp = tokenContract.call(method, ...args);

    // Build the transaction
    let tx = new TransactionBuilder(sourceAcc, { fee: this.fee })
      .addOperation(contractCallOp)
      .setTimeout(this.timeoutInSeconds)
      .setNetworkPassphrase(this.networkPassphrase)
      .build();

    console.log("Simulating contract call:", tx.toXDR());
    // Simulate the transaction
    let simulationResponse = await this.rpcClient.simulateTransaction(tx);
    if (!SorobanRpc.Api.isSimulationSuccess(simulationResponse)) {
      throw new Error(`${ERRORS.TX_SIM_FAILED} (simulation 1): ${simulationResponse}`);
    }

    // Extract the Soroban authorization entry from the simulation
    let authEntries: xdr.SorobanAuthorizationEntry[] = simulationResponse.result?.auth ?? [];
    if (authEntries.length === 0) {
      console.log("No SorobanAuthorizationEntry found in the simulation response.");
    }

    // Sign the entries if signers are provided
    if (signers && signers.length > 0) {
      console.log("Custom signer detected. Signing with custom signer.");
      tx = await this.signAuthEntries({
        authEntries,
        signers,
        tx,
        contractId,
      });

      // Simulate again after signing
      simulationResponse = (await this.rpcClient.simulateTransaction(
        tx,
      )) as SorobanRpc.Api.SimulateTransactionSuccessResponse;
      if (!SorobanRpc.Api.isSimulationSuccess(simulationResponse)) {
        throw new Error(`${ERRORS.TX_SIM_FAILED} (simulation 2): ${simulationResponse}`);
      }
    }

    return { tx, simulationResponse };
  }

  /**
   * Calls a Soroban contract method.
   * @param tx - The transaction to submit.
   * @param simulationResponse - The simulation response for the transaction.
   * @returns A Promise that resolves to the transaction response.
   */
  public async callContract({
    tx,
    simulationResponse,
  }: CallContract): Promise<SorobanRpc.Api.GetSuccessfulTransactionResponse> {
    // Assemble, build and sign the transaction
    const preparedTransaction = SorobanRpc.assembleTransaction(tx, simulationResponse);
    tx = preparedTransaction.build();
    tx.sign(this.sourceAccountKP);

    // Send the transaction
    const sendResponse = await this.rpcClient.sendTransaction(tx);
    if (sendResponse.errorResult) {
      throw new Error(`${ERRORS.SUBMIT_TX_FAILED}: ${sendResponse.errorResult}`);
    }

    // Poll for transaction status
    let txResponse = await this.rpcClient.getTransaction(sendResponse.hash);
    while (txResponse.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
      txResponse = await this.rpcClient.getTransaction(sendResponse.hash);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Check if transaction succeeded
    if (txResponse.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      return txResponse;
    }

    throw new Error(`${ERRORS.SUBMIT_TX_FAILED}: ${txResponse}`);
  }
}

type SimulateContract = {
  contractId: string;
  method: string;
  args: xdr.ScVal[];
  signers?: ContractSigner[];
};

type CallContract = {
  tx: Transaction;
  simulationResponse: SorobanRpc.Api.SimulateTransactionSuccessResponse;
};

type SignAuthEntries = {
  contractId: string;
  authEntries: xdr.SorobanAuthorizationEntry[];
  tx: Transaction;
  signers: ContractSigner[];
};

type SignAuthEntry = {
  contractId: string;
  entry: xdr.SorobanAuthorizationEntry;
  signer: ContractSigner;
};
