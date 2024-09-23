import { Address, hash, xdr } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";

import { PASSKEY_CONTRACT } from "@/config/settings";
import base64url from "@/helpers/base64url";
import { PasskeyService } from "@/helpers/PasskeyService";
import { SorobanService } from "@/helpers/SorobanService";

export class PasskeySorobanManager {
  private static instance: PasskeySorobanManager;

  public static getInstance(): PasskeySorobanManager {
    if (!PasskeySorobanManager.instance) {
      PasskeySorobanManager.instance = new PasskeySorobanManager();
    }

    return PasskeySorobanManager.instance;
  }

  private passkeyService: PasskeyService;
  private sorobanService: SorobanService;
  private WebAuthnFactoryContractID = PASSKEY_CONTRACT.FACTORY;

  constructor() {
    this.passkeyService = PasskeyService.getInstance();
    this.sorobanService = SorobanService.getInstance();
  }

  public withPasskeyService(passkeyService: PasskeyService): PasskeySorobanManager {
    this.passkeyService = passkeyService;
    return this;
  }

  public withSorobanService(sorobanService: SorobanService): PasskeySorobanManager {
    this.sorobanService = sorobanService;
    return this;
  }

  public async createContractPasskey(app: string, user: string) {
    const { keyId, publicKey } = await this.passkeyService.registerPasskey(app, user);

    console.log(
      `Successfully registered passkey with keyId: ${base64url(Buffer.from(keyId))} and publicKey: ${base64url(
        Buffer.from(publicKey),
      )}`,
    );

    const { tx, simulationResponse } = await this.sorobanService.simulateContract({
      contractId: this.WebAuthnFactoryContractID,
      method: "deploy",
      // BytesN<32>, id: Bytes, pk: BytesN<65>
      args: [xdr.ScVal.scvBytes(hash(keyId)), xdr.ScVal.scvBytes(keyId), xdr.ScVal.scvBytes(publicKey)],
    });

    const successResp = await this.sorobanService.callContract({ tx, simulationResponse });
    console.log("successResp: ", successResp);
    console.log("successResp.resultXdr: ", successResp.resultXdr);
    console.log("successResp.resultMetaXdr: ", successResp.resultMetaXdr);

    console.log("simulationResponse.result!.retval: ", simulationResponse.result!.retval);
    console.log(
      "simulationResponse.result!.retval as Address: ",
      Address.fromScVal(simulationResponse.result!.retval).toString(),
    );
    // this.sorobanService.createContract(keyId, publicKey);
  }
}
