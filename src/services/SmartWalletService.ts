import { Address, hash, xdr } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";

import { PASSKEY_CONTRACT } from "@/config/settings";
import base64url from "@/helpers/base64url";
import { PasskeyService } from "@/services/PasskeyService";
import { SorobanService } from "@/services/SorobanService";
import { Wallet } from "@/types/types";

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

  public wallet?: Wallet;

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

  public async createPasskeyContract(app: string, user: string): Promise<Wallet> {
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
    const contractId = Address.fromScVal(successResp.returnValue!).toString();
    this.wallet = { keyId: base64url(keyId), contractId };

    console.warn("createPasskeyContract's keyId: ", this.wallet?.keyId);

    return this.wallet;
  }

  public async connectPasskey(): Promise<Wallet> {
    const keyId = await this.passkeyService.connectPasskey();
    if (!keyId) {
      throw new Error("No `keyId` was found");
    }

    const keyIdBuffer = base64url.toBuffer(keyId);

    const { simulationResponse } = await this.sorobanService.simulateContract({
      contractId: this.WebAuthnFactoryContractID,
      method: "get_address",
      args: [xdr.ScVal.scvBytes(keyIdBuffer)],
    });

    const contractId = Address.fromScVal(simulationResponse.result!.retval).toString();

    this.wallet = { keyId, contractId };

    return this.wallet;
  }
}
