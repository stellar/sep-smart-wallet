import { useMutation } from "@tanstack/react-query";

import { SEP10cService } from "@/services/SEP10cService";
import { GetSEP10cChallengeRequest, GetSEP10cChallengeResponse } from "@/types/types";
import { SEP10cClientToml } from "@/services/clients/SEP10cClientToml";

export const useGetSEP10cChallenge = () => {
  const mutation = useMutation<GetSEP10cChallengeResponse, Error, GetSEP10cChallengeRequest>({
    mutationFn: async ({ address }: GetSEP10cChallengeRequest) => {
      const server = new SEP10cService().withSEP10cClient(new SEP10cClientToml("http://localhost:8080"));
      return await server.getSEP10cChallenge({ address });
    },
  });

  return mutation;
};
