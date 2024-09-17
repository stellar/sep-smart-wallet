import { Address, scValToBigInt, xdr, XdrLargeInt } from "@stellar/stellar-sdk";

export const SvConvert = {
  accountIdToScVal: (accountId: string): xdr.ScVal => {
    return new Address(accountId).toScVal();
  },
  stringToScVal: (value: string): xdr.ScVal => {
    return new XdrLargeInt("i128", value).toScVal();
  },
  scValToBigInt: (scVal: xdr.ScVal): bigint => {
    return scValToBigInt(scVal);
  },
};
