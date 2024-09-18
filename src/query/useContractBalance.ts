import { useMutation } from "@tanstack/react-query";

import { SvConvert } from "@/helpers/SvConvert";
import { simulateContract } from "@/helpers/callContract";
import { SimulationResult } from "@/types/types";

type TokenBalanceProps = {
  sourceAccPubKey: string;
  accountId: string;
  contractId: string;
};

export const useContractBalance = () => {
  const mutation = useMutation<SimulationResult, Error, TokenBalanceProps>({
    mutationFn: async ({ sourceAccPubKey, accountId, contractId }: TokenBalanceProps) => {
      return await simulateContract({
        sourceAccPubKey,
        contractId,
        method: "balance",
        args: [SvConvert.accountIdToScVal(accountId)],
      });
    },
  });

  return mutation;
};
