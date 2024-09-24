import { TokenInfo } from "@/types/types";
import { create } from "zustand";

interface TokenStore {
  tokenInfo: TokenInfo | null;
  setTokenInfo: (tokenInfo: TokenInfo | null) => void;
}

export const useTokenStore = create<TokenStore>((set) => ({
  tokenInfo: null,
  setTokenInfo: (tokenInfo) => set({ tokenInfo: tokenInfo }),
}));
