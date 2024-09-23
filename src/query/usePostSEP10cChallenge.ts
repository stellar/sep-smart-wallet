import { useMutation } from "@tanstack/react-query";

import { SEP10cService } from "@/helpers/SEP10cService";
import { PostSEP10cChallengeRequest } from "@/types/types";

export const usePostSEP10cChallenge = () => {
  const mutation = useMutation<string, Error, PostSEP10cChallengeRequest>({
    mutationFn: async (req: PostSEP10cChallengeRequest) => {
      const server = new SEP10cService();
      return await server.postSEP10cChallenge(req);
    },
  });

  return mutation;
};
