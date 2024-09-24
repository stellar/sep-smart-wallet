import { useMutation } from "@tanstack/react-query";

import { SmartWalletService } from "@/services/SmartWalletService";
import { Wallet } from "@/types/types";

export const useConnectPasskey = () => {
  const mutation = useMutation<Wallet, Error, void>({
    mutationFn: async () => {
      const swService = SmartWalletService.getInstance();
      return await swService.connectPasskey();
    },
  });

  return mutation;
};
