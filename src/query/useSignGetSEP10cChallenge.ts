import { useMutation } from "@tanstack/react-query";

import { SEP10cService } from "@/helpers/SEP10cService";
import { ContractSigner } from "@/types/types";
import { xdr } from "@stellar/stellar-sdk";

type SignAuthEntryProps = {
  authEntry: string | xdr.SorobanAuthorizationEntry;
  signer: ContractSigner;
};

export const useSignGetSEP10cChallenge = () => {
  const mutation = useMutation<string, Error, SignAuthEntryProps>({
    mutationFn: async ({ authEntry, signer }: SignAuthEntryProps) => {
      const server = new SEP10cService();
      return await server.signAuthEntry({ authEntry, signer });
    },
  });

  return mutation;
};
