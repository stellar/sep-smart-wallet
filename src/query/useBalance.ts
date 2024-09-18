import { useMutation } from "@tanstack/react-query";

import { SvConvert } from "@/helpers/SvConvert";
import { SorobanService } from "@/helpers/SorobanService";

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
        args: [SvConvert.accountIdToScVal(accountId)],
      });

      return SvConvert.scValToBigInt(simulationResponse.result!.retval);
    },
  });

  return mutation;
};
