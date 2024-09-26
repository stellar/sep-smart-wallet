import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { ContractSigner } from "@/types/types";
import { AuthEntrySigner } from "@/services/AuthEntrySigner";

interface ContractSignerStore {
  contractSigner: ContractSigner | null;
  setContractSigner: (signer: ContractSigner | null) => void;
}

// Create the Zustand store with TypeScript types
// export const useContractSignerStore = create<ContractSignerStore>((set) => ({
//   contractSigner: null,
//   setContractSigner: (signer: ContractSigner | null) => set({ contractSigner: signer }),
// }));

// Create the Zustand store with TypeScript types
export const useContractSignerStore = create<ContractSignerStore>()(
  persist(
    (set) => ({
      contractSigner: null,
      setContractSigner: (contractSigner: ContractSigner | null) => set({ contractSigner }),
    }),
    {
      name: "ssw:contractSigner", // Unique name for the localStorage key
      storage: createJSONStorage(() => sessionStorage, {
        // we need to implement a custom revive function to make sure the AuthEntrySigner is correctly deserialized:
        reviver: (_, value) => {
          const valueAny = value as any;

          if (valueAny?.type === "Keypair") {
            return AuthEntrySigner.fromKeypairSecret(valueAny.keypairSecret);
          } else if (valueAny?.type === "PasskeyService") {
            return AuthEntrySigner.fromPasskeyKeyId(valueAny.passkeyKeyId);
          }

          return value;
        },
      }),
    },
  ),
);
