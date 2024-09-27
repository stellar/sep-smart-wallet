import { AuthenticatorAttestationResponseJSON } from "@simplewebauthn/types";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
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

  constructor(keyId?: string) {
    this.domain = PROJECT.DOMAIN;
    this.keyId = keyId;
    console.log(`PasskeyService initialized with domain: ${this.domain} and keyId: ${this.keyId}`);
  }

  public withDomain(domain: string): PasskeyService {
    this.domain = domain;
    console.log(`PasskeyService domain set to:  ${this.domain}`);
    return this;
  }

  public async registerPasskey(app: string, user: string) {
    console.log(`registerPasskey: ${app} — ${user}`);
    const now = new Date();
    const displayName = `${user} — ${now.toLocaleString()}`;
    const { id, response } = await startRegistration({
      challenge: base64url("stellaristhebetterblockchain"),
      rp: {
        name: this.domain,
        id: this.domain,
      },
      user: {
        id: base64url(user),
        name: displayName,
        displayName,
      },
      authenticatorSelection: {
        authenticatorAttachment: "platform", // Force the browser to use platform authenticators only
        residentKey: "preferred", // Store passkeys on the device for easier re-authentication
        userVerification: "required", // Require user verification to ensure security
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      attestation: "none",
    });

    this.keyId = base64url(id);

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

    return publicKey;
  }

  public async connectPasskey() {
    const authResponse = await startAuthentication({
      challenge: base64url("stellaristhebetterblockchain"),
      rpId: this.domain,
    });

    this.keyId = authResponse.id;
    return this.keyId;
  }

  public async signPayload(payload: Buffer) {
    if (this.keyId === undefined) {
      throw new Error("No keyId set. Please connect a passkey first.");
    }
    const rpId = this.domain;

    const authenticationResponse = await startAuthentication({
      challenge: base64url(payload),
      rpId,
      allowCredentials: [
        {
          id: this.keyId,
          type: "public-key",
        },
      ],
      // userVerification: "discouraged",
      // timeout: 120_000
    });

    const compactSignature = this.compactSignature(base64url.toBuffer(authenticationResponse.response.signature));
    return { authenticationResponse, compactSignature };
  }

  private compactSignature(signature: Buffer) {
    // Decode the DER signature
    let offset = 2;

    const rLength = signature[offset + 1];
    const r = signature.slice(offset + 2, offset + 2 + rLength);

    offset += 2 + rLength;

    const sLength = signature[offset + 1];
    const s = signature.slice(offset + 2, offset + 2 + sLength);

    // Convert r and s to BigInt
    const rBigInt = BigInt("0x" + r.toString("hex"));
    let sBigInt = BigInt("0x" + s.toString("hex"));

    // Ensure s is in the low-S form
    // https://github.com/stellar/stellar-protocol/discussions/1435#discussioncomment-8809175
    // https://discord.com/channels/897514728459468821/1233048618571927693
    // Define the order of the curve secp256r1
    // https://github.com/RustCrypto/elliptic-curves/blob/master/p256/src/lib.rs#L72
    const n = BigInt("0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551");
    const halfN = n / 2n;

    if (sBigInt > halfN) sBigInt = n - sBigInt;

    // Convert back to buffers and ensure they are 32 bytes
    const rPadded = Buffer.from(rBigInt.toString(16).padStart(64, "0"), "hex");
    const sLowS = Buffer.from(sBigInt.toString(16).padStart(64, "0"), "hex");

    // Concatenate r and low-s
    const concatSignature = Buffer.concat([rPadded, sLowS]);

    return concatSignature;
  }
}
