import { Keypair, SigningCallback, xdr } from "@stellar/stellar-sdk";

export type ContractSigner = {
  addressId: string;
  method: Keypair | SigningCallback;
};

export type SorobanEntryAddress = {
  id: string;
  type: xdr.ScAddressType; // xdr.ScAddressType.scAddressTypeAccount() | xdr.ScAddressType.scAddressTypeContract();
  scAddress: xdr.ScAddress;
};
