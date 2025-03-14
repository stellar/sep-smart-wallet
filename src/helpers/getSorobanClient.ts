import { rpc } from "@stellar/stellar-sdk";

// Get a server configfured for a specific network
export const getSorobanClient = (sorobanUrl: string): rpc.Server => {
  console.log("sorobanUrl", sorobanUrl);
  return new rpc.Server(sorobanUrl, {
    allowHttp: sorobanUrl.startsWith("http://"),
  });
};
