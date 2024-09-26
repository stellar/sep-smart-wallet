import { create } from "zustand";

import { ContractSigner } from "@/types/types";

interface ContractSignerStore {
  contractSigner: ContractSigner | null;
  setContractSigner: (signer: ContractSigner | null) => void;
}

// Create the Zustand store with TypeScript types
export const useContractSignerStore = create<ContractSignerStore>((set) => ({
  contractSigner: null,
  setContractSigner: (signer: ContractSigner | null) => set({ contractSigner: signer }),
}));

// {

// replacer: (_, value) => {
//   if (value instanceof Keypair || value instanceof PasskeyService || typeof value === "function") {
//     const methodType =
//       value instanceof Keypair
//         ? "Keypair"
//         : value instanceof PasskeyService
//         ? "PasskeyService"
//         : "SigningCallback";
//     return { type: methodType, value: JSON.stringify(value) };
//   }
//   return value;
// },
// reviver: (_, value) => {
//   const valueAny = value as any;
//   console.log("value: ", value);
//   if (value && valueAny?.type === "Keypair") {
//     const kp = JSON.parse(valueAny.value) as Keypair;
//     console.log("Keypair: ", kp instanceof Keypair);
//     return kp; // Return the Keypair object
//   }
//   if (value && valueAny?.type === "PasskeyService") {
//     return JSON.parse(valueAny.value) as PasskeyService; // Return the PasskeyService object
//   }
//   if (value && valueAny?.type === "SigningCallback") {
//     return JSON.parse(valueAny.value) as SigningCallback; // Return the SigningCallback object
//   }
//   return value; // Return unchanged for other types
