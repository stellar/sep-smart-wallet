import { xdr } from "@stellar/stellar-sdk";
import { useMutation } from "@tanstack/react-query";

import { SEP10cService } from "@/services/SEP10cService";
import { ContractSigner, SEP10cClient } from "@/types/types";

type SignAuthEntryProps = {
  authEntry: string | xdr.SorobanAuthorizationEntry;
  signer: ContractSigner;
  sep10cClient: SEP10cClient;
};

export const useSignGetSEP10cChallenge = () => {
  const mutation = useMutation<string, Error, SignAuthEntryProps>({
    mutationFn: async ({ authEntry, signer, sep10cClient }: SignAuthEntryProps) => {
      const server = new SEP10cService(sep10cClient);
      return await server.signAuthEntry({ authEntry, signer });
    },
  });

  return mutation;
};
