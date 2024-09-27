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
import { SorobanService } from "@/services/SorobanService";
import {
  GetSEP10cChallengeRequest,
  GetSEP10cChallengeResponse,
  PostSEP10cChallengeRequest,
  PostSEP10cChallengeResponse,
  SEP10cInfo,
  SEP10cClient,
} from "@/types/types";
import { ERRORS } from "@/helpers/errors";

export class SEP10cClientMock implements SEP10cClient {
  private static instance: SEP10cClientMock;
  public static getInstance(): SEP10cClientMock {
    if (!SEP10cClientMock.instance) {
      SEP10cClientMock.instance = new SEP10cClientMock();
    }

    return SEP10cClientMock.instance;
  }

  private sorobanService: SorobanService;
  private rpcClient: SorobanRpc.Server;
  private sep10cInfo: SEP10cInfo;

  constructor() {
    this.sep10cInfo = {
      signingKey: SEP10cServerKeypair.publicKey,
      webAuthContractId: WEBAUTH_CONTRACT.ID,
      webAuthEndpointC: "web_auth_verify",
    };
    this.sorobanService = SorobanService.getInstance();
    this.rpcClient = this.sorobanService.rpcClient;
  }

  async getSep10cInfo(): Promise<SEP10cInfo> {
    return {
      signingKey: SEP10cServerKeypair.publicKey,
      webAuthContractId: WEBAUTH_CONTRACT.ID,
    };
  }

  async getSEP10cChallenge(req: GetSEP10cChallengeRequest): Promise<GetSEP10cChallengeResponse> {
    if (!req.address) {
      throw new Error("address is required");
    }

    const simResult = await this.sorobanService.simulateContract({
      contractId: this.sep10cInfo.webAuthContractId,
      method: WEBAUTH_CONTRACT.FN_NAME,
      args: [
        nativeToScVal(req.address),
        nativeToScVal(null),
        nativeToScVal(null),
        nativeToScVal(null),
        nativeToScVal(null),
        nativeToScVal(null),
      ],
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

  async postSEP10cChallenge(req: PostSEP10cChallengeRequest): Promise<PostSEP10cChallengeResponse> {
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
    const contractId = ScConvert.contractId(contractFn.contractAddress());
    const fnName = contractFn.functionName().toString();
    const args = contractFn.args();

    const tokenContract = new Contract(contractId);

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
