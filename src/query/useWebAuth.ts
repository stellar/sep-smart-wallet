import { nativeToScVal } from "@stellar/stellar-sdk";
import { useMutation } from "@tanstack/react-query";

import { SorobanService } from "@/services/SorobanService";
import { ContractSigner } from "@/types/types";

type WebAuthProps = {
  signer: ContractSigner;
};

// contract deployed from https://github.com/philipliu/demo/blob/708390d210a12310b93096039301f1036cd41b35/auth_contract/contracts/custom_account/src/lib.rs
const webAuthContractId = "CCB7YGKACB5LDXDATYBTC37DXD63LBRR76HZTAXBJJR47JMF5JBNRF4D";

export const useWebAuth = () => {
  const mutation = useMutation<boolean, Error, WebAuthProps>({
    mutationFn: async ({ signer }: WebAuthProps) => {
      const mapEntries = nativeToScVal({
        account: signer.addressId,
      });

      const ss = new SorobanService();
      await ss.simulateContract({
        contractId: webAuthContractId,
        method: "web_auth_verify",
        args: [mapEntries],
        signers: [signer],
      });

      return true;
    },
  });

  return mutation;
};
