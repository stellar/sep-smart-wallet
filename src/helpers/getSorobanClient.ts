import { SorobanRpc } from "@stellar/stellar-sdk";

// Get a server configfured for a specific network
export const getSorobanClient = (sorobanUrl: string): SorobanRpc.Server => {
  console.log("sorobanUrl", sorobanUrl);
  return new SorobanRpc.Server(sorobanUrl, {
    allowHttp: sorobanUrl.startsWith("http://"),
  });
};
