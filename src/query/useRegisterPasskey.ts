import { useMutation } from "@tanstack/react-query";

import { SmartWalletService } from "@/services/SmartWalletService";
import { Wallet } from "@/types/types";

type RegisterPasskeyArgs = {
  projectName: string;
  userName: string;
};

export const useRegisterPasskey = () => {
  const mutation = useMutation<Wallet, Error, RegisterPasskeyArgs>({
    mutationFn: async ({ projectName, userName }: RegisterPasskeyArgs) => {
      const swService = SmartWalletService.getInstance();
      return await swService.createPasskeyContract(projectName, userName);
    },
  });

  return mutation;
};
