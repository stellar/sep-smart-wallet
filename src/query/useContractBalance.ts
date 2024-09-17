import { useMutation } from "@tanstack/react-query";
import { SorobanRpc } from "@stellar/stellar-sdk";

import { SvConvert } from "@/helpers/SvConvert";
import { callContract } from "@/helpers/callContract";

type TokenBalanceProps = {
  accountId: string;
  contractId: string;
};

export const useContractBalance = () => {
  const mutation = useMutation<SorobanRpc.Api.GetSuccessfulTransactionResponse, Error, TokenBalanceProps>({
    mutationFn: async ({ accountId, contractId }: TokenBalanceProps) => {
      return await callContract({
        contractId,
        method: "balance",
        args: [SvConvert.accountIdToScVal(accountId)],
      });
    },
  });

  return mutation;
};
