import { useMutation } from "@tanstack/react-query";

import { PasskeySorobanManager } from "@/helpers/PasskeySorobanManager";

type RegisterPasskeyArgs = {
  projectName: string;
  userName: string;
};

export const useRegisterPasskey = () => {
  const mutation = useMutation<boolean, Error, RegisterPasskeyArgs>({
    mutationFn: async ({ projectName, userName }: RegisterPasskeyArgs) => {
      const pksManager = PasskeySorobanManager.getInstance();
      await pksManager.createContractPasskey(projectName, userName);

      console.log("Successfully registered passkey!");

      return true;
    },
  });

  return mutation;
};
