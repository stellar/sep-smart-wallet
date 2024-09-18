import { XdrLargeInt, SorobanRpc } from "@stellar/stellar-sdk";
import { useMutation } from "@tanstack/react-query";

import { SvConvert } from "@/helpers/SvConvert";
import { ContractSigner } from "@/types/types";
import { SorobanService } from "@/helpers/SorobanService";

type TokenTransferProps = {
  contractId: string;
  fromAccId: string;
  toAccId: string;
  amount: string;
  signer?: ContractSigner;
};

export const useTransfer = () => {
  const mutation = useMutation<SorobanRpc.Api.GetSuccessfulTransactionResponse, Error, TokenTransferProps>({
    mutationFn: async ({ contractId, fromAccId, toAccId, amount, signer }: TokenTransferProps) => {
      const scFrom = SvConvert.accountIdToScVal(fromAccId);
      const scTo = SvConvert.accountIdToScVal(toAccId);
      const scAmount = new XdrLargeInt("i128", amount).toScVal();

      let signers: ContractSigner[] = [];
      if (signer) {
        signers.push(signer);
      }

      const ss = new SorobanService();
      return await ss
        .simulateContract({
          contractId,
          method: "transfer",
          args: [scFrom, scTo, scAmount],
          signers,
        })
        .then(({ tx, simulationResponse }) => ss.callContract({ tx, simulationResponse }));
    },
  });

  return mutation;
};
