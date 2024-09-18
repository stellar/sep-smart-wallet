import { Keypair, SigningCallback, SorobanRpc, Transaction, xdr } from "@stellar/stellar-sdk";

export type ContractSigner = {
  addressId: string;
  method: Keypair | SigningCallback;
};

export type SimulationResult = {
  tx: Transaction;
  simulationResponse: SorobanRpc.Api.SimulateTransactionSuccessResponse;
};

export type SorobanEntryAddress = {
  id: string;
  type: xdr.ScAddressType; // xdr.ScAddressType.scAddressTypeAccount() | xdr.ScAddressType.scAddressTypeContract();
  scAddress: xdr.ScAddress;
};
