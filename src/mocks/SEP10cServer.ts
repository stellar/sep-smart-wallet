import { SEP10cServerKeypair, WEBAUTH_CONTRACT } from "@/config/settings";
import { SorobanService } from "@/helpers/SorobanService";
import {
  GetSEP10cChallengeRequest,
  GetSEP10cChallengeResponse,
  PostSEP10cChallengeRequest,
  PostSEP10cChallengeResponse,
} from "@/types/types";
import { hash, Keypair, nativeToScVal, xdr } from "@stellar/stellar-sdk";

export class SEP10cServer {
  private sorobanService: SorobanService;
  private contractId: string;

  constructor() {
    this.sorobanService = SorobanService.getInstance();
    this.contractId = WEBAUTH_CONTRACT.ID;
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

  async fetchSEP10cPostChallenge(_: PostSEP10cChallengeRequest): Promise<PostSEP10cChallengeResponse> {
    // TODO
    // sleep 1 second:
    setTimeout(() => {}, 1000);

    return {
      token: "jwt_token",
    };
  }
}
