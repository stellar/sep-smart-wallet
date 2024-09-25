import { useMutation } from "@tanstack/react-query";

import { ScConvert } from "@/helpers/ScConvert";
import { SorobanService } from "@/services/SorobanService";

type TokenBalanceProps = {
  accountId: string;
  contractId: string;
};

export const useBalance = () => {
  const mutation = useMutation<bigint, Error, TokenBalanceProps>({
    mutationFn: async ({ accountId, contractId }: TokenBalanceProps) => {
      const ss = new SorobanService();
      const { simulationResponse } = await ss.simulateContract({
        contractId,
        method: "balance",
        args: [ScConvert.accountIdToScVal(accountId)],
      });

      return ScConvert.scValToBigInt(simulationResponse.result!.retval);
    },
  });

  return mutation;
};
