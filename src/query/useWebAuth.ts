import { nativeToScVal } from "@stellar/stellar-sdk";
import { useMutation } from "@tanstack/react-query";

import { SorobanService } from "@/helpers/SorobanService";
import { ContractSigner } from "@/types/types";

type WebAuthProps = {
  contractId: string;
  signer: ContractSigner;
};

export const useWebAuth = () => {
  const mutation = useMutation<boolean, Error, WebAuthProps>({
    mutationFn: async ({ contractId, signer }: WebAuthProps) => {
      const mapEntries = nativeToScVal({
        account: signer.addressId,
      });

      const ss = new SorobanService();
      await ss.simulateContract({
        contractId,
        method: "web_auth_verify",
        args: [mapEntries],
        signers: [signer],
      });

      return true;
    },
  });

  return mutation;
};
