import { Buffer } from "buffer";
import { hash, Keypair, scValToNative, xdr } from "@stellar/stellar-sdk";

import { SEP10cServerKeypair, WEBAUTH_CONTRACT } from "@/config/settings";
import { SEP10cServer } from "@/mocks/Sep10cServer";
import { ContractSigner, GetSEP10cChallengeRequest, GetSEP10cChallengeResponse } from "@/types/types";
import { ScConvert } from "@/helpers/ScConvert";
import { SorobanService } from "@/helpers/SorobanService";

export type SEP10cChallengeValidationData = {
  ContractID: string;
  FunctionName: string;
  PublicKey: string;
};

export class SEP10cService {
  private server: SEP10cServer;
  private validationData: SEP10cChallengeValidationData;
  private sorobanService: SorobanService;

  constructor() {
    this.server = new SEP10cServer();
    this.validationData = {
      ContractID: WEBAUTH_CONTRACT.ID,
      FunctionName: WEBAUTH_CONTRACT.FN_NAME,
      PublicKey: SEP10cServerKeypair.publicKey,
    };
    this.sorobanService = SorobanService.getInstance();
  }

  public withValidationData(data: SEP10cChallengeValidationData) {
    this.validationData = data;
    return this;
  }

  public withSorobanService(sorobanService: SorobanService) {
    this.sorobanService = sorobanService;
    return this;
  }

  public withSEP10cServer(server: SEP10cServer) {
    this.server = server;
    return this;
  }

  /**
   * Fetches the SEP10c challenge.
   *
   * @param req - The request object containing the necessary data.
   * @returns A promise that resolves with the response from the server.
   */
  async fetchSEP10cGetChallenge(req: GetSEP10cChallengeRequest) {
    const resp = await this.server.fetchSEP10cGetChallenge(req);

    this.validateSEP10cChallengeResponse(req, resp);

    return resp;
  }

  /**
   * Signs an authorization entry using the provided signer.
   *
   * @param authEntry - The authorization entry to sign. It can be either a string or an xdr.SorobanAuthorizationEntry object.
   * @param signer - The signer to use for signing the entry.
   * @returns The signed entry in XDR format.
   */
  async signAuthEntry({ authEntry, signer }: SignAuthEntryProps) {
    let entry: xdr.SorobanAuthorizationEntry;
    if (typeof authEntry === "string") {
      entry = xdr.SorobanAuthorizationEntry.fromXDR(authEntry, "base64");
    } else {
      entry = authEntry;
    }

    const contractId = this.validationData.ContractID;

    const signedEntry = await this.sorobanService.signAuthEntry({ contractId, entry, signer });

    return signedEntry.credentials().toXDR("base64");
  }

  /**
   * Validates the SEP10c challenge response.
   *
   * @param req - The SEP10c challenge request.
   * @param resp - The SEP10c challenge response.
   * @throws {Error} If server_signature is invalid.
   * @throws {Error} If authorization_entry is invalid.
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

type SignAuthEntryProps = {
  authEntry: string | xdr.SorobanAuthorizationEntry;
  signer: ContractSigner;
};
