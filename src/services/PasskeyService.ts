import { AuthenticatorAttestationResponseJSON } from "@simplewebauthn/types";
import { startRegistration } from "@simplewebauthn/browser";
import { Buffer } from "buffer";

import { PROJECT } from "@/config/settings";
import base64url from "@/helpers/base64url";

export class PasskeyService {
  private static instance: PasskeyService;

  public static getInstance(): PasskeyService {
    if (!PasskeyService.instance) {
      PasskeyService.instance = new PasskeyService();
    }

    return PasskeyService.instance;
  }

  public domain: string;
  public keyId?: string;

  constructor() {
    this.domain = PROJECT.DOMAIN;

    console.log(`PasskeyService initialized with domain: ${this.domain}`);
  }

  public withDomain(domain: string): PasskeyService {
    this.domain = domain;

    console.log(`PasskeyService domain set to:  ${this.domain}`);
    return this;
  }

  // const user = prompt("Give this passkey a name");
  // const {
  //     keyId: kid,
  //     contractId: cid,
  //     xdr,
  // } = await account.createWallet("Super Peach", user);
  // const { keyId, publicKey } = await this.createKey(app, user)
  public async registerPasskey(
    app: string,
    user: string,
    settings?: {
      rpId?: string;
      authenticatorSelection?: AuthenticatorSelectionCriteria;
    },
  ) {
    const bstr = Buffer.from("ladies and gentlemen we are floating in space").toString("base64");
    console.log(bstr);

    console.log("user: ", user);
    const now = new Date();
    const displayName = `${user} — ${now.toLocaleString()}`;
    const { rpId, authenticatorSelection } = settings || {};
    const { id, response } = await startRegistration({
      challenge: base64url("stellaristhebetterblockchain"),
      rp: {
        id: rpId,
        name: app,
      },
      user: {
        id: base64url(`${user}:${now.getTime()}:${Math.random()}`),
        name: displayName,
        displayName,
      },
      authenticatorSelection,
      // authenticatorSelection: {
      //     requireResidentKey: false,
      //     residentKey: "preferred",
      //     userVerification: "discouraged",
      // },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      // attestation: "none",
      // timeout: 120_000,
    });

    if (!this.keyId) this.keyId = id;

    return {
      keyId: base64url.toBuffer(id),
      publicKey: await this.getPublicKey(response),
    };
  }

  private async getPublicKey(response: AuthenticatorAttestationResponseJSON) {
    let publicKey: Buffer | undefined;

    if (response.publicKey) {
      publicKey = base64url.toBuffer(response.publicKey);
      publicKey = publicKey?.slice(publicKey.length - 65);
    }

    if (!publicKey || publicKey[0] !== 0x04 || publicKey.length !== 65) {
      let x: Buffer;
      let y: Buffer;

      if (response.authenticatorData) {
        const authenticatorData = base64url.toBuffer(response.authenticatorData);
        const credentialIdLength = (authenticatorData[53] << 8) | authenticatorData[54];

        x = authenticatorData.slice(65 + credentialIdLength, 97 + credentialIdLength);
        y = authenticatorData.slice(100 + credentialIdLength, 132 + credentialIdLength);
      } else {
        const attestationObject = base64url.toBuffer(response.attestationObject);

        let publicKeykPrefixSlice = Buffer.from([0xa5, 0x01, 0x02, 0x03, 0x26, 0x20, 0x01, 0x21, 0x58, 0x20]);
        let startIndex = attestationObject.indexOf(publicKeykPrefixSlice);
        startIndex = startIndex + publicKeykPrefixSlice.length;

        x = attestationObject.slice(startIndex, 32 + startIndex);
        y = attestationObject.slice(35 + startIndex, 67 + startIndex);
      }

      publicKey = Buffer.from([
        0x04, // (0x04 prefix) https://en.bitcoin.it/wiki/Elliptic_Curve_Digital_Signature_Algorithm
        ...x,
        ...y,
      ]);
    }

    /* TODO 
        - We're doing some pretty "smart" public key decoding stuff so we should verify the signature against this final public key before assuming it's safe to use and save on-chain
            Given that `startRegistration` doesn't produce a signature, verifying we've got the correct public key isn't really possible
            @Later
    */

    console.log("publicKey bytes:  ", publicKey);
    console.log("publicKey string: ", base64url(Buffer.from(publicKey)));

    return publicKey;
  }
}
