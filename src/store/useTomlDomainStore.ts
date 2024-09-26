import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Define the interface for your store
interface TomlDomainStore {
  tomlDomain: string | null;
  setTomlDomain: (tomlDomain: string | null) => void;
}

// Create the Zustand store with TypeScript types
export const useTomlDomainStore = create<TomlDomainStore>()(
  persist(
    (set) => ({
      tomlDomain: null,
      setTomlDomain: (tomlDomain: string | null) => set({ tomlDomain }),
    }),
    {
      name: "ssw:tomlDomain", // Unique name for the localStorage key
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);
