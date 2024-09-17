import { SorobanRpc } from "@stellar/stellar-sdk";

// Get a server configfured for a specific network
export const getSorobanClient = (networkUrl: string) =>
    new SorobanRpc.Server(networkUrl, {
      allowHttp: networkUrl.startsWith("http://"),
    });