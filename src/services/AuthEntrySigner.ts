import { Buffer } from "buffer";
import { authorizeEntry, hash, Keypair, xdr } from "@stellar/stellar-sdk";

import base64url from "@/helpers/base64url";
import { PasskeyService } from "@/services/PasskeyService";

type AuthorizeEntryProps = {
  entry: xdr.SorobanAuthorizationEntry;
  validUntilLedgerSeq: number;
  networkPassphrase: string;
};

export class AuthEntrySigner {
  public type: "Keypair" | "PasskeyService";
  public passkeyKeyId?: string;
  public keypairSecret?: string;

  constructor({
    type,
    passkeyKeyId,
    keypairSecret,
  }: {
    type: "Keypair" | "PasskeyService";
    passkeyKeyId?: string;
    keypairSecret?: string;
  }) {
    this.type = type;
    this.passkeyKeyId = passkeyKeyId;
    this.keypairSecret = keypairSecret;
  }

  public static fromKeypairSecret(secret: string): AuthEntrySigner {
    return new AuthEntrySigner({
      type: "Keypair",
      keypairSecret: secret,
    });
  }

  public static fromPasskeyKeyId(keyId: string): AuthEntrySigner {
    return new AuthEntrySigner({
      type: "PasskeyService",
      passkeyKeyId: keyId,
    });
  }

  /**
   * Converts the AuthEntrySigner instance to a Keypair.
   *
   * @throws {Error} If the type of AuthEntrySigner is not "Keypair".
   * @throws {Error} If the keypairSecret is undefined.
   * @returns {Keypair} The converted Keypair instance.
   */
  public toKeypair(): Keypair {
    if (this.type !== "Keypair") {
      throw new Error(`Invalid type ${this.type}. Expected "Keypair".`);
    }

    if (this.keypairSecret === undefined) {
      throw new Error("keypairSecret is required.");
    }

    return Keypair.fromSecret(this.keypairSecret);
  }

  /**
   * Converts the current instance to a PasskeyService object.
   *
   * @throws {Error} If the type is not "PasskeyService".
   * @throws {Error} If passkeyKeyId is undefined.
   * @returns {PasskeyService} The converted PasskeyService object.
   */
  public toPasskeyService(): PasskeyService {
    if (this.type !== "PasskeyService") {
      throw new Error(`Invalid type ${this.type}. Expected "PasskeyService".`);
    }

    if (this.passkeyKeyId === undefined) {
      throw new Error("passkeyKeyId is required");
    }

    const passkeyService = PasskeyService.getInstance();
    passkeyService.keyId = this.passkeyKeyId;
    return passkeyService;
  }

  /**
   * Authorizes an entry with a keypair or a passkey service, depending on the type.
   *
   * @param entry - The entry to authorize.
   * @param validUntilLedgerSeq - The valid until ledger sequence.
   * @param networkPassphrase - The network passphrase.
   * @returns A Promise that resolves to a SorobanAuthorizationEntry.
   * @throws Error if the type is invalid.r   */
  public async authorizeEntry({
    entry,
    validUntilLedgerSeq,
    networkPassphrase,
  }: AuthorizeEntryProps): Promise<xdr.SorobanAuthorizationEntry> {
    if (this.type === "Keypair") {
      return this.authorizeEntryWithKeypair({ entry, validUntilLedgerSeq, networkPassphrase });
    } else if (this.type === "PasskeyService") {
      return this.authorizeEntryWithPasskeyService({ entry, validUntilLedgerSeq, networkPassphrase });
    } else {
      throw new Error(`Invalid type ${this.type}. Expected "Keypair" or "PasskeyService".`);
    }
  }

  /**
   * Authorizes an entry with a keypair.
   *
   * @param entry - The entry to authorize.
   * @param validUntilLedgerSeq - The valid until ledger sequence.
   * @param networkPassphrase - The network passphrase.
   * @returns A Promise that resolves to a SorobanAuthorizationEntry.
   */
  private async authorizeEntryWithKeypair({
    entry,
    validUntilLedgerSeq,
    networkPassphrase,
  }: AuthorizeEntryProps): Promise<xdr.SorobanAuthorizationEntry> {
    return authorizeEntry(entry, this.toKeypair(), validUntilLedgerSeq, networkPassphrase);
  }

  /**
   * Authorizes an entry with a passkey service.
   *
   * @param entry - The unsigned entry to authorize.
   * @param validUntilLedgerSeq - The sequence number of the ledger until which the signature is valid.
   * @param networkPassphrase - The network passphrase.
   * @returns A Promise that resolves to a SorobanAuthorizationEntry.
   */
  private async authorizeEntryWithPasskeyService({
    entry: unsignedEntry,
    validUntilLedgerSeq,
    networkPassphrase,
  }: AuthorizeEntryProps): Promise<xdr.SorobanAuthorizationEntry> {
    const entry = xdr.SorobanAuthorizationEntry.fromXDR(unsignedEntry.toXDR());
    const addressCredentials = entry.credentials().address();
    addressCredentials.signatureExpirationLedger(validUntilLedgerSeq);

    const preimage = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
      new xdr.HashIdPreimageSorobanAuthorization({
        networkId: hash(Buffer.from(networkPassphrase)),
        nonce: addressCredentials.nonce(),
        signatureExpirationLedger: addressCredentials.signatureExpirationLedger(),
        invocation: entry.rootInvocation(),
      }),
    );
    const payload = hash(preimage.toXDR());

    const { compactSignature, authenticationResponse } = await this.toPasskeyService().signPayload(payload);

    addressCredentials.signature(
      xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol("authenticator_data"),
          val: xdr.ScVal.scvBytes(base64url.toBuffer(authenticationResponse.response.authenticatorData)),
        }),
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol("client_data_json"),
          val: xdr.ScVal.scvBytes(base64url.toBuffer(authenticationResponse.response.clientDataJSON)),
        }),
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol("id"),
          val: xdr.ScVal.scvBytes(base64url.toBuffer(authenticationResponse.id)),
        }),
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol("signature"),
          val: xdr.ScVal.scvBytes(compactSignature),
        }),
      ]),
    );

    return entry;
  }
}
