import { XdrLargeInt, SorobanRpc } from "@stellar/stellar-sdk";
import { useMutation } from "@tanstack/react-query";

import { callContract } from "@/helpers/callContract";
import { SvConvert } from "@/helpers/SvConvert";
import { ContractSigner } from "@/types/types";

type TokenTransferProps = {
  contractId: string;
  fromAccId: string;
  toAccId: string;
  amount: string;
  signer?: ContractSigner;
};

export const useTransfer = () => {
  const mutation = useMutation<SorobanRpc.Api.GetSuccessfulTransactionResponse, Error, TokenTransferProps>({
    mutationFn: async ({ contractId, fromAccId, toAccId, amount, signer }: TokenTransferProps) => {
      const scFrom = SvConvert.accountIdToScVal(fromAccId);
      const scTo = SvConvert.accountIdToScVal(toAccId);
      const scAmount = new XdrLargeInt("i128", amount).toScVal();

      return await callContract({
        contractId,
        method: "transfer",
        args: [scFrom, scTo, scAmount],
        signer,
      });
    },
  });

  return mutation;
};
