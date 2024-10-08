import { AuthenticationResponseJSON } from "@simplewebauthn/types";
import { SorobanRpc, Transaction, xdr } from "@stellar/stellar-sdk";

import { AuthEntrySigner } from "@/services/AuthEntrySigner";

export type ContractSigner = {
  addressId: string;
  method: AuthEntrySigner;
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

export type PasscodeSignature = {
  authenticationResponse: AuthenticationResponseJSON;
  compactSignature: Buffer;
};

export enum TransactionStatus {
  COMPLETED = "completed",
  ERROR = "error",
  INCOMPLETE = "incomplete",
  NON_INTERACTIVE_CUSTOMER_INFO_NEEDED = "non_interactive_customer_info_needed",
  PENDING_ANCHOR = "pending_anchor",
  PENDING_CUSTOMER_INFO_UPDATE = "pending_customer_info_update",
  PENDING_EXTERNAL = "pending_external",
  PENDING_RECEIVER = "pending_receiver",
  PENDING_SENDER = "pending_sender",
  PENDING_STELLAR = "pending_stellar",
  PENDING_TRANSACTION_INFO_UPDATE = "pending_transaction_info_update",
  PENDING_TRUST = "pending_trust",
  PENDING_USER = "pending_user",
  PENDING_USER_TRANSFER_START = "pending_user_transfer_start",
}

export type BroadcastStatusFn = (txStatus: TransactionStatus, message: string, isFinal: boolean) => void;
export type BroadcastPasskeySmartWalletCreationFn = (message: string, isFinal: boolean) => void;

const END_STATUS = [TransactionStatus.PENDING_EXTERNAL, TransactionStatus.COMPLETED, TransactionStatus.ERROR];
export const isFinal = (txStatus: TransactionStatus): boolean => {
  return END_STATUS.includes(txStatus);
};
