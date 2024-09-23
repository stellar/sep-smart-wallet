import { xdr } from "@stellar/stellar-sdk";
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
      const mapEntries: xdr.ScMapEntry[] = [
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvString("account"),
          val: xdr.ScVal.scvString(signer.addressId),
        }),
      ];

      const ss = new SorobanService();
      await ss.simulateContract({
        contractId,
        method: "web_auth_verify",
        args: [xdr.ScVal.scvMap(mapEntries)],
        signers: [signer],
      });

      return true;
    },
  });

  return mutation;
};
