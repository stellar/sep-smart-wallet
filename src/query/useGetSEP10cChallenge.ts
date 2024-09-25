import { useMutation } from "@tanstack/react-query";

import { SEP10cService } from "@/services/SEP10cService";
import { GetSEP10cChallengeResponse, SEP10cClient } from "@/types/types";

type GetSEP10cChallengeProps = {
  address: string;
  sep10cClient: SEP10cClient;
};

export const useGetSEP10cChallenge = () => {
  const mutation = useMutation<GetSEP10cChallengeResponse, Error, GetSEP10cChallengeProps>({
    mutationFn: async ({ address, sep10cClient }: { address: string; sep10cClient: SEP10cClient }) => {
      let server = new SEP10cService(sep10cClient);
      return await server.getSEP10cChallenge({ address });
    },
  });

  return mutation;
};
