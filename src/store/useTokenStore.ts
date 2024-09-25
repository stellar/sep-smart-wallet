import { create } from "zustand";
import { persist } from "zustand/middleware";

import { TokenInfo } from "@/types/types";

interface TokenStore {
  tokenInfo: TokenInfo | null;
  setTokenInfo: (tokenInfo: TokenInfo | null) => void;
}

// Create the Zustand store with TypeScript types
export const useTokenStore = create<TokenStore>()(
  persist(
    (set) => ({
      tokenInfo: null,
      setTokenInfo: (tokenInfo: TokenInfo | null) => set({ tokenInfo }),
    }),
    {
      name: "ssw:tokenInfo", // Unique name for the localStorage key
      getStorage: () => localStorage, // Choose storage type (localStorage here)
    },
  ),
);
