import { Buffer } from "buffer";
import { hash, Keypair, scValToNative, xdr } from "@stellar/stellar-sdk";

import { WEBAUTH_CONTRACT } from "@/config/settings";
import {
  ContractSigner,
  GetSEP10cChallengeRequest,
  GetSEP10cChallengeResponse,
  PostSEP10cChallengeRequest,
  SEP10cClient,
} from "@/types/types";
import { ScConvert } from "@/helpers/ScConvert";
import { SorobanService } from "@/services/SorobanService";
import { SEP10cClientMock } from "@/services/clients/SEP10cClientMock";

export type SEP10cChallengeValidationData = {
  contractId: string;
  functionName: string;
  signingKey: string;
};

export class SEP10cService {
  private client: SEP10cClient;
  private _validationData?: SEP10cChallengeValidationData;
  private sorobanService: SorobanService;

  constructor(client: SEP10cClient = SEP10cClientMock.getInstance()) {
    this.client = client;
    this.sorobanService = SorobanService.getInstance();
  }

  private async getValidationData(): Promise<SEP10cChallengeValidationData> {
    if (this._validationData) {
      return this._validationData;
    }

    const sep10cInfo = await this.client.getSep10cInfo();
    this._validationData = {
      contractId: sep10cInfo.webAuthContractId,
      functionName: WEBAUTH_CONTRACT.FN_NAME,
      signingKey: sep10cInfo.signingKey,
    };

    return this._validationData;
  }

  public withSorobanService(sorobanService: SorobanService) {
    this.sorobanService = sorobanService;
    return this;
  }

  public withSEP10cClient(client: SEP10cClient) {
    this.client = client;
    this._validationData = undefined;
    return this;
  }

  /**
   * Fetches the SEP-10c challenge.
   *
   * @param req - The request object containing the necessary data.
   * @returns A promise that resolves with the response from the server.
   */
  async getSEP10cChallenge(req: GetSEP10cChallengeRequest): Promise<GetSEP10cChallengeResponse> {
    const resp = await this.client.getSEP10cChallenge(req);

    await this.validateSEP10cChallengeResponse(req, resp);

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

    const { contractId } = await this.getValidationData();

    const signedEntry = await this.sorobanService.signAuthEntry({ contractId, entry, signer });

    return signedEntry.credentials().toXDR("base64");
  }

  /**
   * Sends a POST request to the SEP-10c challenge endpoint.
   *
   * @param req - The request object containing the necessary data for the challenge.
   * @returns A promise that resolves to the JWT token.
   */
  async postSEP10cChallenge(req: PostSEP10cChallengeRequest) {
    const { token } = await this.client.postSEP10cChallenge(req);

    return token;
  }

  /**
   * Validates the SEP10c challenge response.
   *
   * @param req - The SEP10c challenge request.
   * @param resp - The SEP10c challenge response.
   * @throws {Error} If server_signature is invalid.
   * @throws {Error} If authorization_entry is invalid.
   */
  private async validateSEP10cChallengeResponse(req: GetSEP10cChallengeRequest, resp: GetSEP10cChallengeResponse) {
    const { authorization_entry, server_signature } = resp;

    if (!authorization_entry) {
      throw new Error("authorization_entry is required");
    }

    if (!server_signature) {
      throw new Error("server_signature is required");
    }

    const sorobanAuthEntry = xdr.SorobanAuthorizationEntry.fromXDR(authorization_entry, "base64");

    const {
      contractId: wantContractId,
      functionName: wantFunctionName,
      signingKey: wantSigningKey,
    } = await this.getValidationData();

    // validate signature:
    const serverKP = Keypair.fromPublicKey(wantSigningKey);
    const entryHash = hash(sorobanAuthEntry.toXDR());
    const isSigCorrect = serverKP.verify(entryHash, Buffer.from(server_signature, "hex"));
    if (!isSigCorrect) {
      throw new Error("server_signature is invalid");
    }

    const contractFn = sorobanAuthEntry.rootInvocation().function().contractFn();

    // validate contractId:
    const contractId = ScConvert.contractId(contractFn.contractAddress());
    if (contractId !== wantContractId) {
      throw new Error(`contractId is invalid! Expected: ${wantContractId} but got: ${contractId}`);
    }

    // validate functionName:
    const fnName = contractFn.functionName().toString();
    if (fnName !== wantFunctionName) {
      throw new Error(`functionName is invalid! Expected: ${wantFunctionName} but got: ${fnName}`);
    }

    // validate args:
    const scVals = contractFn.args();
    if (scVals.length !== 6) {
      throw new Error(`args is length is invalid! Expected: 6 but got: ${scVals.length}`);
    }
    const gotAddress: string = scValToNative(scVals[0]);
    if (req.address !== gotAddress) {
      throw new Error(`address is invalid! Expected: ${req.address} but got: ${gotAddress}`);
    }
  }
}

type SignAuthEntryProps = {
  authEntry: string | xdr.SorobanAuthorizationEntry;
  signer: ContractSigner;
};
