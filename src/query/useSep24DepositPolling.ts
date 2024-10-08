import { useMutation } from "@tanstack/react-query";
import { pollSep24Deposit } from "@/helpers/pollSep24Deposit";
import { BroadcastStatusFn, TransactionStatus } from "@/types/types";

type UseSep24DepositPollingProps = {
  sep24TransferServerUrl: string;
  sep10Token: string;
  transactionId: string;
  broadcastStatus: BroadcastStatusFn;
};

export const useSep24DepositPolling = () => {
  const mutation = useMutation<TransactionStatus, Error, UseSep24DepositPollingProps>({
    mutationFn: async ({ sep24TransferServerUrl, sep10Token, transactionId, broadcastStatus }) => {
      return await pollSep24Deposit({ sep24TransferServerUrl, sep10Token, transactionId, broadcastStatus });
    },
  });

  return mutation;
};
