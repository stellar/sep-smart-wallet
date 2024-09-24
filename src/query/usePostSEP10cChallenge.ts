import { useMutation } from "@tanstack/react-query";

import { SEP10cService } from "@/services/SEP10cService";
import { PostSEP10cChallengeRequest } from "@/types/types";
import { SEP10cClientToml } from "@/services/SEP10cClientToml";

export const usePostSEP10cChallenge = () => {
  const mutation = useMutation<string, Error, PostSEP10cChallengeRequest>({
    mutationFn: async (req: PostSEP10cChallengeRequest) => {
      const server = new SEP10cService().withSEP10cClient(new SEP10cClientToml("http://localhost:8080"));
      return await server.postSEP10cChallenge(req);
    },
  });

  return mutation;
};
