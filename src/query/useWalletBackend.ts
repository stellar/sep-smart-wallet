import { useMutation } from "@tanstack/react-query";

import { WalletBackendService } from "@/services/WalletBackendService";

export const useGetPayments = () => {
  const mutation = useMutation<any, Error>({
    mutationFn: async () => {
      const wbs = WalletBackendService.getInstance();
      return wbs.getPayments();
    },
  });

  return mutation;
};
