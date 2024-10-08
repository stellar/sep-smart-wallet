import { useMutation } from "@tanstack/react-query";

import { SmartWalletService } from "@/services/SmartWalletService";
import { BroadcastPasskeySmartWalletCreationFn, Wallet } from "@/types/types";

type RegisterPasskeyArgs = {
  projectName: string;
  userName: string;
  broadcastStatus?: BroadcastPasskeySmartWalletCreationFn;
};

export const useRegisterPasskey = () => {
  const mutation = useMutation<Wallet, Error, RegisterPasskeyArgs>({
    mutationFn: async ({ projectName, userName, broadcastStatus }: RegisterPasskeyArgs) => {
      const swService = SmartWalletService.getInstance();
      return await swService.createPasskeyContract(projectName, userName, broadcastStatus);
    },
  });

  return mutation;
};
