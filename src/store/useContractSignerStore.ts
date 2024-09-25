import { ContractSigner } from "@/types/types";
import { create } from "zustand";

interface ContractSignerStore {
  contractSigner: ContractSigner | null;
  setContractSigner: (signer: ContractSigner | null) => void;
}

export const useContractSignerStore = create<ContractSignerStore>((set) => ({
  contractSigner: null,
  setContractSigner: (signer) => set({ contractSigner: signer }),
}));
