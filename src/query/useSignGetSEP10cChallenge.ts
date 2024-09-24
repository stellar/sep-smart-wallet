import { xdr } from "@stellar/stellar-sdk";
import { useMutation } from "@tanstack/react-query";

import { SEP10cService } from "@/services/SEP10cService";
import { SEP10cClientToml } from "@/services/SEP10cClientToml";
import { ContractSigner } from "@/types/types";

type SignAuthEntryProps = {
  authEntry: string | xdr.SorobanAuthorizationEntry;
  signer: ContractSigner;
};

export const useSignGetSEP10cChallenge = () => {
  const mutation = useMutation<string, Error, SignAuthEntryProps>({
    mutationFn: async ({ authEntry, signer }: SignAuthEntryProps) => {
      const server = new SEP10cService().withSEP10cClient(new SEP10cClientToml("http://localhost:8080"));
      return await server.signAuthEntry({ authEntry, signer });
    },
  });

  return mutation;
};
