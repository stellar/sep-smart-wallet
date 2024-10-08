import { Address, hash, xdr } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";

import { PASSKEY } from "@/config/settings";
import base64url from "@/helpers/base64url";
import { PasskeyService } from "@/services/PasskeyService";
import { SorobanService } from "@/services/SorobanService";
import { BroadcastPasskeySmartWalletCreationFn, Wallet } from "@/types/types";

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
  private WebAuthnFactoryContractId = PASSKEY.CONTRACT_FACTORY_ID;

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

  public async createPasskeyContract(
    app: string,
    user: string,
    broadcastStatus?: BroadcastPasskeySmartWalletCreationFn,
  ): Promise<Wallet> {
    const { keyId, publicKey } = await this.passkeyService.registerPasskey(app, user);
    const _broadcastStatus: BroadcastPasskeySmartWalletCreationFn = broadcastStatus || (() => {});
    _broadcastStatus("🔐 Passkey stored locally", false);

    const { tx, simulationResponse } = await this.sorobanService.simulateContract({
      contractId: this.WebAuthnFactoryContractId,
      method: "deploy",
      args: [xdr.ScVal.scvBytes(hash(keyId)), xdr.ScVal.scvBytes(keyId), xdr.ScVal.scvBytes(publicKey)],
    });

    _broadcastStatus("🚀 Deploying passkey smart wallet...", false);
    const successResp = await this.sorobanService.callContract({ tx, simulationResponse });
    const contractId = Address.fromScVal(successResp.returnValue!).toString();
    this.wallet = { keyId: base64url(keyId), contractId };

    const publicKeyStr = base64url(Buffer.from(publicKey));
    _broadcastStatus("✅ Passkey smart wallet deployed!", true);
    console.log(
      `✅ registered contract (${contractId}) with passkey (keyId: ${this.wallet.keyId}, pubKey: ${publicKeyStr}`,
    );

    await new Promise((resolve) => setTimeout(resolve, 1500));

    return this.wallet;
  }

  public async connectPasskey(): Promise<Wallet> {
    const keyId = await this.passkeyService.connectPasskey();
    if (!keyId) {
      throw new Error("No `keyId` was found");
    }

    const contractId = this.sorobanService.getContractIdFromKeyId({
      keyId,
      factoryContractId: this.WebAuthnFactoryContractId,
    });

    this.wallet = { keyId, contractId };

    return this.wallet;
  }
}
