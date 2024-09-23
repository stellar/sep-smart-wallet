import { Buffer } from "buffer";
import { hash, Keypair, scValToNative, xdr } from "@stellar/stellar-sdk";

import { SEP10cServerKeypair, WEBAUTH_CONTRACT } from "@/config/settings";
import { SEP10cServer } from "@/mocks/Sep10cServer";
import { GetSEP10cChallengeRequest, GetSEP10cChallengeResponse } from "@/types/types";
import { ScConvert } from "@/helpers/ScConvert";

export type SEP10cChallengeValidationData = {
  ContractID: string;
  FunctionName: string;
  PublicKey: string;
};

export class SEP10cClient {
  private server: SEP10cServer;
  private validationData: SEP10cChallengeValidationData;

  constructor() {
    this.server = new SEP10cServer();
    this.validationData = {
      ContractID: WEBAUTH_CONTRACT.ID,
      FunctionName: WEBAUTH_CONTRACT.FN_NAME,
      PublicKey: SEP10cServerKeypair.publicKey,
    };
  }

  async fetchSEP10cGetChallenge(req: GetSEP10cChallengeRequest) {
    const resp = await this.server.fetchSEP10cGetChallenge(req);

    this.validateSEP10cChallengeResponse(req, resp);

    return resp;
  }

  /**
   * Validates the SEP10c challenge response.
   *
   * @param req - The SEP10c challenge request.
   * @param resp - The SEP10c challenge response.
   * @throws {Error} If server_signature is missing or empty.
   * @throws {Error} If server_signature is invalid.
   * @throws {Error} If authorization_entry is missing or empty.
   * @throws {Error} If authorization_entry.contractID is invalid.
   * @throws {Error} If authorization_entry.functionName is invalid.
   * @throws {Error} If authorization_entry.args length is invalid.
   */
  private validateSEP10cChallengeResponse(req: GetSEP10cChallengeRequest, resp: GetSEP10cChallengeResponse) {
    const { authorization_entry, server_signature } = resp;

    if (!authorization_entry) {
      throw new Error("authorization_entry is required");
    }

    if (!server_signature) {
      throw new Error("server_signature is required");
    }

    const sorobanAuthEntry = xdr.SorobanAuthorizationEntry.fromXDR(authorization_entry, "base64");

    // validate signature:
    const serverKP = Keypair.fromPublicKey(this.validationData.PublicKey);
    const entryHash = hash(sorobanAuthEntry.toXDR());
    const isSigCorrect = serverKP.verify(entryHash, Buffer.from(server_signature, "hex"));
    if (!isSigCorrect) {
      throw new Error("server_signature is invalid");
    }

    const contractFn = sorobanAuthEntry.rootInvocation().function().contractFn();

    // validate contractID:
    const contractID = ScConvert.contractID(contractFn.contractAddress());
    if (contractID !== this.validationData.ContractID) {
      throw new Error(`contractID is invalid! Expected: ${this.validationData.ContractID} but got: ${contractID}`);
    }

    // validate functionName:
    const fnName = contractFn.functionName().toString();
    if (fnName !== this.validationData.FunctionName) {
      throw new Error(`functionName is invalid! Expected: ${this.validationData.FunctionName} but got: ${fnName}`);
    }

    // validate args:
    const scVals = contractFn.args();
    if (scVals.length !== 1) {
      throw new Error(`args is length is invalid! Expected: 1 but got: ${scVals.length}`);
    }
    let args: { [key: string]: string } = scValToNative(scVals[0]);
    console.log("sorobanAuthEntry.args: ", args);
    if (req.account !== args["account"]) {
      throw new Error(`account is invalid! Expected: ${req.account} but got: ${args["account"]}`);
    }

    if (req.client_domain !== args["client_domain"]) {
      throw new Error(`client_domain is invalid! Expected: ${req.client_domain} but got: ${args["client_domain"]}`);
    }

    if (req.home_domain !== args["home_domain"]) {
      throw new Error(`home_domain is invalid! Expected: ${req.home_domain} but got: ${args["home_domain"]}`);
    }

    if (req.memo !== args["memo"]) {
      throw new Error(`memo is invalid! Expected: ${req.memo} but got: ${args["memo"]}`);
    }
  }
}
