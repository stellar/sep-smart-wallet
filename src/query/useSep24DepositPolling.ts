import { useMutation } from "@tanstack/react-query";
import { pollSep24Deposit } from "@/helpers/pollSep24Deposit";
import { TransactionStatus } from "@/types/types";

type UseSep24DepositPollingProps = {
  sep24TransferServerUrl: string;
  token: string;
  transactionId: string;
};

export const useSep24DepositPolling = () => {
  const mutation = useMutation<TransactionStatus, Error, UseSep24DepositPollingProps>({
    mutationFn: async ({ sep24TransferServerUrl, token, transactionId }) => {
      return await pollSep24Deposit({ sep24TransferServerUrl, token, transactionId });
    },
  });

  return mutation;
};
