import { useMutation } from "@tanstack/react-query";
import { PasskeyService } from "@/helpers/PasskeyService";

type RegisterPasskeyArgs = {
  projectName: string;
  userName: string;
};

export const useRegisterPasskey = () => {
  const mutation = useMutation<boolean, Error, RegisterPasskeyArgs>({
    mutationFn: async ({ projectName, userName }: RegisterPasskeyArgs) => {
      const passkeyService = PasskeyService.getInstance();
      const { keyId, publicKey } = await passkeyService.registerPasskey(projectName, userName);

      console.log(`Successfully registered passkey with keyId: ${keyId} and publicKey: ${publicKey}`);

      return true;
    },
  });

  return mutation;
};
