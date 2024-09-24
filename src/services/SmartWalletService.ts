import { Address, hash, xdr } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";

import { PASSKEY_CONTRACT } from "@/config/settings";
import base64url from "@/helpers/base64url";
import { PasskeyService } from "@/services/PasskeyService";
import { SorobanService } from "@/services/SorobanService";

export class SmartWalletService {
  private static instance: SmartWalletService;
  public static getInstance(): SmartWalletService {
    if (!SmartWalletService.instance) {
      SmartWalletService.instance = new SmartWalletService();
    }

    return SmartWalletService.instance;
  }

  private passkeyService: PasskeyService;
  private sorobanService: SorobanService;
  private WebAuthnFactoryContractID = PASSKEY_CONTRACT.FACTORY;

  constructor() {
    this.passkeyService = PasskeyService.getInstance();
    this.sorobanService = SorobanService.getInstance();
  }

  public withPasskeyService(passkeyService: PasskeyService): SmartWalletService {
    this.passkeyService = passkeyService;
    return this;
  }

  public withSorobanService(sorobanService: SorobanService): SmartWalletService {
    this.sorobanService = sorobanService;
    return this;
  }

  public async createPasskeyContract(app: string, user: string): Promise<string> {
    const { keyId, publicKey } = await this.passkeyService.registerPasskey(app, user);

    console.log(
      `Successfully registered passkey with keyId: ${base64url(Buffer.from(keyId))} and publicKey: ${base64url(
        Buffer.from(publicKey),
      )}`,
    );

    const { tx, simulationResponse } = await this.sorobanService.simulateContract({
      contractId: this.WebAuthnFactoryContractID,
      method: "deploy",
      args: [xdr.ScVal.scvBytes(hash(keyId)), xdr.ScVal.scvBytes(keyId), xdr.ScVal.scvBytes(publicKey)],
    });

    const successResp = await this.sorobanService.callContract({ tx, simulationResponse });
    console.log("simulation return value: ", Address.fromScVal(simulationResponse.result!.retval).toString());
    console.log("execution return value: ", Address.fromScVal(successResp.returnValue!).toString());
    return Address.fromScVal(successResp.returnValue!).toString();
  }
}
