import { AuthenticationResponseJSON } from "@simplewebauthn/types";
import { rpc, Transaction, xdr } from "@stellar/stellar-sdk";

import { AuthEntrySigner } from "@/services/AuthEntrySigner";

export type ContractSigner = {
  addressId: string;
  method: AuthEntrySigner;
};

export type SimulationResult = {
  tx: Transaction;
  simulationResponse: rpc.Api.SimulateTransactionSuccessResponse;
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

// const wantResponseFormat = {
//   "transactionData":"AAAAAAAAAAEAAAAGAAAAAdeSi3LCcDzP6vfrn/TvTVBKVai5efybRQ6iyEK00c5hAAAAFAAAAAEAAAABAAAAAAAAAACq06FwdYASPm62r7Y6qjkyT7XcZSPbvsAWi+plS/23bgADJzkAAAGIAAAAkAAAAAAAAVb7",
//   "events":[
//     "AAAAAQAAAAAAAAAAAAAAAgAAAAAAAAADAAAADwAAAAdmbl9jYWxsAAAAAA0AAAAg15KLcsJwPM/q9+uf9O9NUEpVqLl5/JtFDqLIQrTRzmEAAAAPAAAACHRyYW5zZmVyAAAAEAAAAAEAAAADAAAAEgAAAAAAAAAAqtOhcHWAEj5utq+2Oqo5Mk+13GUj277AFovqZUv9t24AAAASAAAAAAAAAACq06FwdYASPm62r7Y6qjkyT7XcZSPbvsAWi+plS/23bgAAAAoAAAAAAAAAAAAAAAAF9eEA",
//     "AAAAAQAAAAAAAAAB15KLcsJwPM/q9+uf9O9NUEpVqLl5/JtFDqLIQrTRzmEAAAABAAAAAAAAAAQAAAAPAAAACHRyYW5zZmVyAAAAEgAAAAAAAAAAqtOhcHWAEj5utq+2Oqo5Mk+13GUj277AFovqZUv9t24AAAASAAAAAAAAAACq06FwdYASPm62r7Y6qjkyT7XcZSPbvsAWi+plS/23bgAAAA4AAAAGbmF0aXZlAAAAAAAKAAAAAAAAAAAAAAAABfXhAA==",
//     "AAAAAQAAAAAAAAAB15KLcsJwPM/q9+uf9O9NUEpVqLl5/JtFDqLIQrTRzmEAAAACAAAAAAAAAAIAAAAPAAAACWZuX3JldHVybgAAAAAAAA8AAAAIdHJhbnNmZXIAAAAB"
//   ],
//   "minResourceFee":"87803",
//   "results":[
//     {
//       "auth":[
//         "AAAAAAAAAAAAAAAB15KLcsJwPM/q9+uf9O9NUEpVqLl5/JtFDqLIQrTRzmEAAAAIdHJhbnNmZXIAAAADAAAAEgAAAAAAAAAAqtOhcHWAEj5utq+2Oqo5Mk+13GUj277AFovqZUv9t24AAAASAAAAAAAAAACq06FwdYASPm62r7Y6qjkyT7XcZSPbvsAWi+plS/23bgAAAAoAAAAAAAAAAAAAAAAF9eEAAAAAAA=="
//       ],
//       "xdr":"AAAAAQ=="
//     }
//   ],
//   "latestLedger":832124,
//   "stateChanges":[
//     {
//       "type":"updated",
//       "key":"AAAAAAAAAACq06FwdYASPm62r7Y6qjkyT7XcZSPbvsAWi+plS/23bg==",
//       "before":"AAypWgAAAAAAAAAAqtOhcHWAEj5utq+2Oqo5Mk+13GUj277AFovqZUv9t24AAAAXQxmdgAAH7MYAAAAAAAAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAA",
//       "after":"AAAAAAAAAAAAAAAAqtOhcHWAEj5utq+2Oqo5Mk+13GUj277AFovqZUv9t24AAAAXQxmdgAAH7MYAAAAAAAAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAA"
//     }
//   ]
// }

export type xdrResult = {
  auth: string[];
  xdr: string;
};
export type xdrStateChange = {
  type: string;
  key: string;
  before: string | undefined;
  after: string | undefined;
};
export type SimulationResponse = {
  transactionData: string;
  events: string[]; // ✅
  minResourceFee: string; // ✅
  /** present only for invocation simulation */
  results?: xdrResult[]; // ✅
  /** State Difference information */
  stateChanges?: xdrStateChange[]; // ✅
  /** always present: the LCL known to the server when responding */
  latestLedger: number; // ✅
};

export const NewSimulationResponse = (
  rpcSimulationResponse: rpc.Api.SimulateTransactionSuccessResponse,
): SimulationResponse => {
  const events = rpcSimulationResponse.events.map((xdrEvent) => xdrEvent.toXDR("base64"));
  const results = [
    {
      xdr: rpcSimulationResponse.result!.retval.toXDR("base64"),
      auth: rpcSimulationResponse.result!.auth.map((xdrAuth) => xdrAuth.toXDR("base64")),
    },
  ];
  const stateChanges = rpcSimulationResponse.stateChanges?.map((xdrStateChange) => ({
    type: `${xdrStateChange.type}`,
    key: xdrStateChange.key.toXDR("base64"),
    before: xdrStateChange.before?.toXDR("base64"),
    after: xdrStateChange.after?.toXDR("base64"),
  }));
  const transactionData = rpcSimulationResponse.transactionData.build().toXDR("base64");
  return {
    events,
    latestLedger: rpcSimulationResponse.latestLedger,
    minResourceFee: rpcSimulationResponse.minResourceFee,
    results,
    stateChanges,
    transactionData,
  };
};

/**
 * Represents a Stellar transaction data that will be used to build a new transaction with a Channel Account as the source.
 *
 * @property operations - An array of operations in XDR format.
 * @property timeout - The timeout in seconds.
 */
export type WBTransaction = {
  operations: string[];
  simulationResult: SimulationResponse;
  timeout: number;
};

/**
 * Represents a request to build a new transaction with a Channel Account as the source.
 *
 * @property transactions - An array of transactions to be built.
 */
export type BuildTransactionsRequest = {
  transactions: WBTransaction[];
};

/**
 * Represents a response from the Wallet Backend containing the built transactions in XDR format.
 *
 * @property transactionxdrs - An array of built transactions in XDR format.
 */
export type BuildTransactionsResponse = {
  transactionXdrs: string[];
};

/**
 * Represents a request to create a fee bump transaction.
 *
 * @property transaction - A base64 encoded XDR transaction.
 */
export type CreateFeeBumpTransactionRequest = {
  transaction: string;
};

/**
 * Represents a response from the Wallet Backend containing the fee bump transaction in XDR format.
 *
 * @property transaction - A base64 encoded XDR transaction.
 * @property networkPassphrase - The network passphrase.
 */
export type TransactionEnvelopeResponse = {
  transaction: string;
  networkPassphrase: string;
};
