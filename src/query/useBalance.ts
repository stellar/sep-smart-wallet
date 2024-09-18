import { useMutation } from "@tanstack/react-query";

import { SvConvert } from "@/helpers/SvConvert";
import { SimulationResult } from "@/types/types";
import { SorobanService } from "@/helpers/SorobanService";

type TokenBalanceProps = {
  accountId: string;
  contractId: string;
};

export const useBalance = () => {
  const mutation = useMutation<SimulationResult, Error, TokenBalanceProps>({
    mutationFn: async ({ accountId, contractId }: TokenBalanceProps) => {
      const ss = new SorobanService();
      return await ss.simulateContract({
        contractId,
        method: "balance",
        args: [SvConvert.accountIdToScVal(accountId)],
      });
    },
  });

  return mutation;
};
