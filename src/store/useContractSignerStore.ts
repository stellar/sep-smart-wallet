import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ContractSigner } from "@/types/types";

interface ContractSignerStore {
  contractSigner: ContractSigner | null;
  setContractSigner: (signer: ContractSigner | null) => void;
}

// Create the Zustand store with TypeScript types
export const useContractSignerStore = create<ContractSignerStore>()(
  persist(
    (set) => ({
      contractSigner: null,
      setContractSigner: (signer: ContractSigner | null) => set({ contractSigner: signer }),
    }),
    {
      name: "ssw:contractSigner", // Unique name for the localStorage key
      getStorage: () => localStorage, // Choose storage type (localStorage here)
    },
  ),
);
