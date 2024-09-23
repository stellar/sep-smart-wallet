import { useMutation } from "@tanstack/react-query";
import { Horizon } from "@stellar/stellar-sdk";

type StellarAccountProps = {
  horizonUrl: string;
  publicKey: string;
};

export const useStellarAccount = () => {
  const mutation = useMutation<Horizon.ServerApi.AccountRecord, Error, StellarAccountProps>({
    mutationFn: async ({ horizonUrl, publicKey }: StellarAccountProps) => {
      const server = new Horizon.Server(horizonUrl);
      return await server.accounts().accountId(publicKey).call();
    },
  });

  return mutation;
};
