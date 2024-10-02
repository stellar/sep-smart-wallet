import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { ContractSigner, TokenInfo } from "@/types/types";
import { AuthEntrySigner } from "@/services/AuthEntrySigner";

type DemoStoreParams = {
  tomlDomain: string | null;
  contractSigner: ContractSigner | null;
  tokenInfo: TokenInfo | null;
};

type DemoStoreActions = {
  setTomlDomain: (tomlDomain: string) => void;
  clearTomlDomain: () => void;
  setContractSigner: (signer: ContractSigner) => void;
  clearContractSigner: () => void;
  setTokenInfo: (tokenInfo: TokenInfo) => void;
  clearTokenInfo: () => void;
};

type DemoStore = DemoStoreParams & DemoStoreActions;

// Create the Zustand store with TypeScript types
export const useDemoStore = create<DemoStore>()(
  persist(
    immer((set) => ({
      tomlDomain: null,
      contractSigner: null,
      tokenInfo: null,
      setTomlDomain: (tomlDomain: string) =>
        set((state) => {
          state.tomlDomain = tomlDomain;
        }),
      clearTomlDomain: () =>
        set((state) => {
          state.tomlDomain = null;
        }),
      setContractSigner: (contractSigner: ContractSigner) =>
        set((state) => {
          state.contractSigner = contractSigner;
        }),
      clearContractSigner: () =>
        set((state) => {
          state.contractSigner = null;
        }),
      setTokenInfo: (tokenInfo: TokenInfo) =>
        set((state) => {
          state.tokenInfo = tokenInfo;
        }),
      clearTokenInfo: () =>
        set((state) => {
          state.tokenInfo = null;
        }),
    })),
    {
      name: "ssw:demoStore", // Unique name for the localStorage key
      storage: createJSONStorage(() => sessionStorage, {
        // we need to implement a custom revive function to make sure the AuthEntrySigner is correctly deserialized:
        reviver: (_, value) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
