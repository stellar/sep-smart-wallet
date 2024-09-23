import {
  Contract,
  hash,
  Keypair,
  nativeToScVal,
  Operation,
  SorobanRpc,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";

import { SEP10cServerKeypair, STELLAR, WEBAUTH_CONTRACT } from "@/config/settings";
import { ScConvert } from "@/helpers/ScConvert";
import { getSorobanClient } from "@/helpers/getSorobanClient";
import { SorobanService } from "@/services/SorobanService";
import {
  GetSEP10cChallengeRequest,
  GetSEP10cChallengeResponse,
  PostSEP10cChallengeRequest,
  PostSEP10cChallengeResponse,
} from "@/types/types";
import { ERRORS } from "@/helpers/errors";

export class SEP10cServer {
  private sorobanService: SorobanService;
  private contractId: string;
  private rpcClient: SorobanRpc.Server;

  constructor() {
    this.sorobanService = SorobanService.getInstance();
    this.contractId = WEBAUTH_CONTRACT.ID;
    this.rpcClient = getSorobanClient(STELLAR.SOROBAN_RPC_URL);
  }

  async fetchSEP10cGetChallenge(req: GetSEP10cChallengeRequest): Promise<GetSEP10cChallengeResponse> {
    if (!req.account) {
      throw new Error("address is required");
    }

    const simResult = await this.sorobanService.simulateContract({
      contractId: this.contractId,
      method: WEBAUTH_CONTRACT.FN_NAME,
      args: [nativeToScVal(req)],
    });

    const authEntry = simResult.simulationResponse.result!.auth![0];
    const authEntryXDR = authEntry.toXDR("base64");

    return {
      authorization_entry: authEntryXDR,
      server_signature: this.signAuthEntry(authEntry),
    };
  }

  private signAuthEntry(authEntry: xdr.SorobanAuthorizationEntry): string {
    const kp = Keypair.fromSecret(SEP10cServerKeypair.privateKey);

    const entryHash = hash(authEntry.toXDR());
    const signature = kp.sign(entryHash);

    return signature.toString("hex");
  }

  async fetchSEP10cPostChallenge(req: PostSEP10cChallengeRequest): Promise<PostSEP10cChallengeResponse> {
    const authEntry = xdr.SorobanAuthorizationEntry.fromXDR(req.authorization_entry, "base64");

    // Verify the server signature
    const expectedSignature = this.signAuthEntry(authEntry);
    if (expectedSignature !== req.server_signature) {
      throw new Error("invalid signature");
    }

    let tx = await this.assembleTxWithCredentials(req, authEntry);

    console.log("Simulating contract call:", tx.toXDR());
    // Simulate the transaction
    let simulationResponse = await this.rpcClient.simulateTransaction(tx);
    if (!SorobanRpc.Api.isSimulationSuccess(simulationResponse)) {
      throw new Error(`${ERRORS.TX_SIM_FAILED}: ${simulationResponse}`);
    }

    return {
      token: "jwt_token",
    };
  }

  private async assembleTxWithCredentials(req: PostSEP10cChallengeRequest, authEntry: xdr.SorobanAuthorizationEntry) {
    const credentials = req.credentials;

    if (credentials.length === 0) {
      throw new Error("credentials is required");
    }
    if (credentials.length > 1) {
      throw new Error("NOT IMPLEMENTED for multiple credentials");
    }

    const clientCredentials = xdr.SorobanCredentials.fromXDR(credentials[0], "base64");
    authEntry.credentials(clientCredentials);

    const contractFn = authEntry.rootInvocation().function().contractFn();
    const contractID = ScConvert.contractID(contractFn.contractAddress());
    const fnName = contractFn.functionName().toString();
    const args = contractFn.args();

    const tokenContract = new Contract(contractID);

    const sourceAppKP = Keypair.fromSecret(STELLAR.SOURCE_ACCOUNT.PRIVATE_KEY);
    const sourceAcc = await this.rpcClient.getAccount(sourceAppKP.publicKey());

    let tx = new TransactionBuilder(sourceAcc, { fee: STELLAR.MAX_FEE })
      .addOperation(tokenContract.call(fnName, ...args))
      .setTimeout(60)
      .setNetworkPassphrase(STELLAR.NETWORK_PASSPHRASE)
      .build();

    const rawInvokeHostFunctionOp = tx.operations[0] as Operation.InvokeHostFunction;
    tx = TransactionBuilder.cloneFrom(tx)
      .clearOperations()
      .addOperation(
        Operation.invokeHostFunction({
          ...rawInvokeHostFunctionOp,
          auth: [authEntry],
        }),
      )
      .build();
    return tx;
  }
}
