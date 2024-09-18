import { XdrLargeInt } from "@stellar/stellar-sdk";
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
  const mutation = useMutation<bigint, Error, TokenTransferProps>({
    mutationFn: async ({ contractId, fromAccId, toAccId, amount, signer }: TokenTransferProps) => {
      const scFrom = SvConvert.accountIdToScVal(fromAccId);
      const scTo = SvConvert.accountIdToScVal(toAccId);
      const scAmount = new XdrLargeInt("i128", amount).toScVal();

      let signers: ContractSigner[] = [];
      if (signer) {
        signers.push(signer);
      }

      const ss = new SorobanService();
      let { tx, simulationResponse: transferSimulation } = await ss.simulateContract({
        contractId,
        method: "transfer",
        args: [scFrom, scTo, scAmount],
        signers,
      });

      await ss.callContract({ tx, simulationResponse: transferSimulation });

      const { simulationResponse: balanceSimulation } = await ss.simulateContract({
        contractId,
        method: "balance",
        args: [SvConvert.accountIdToScVal(fromAccId)],
      });

      return SvConvert.scValToBigInt(balanceSimulation.result!.retval);
    },
  });

  return mutation;
};
