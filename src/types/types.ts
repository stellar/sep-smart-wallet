import { Keypair, SigningCallback } from "@stellar/stellar-sdk";

export type ContractSigner = {
  addressId: string;
  method: Keypair | SigningCallback;
};
