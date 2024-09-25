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

export type GetSEP10cChallengeRequest = {
  address: string;
  memo?: string;
  home_domain?: string;
  client_domain?: string;
};

export type GetSEP10cChallengeResponse = {
  // authorization_entry is a XDR string representation of xdr.SorobanAuthorizationEntry
  authorization_entry: string;
  // server_signature is a XDR string representation of xdr.SorobanSignature
  server_signature: string;
};

export type PostSEP10cChallengeRequest = {
  // authorization_entry is a XDR string representation of xdr.SorobanAuthorizationEntry
  authorization_entry: string;
  server_signature: string;
  credentials: string[];
};

export type PostSEP10cChallengeResponse = {
  // token is a jwt token
  token: string;
};

export type TokenInfo = {
  name: string;
  contractId: string;
};

export type Wallet = {
  keyId: string;
  contractId: string;
};

export interface SEP10cClient {
  getSep10cInfo: () => Promise<SEP10cInfo>;
  getSEP10cChallenge: (req: GetSEP10cChallengeRequest) => Promise<GetSEP10cChallengeResponse>;
  postSEP10cChallenge: (req: PostSEP10cChallengeRequest) => Promise<PostSEP10cChallengeResponse>;
}

export type SEP10cInfo = {
  signingKey: string;
  webAuthContractId: string;
  webAuthEndpointC?: string;
};
