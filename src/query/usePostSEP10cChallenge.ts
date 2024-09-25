import { useMutation } from "@tanstack/react-query";

import { SEP10cService } from "@/services/SEP10cService";
import { PostSEP10cChallengeRequest, SEP10cClient } from "@/types/types";

type PostSEP10cChallengeProps = {
  req: PostSEP10cChallengeRequest;
  sep10cClient: SEP10cClient;
};

export const usePostSEP10cChallenge = () => {
  const mutation = useMutation<string, Error, PostSEP10cChallengeProps>({
    mutationFn: async ({ req, sep10cClient }: PostSEP10cChallengeProps) => {
      const server = new SEP10cService(sep10cClient);
      return await server.postSEP10cChallenge(req);
    },
  });

  return mutation;
};
