import { StellarToml } from "@stellar/stellar-sdk";
import { useMutation } from "@tanstack/react-query";
import { ContractSigner } from "@/types/types";
import { SEP10cService } from "@/services/SEP10cService";
import { SEP10cClientToml } from "@/services/clients/SEP10cClientToml";
import { normalizeHomeDomainUrl } from "@/helpers/normalizeHomeDomainUrl";

type UseSep24DepositProps = {
  address: string;
  signer: ContractSigner;
  assetCode: string;
  homeDomain: string;
  amount: string;
};

type UseSep24DepositResponse = {
  interactiveUrl: string;
  interactiveId: string;
  sep10Token: string;
  sep24TransferServerUrl: string;
};

const SEP24_DEPOSIT_REQUIRED_FIELDS = ["SIGNING_KEY", "TRANSFER_SERVER_SEP0024", "WEB_AUTH_ENDPOINT"];

export const useSep24Deposit = () => {
  const mutation = useMutation<UseSep24DepositResponse, Error, UseSep24DepositProps>({
    mutationFn: async ({ address, signer, assetCode, homeDomain, amount }: UseSep24DepositProps) => {
      console.log("Initiating a SEP-24 deposit");
      // Check TOML
      const tomlURL = normalizeHomeDomainUrl(homeDomain);
      const tomlResponse = await getToml(tomlURL);

      const missingFields = SEP24_DEPOSIT_REQUIRED_FIELDS.reduce((res: string[], cur) => {
        if (!tomlResponse[cur]) {
          return [...res, cur];
        }

        return res;
      }, []);

      if (missingFields.length > 0) {
        throw Error(`SEP-24 deposit is missing the following fields: ${missingFields.join(", ")}`);
      }

      // Check SEP-24 deposit supports asset
      const sep24InfoRequest = await fetch(`${tomlResponse.TRANSFER_SERVER_SEP0024}/info`);
      const sep24InfoResponse = await sep24InfoRequest.json();

      const asset = assetCode === "XLM" ? "native" : assetCode;

      if (!sep24InfoResponse?.deposit[asset]) {
        throw Error(`Asset ${assetCode} is not supported for SEP-24 deposit`);
      }

      // SEP-10
      // SEP-10 get
      const sep10cClient = new SEP10cClientToml(tomlURL.toString());
      const server = new SEP10cService(sep10cClient);

      const sep10Challenge = await server.getSEP10cChallenge({ address });

      // SEP-10 sign
      const sep10ChallengeSigned = await server.signAuthEntry({
        authEntry: sep10Challenge.authorization_entry,
        signer,
      });

      // SEP-10 submit
      const token = await server.postSEP10cChallenge({
        authorization_entry: sep10Challenge.authorization_entry,
        server_signature: sep10Challenge.server_signature,
        credentials: [sep10ChallengeSigned],
      });

      // Start interactive flow
      const interactiveResponse = await sep24DepositInteractiveFlow({
        address,
        assetCode,
        amount,
        sep24TransferServerUrl: tomlResponse.TRANSFER_SERVER_SEP0024!,
        token,
      });

      return {
        interactiveUrl: interactiveResponse.url,
        interactiveId: interactiveResponse.id,
        sep10Token: token,
        sep24TransferServerUrl: tomlResponse.TRANSFER_SERVER_SEP0024!,
      };
    },
  });

  return mutation;
};

//==============================================================================
// Helpers
//==============================================================================

const getToml = async (tomlURL: URL) => {
  tomlURL.pathname = "/.well-known/stellar.toml";

  const tomlResponse =
    tomlURL.protocol === "http:"
      ? await StellarToml.Resolver.resolve(tomlURL.host, {
          allowHttp: true,
        })
      : await StellarToml.Resolver.resolve(tomlURL.host);

  return tomlResponse;
};

const sep24DepositInteractiveFlow = async ({
  address,
  assetCode,
  amount,
  sep24TransferServerUrl,
  token,
}: {
  address: string;
  assetCode: string;
  amount: string;
  sep24TransferServerUrl: string;
  token: string;
}): Promise<any> => {
  const depositParams = {
    account: address,
    asset_code: assetCode === "XLM" ? "native" : assetCode,
    amount,
    lang: "en",
  };

  const formData = new FormData();

  Object.entries(depositParams).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const response = await fetch(`${sep24TransferServerUrl}/transactions/deposit/interactive`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const respJson = await response.json();
  if (!response.ok) {
    throw new Error("Error in sep24DepositInteractiveFlow: " + JSON.stringify(respJson, null, 2));
  }

  return respJson;
};
