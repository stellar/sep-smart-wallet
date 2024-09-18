import { XdrLargeInt, SorobanRpc, Keypair } from "@stellar/stellar-sdk";
import { useMutation } from "@tanstack/react-query";

import { callContract, simulateContract } from "@/helpers/callContract";
import { SvConvert } from "@/helpers/SvConvert";
import { ContractSigner } from "@/types/types";

type TokenTransferProps = {
  kp: Keypair;
  contractId: string;
  fromAccId: string;
  toAccId: string;
  amount: string;
  signer?: ContractSigner;
};

export const useTransfer = () => {
  const mutation = useMutation<SorobanRpc.Api.GetSuccessfulTransactionResponse, Error, TokenTransferProps>({
    mutationFn: async ({ kp, contractId, fromAccId, toAccId, amount, signer }: TokenTransferProps) => {
      const scFrom = SvConvert.accountIdToScVal(fromAccId);
      const scTo = SvConvert.accountIdToScVal(toAccId);
      const scAmount = new XdrLargeInt("i128", amount).toScVal();

      let signers: ContractSigner[] = [];
      if (signer) {
        signers.push(signer);
      }

      return await simulateContract({
        sourceAccPubKey: kp.publicKey(),
        contractId,
        method: "transfer",
        args: [scFrom, scTo, scAmount],
        signers,
      }).then(({ tx, simulationResponse }) => callContract({ tx, simulationResponse, kp }));
    },
  });

  return mutation;
};
