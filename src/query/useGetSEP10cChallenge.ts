import { useMutation } from "@tanstack/react-query";

import { SEP10cClient } from "@/helpers/SEP10cClient";
import { GetSEP10cChallengeRequest, GetSEP10cChallengeResponse } from "@/types/types";

export const useGetSEP10cChallenge = () => {
  const mutation = useMutation<GetSEP10cChallengeResponse, Error, GetSEP10cChallengeRequest>({
    mutationFn: async ({ account: address }: GetSEP10cChallengeRequest) => {
      const server = new SEP10cClient();
      return await server.fetchSEP10cGetChallenge({ account: address });
    },
  });

  return mutation;
};
