import * as toml from "toml";

import {
  GetSEP10cChallengeRequest,
  GetSEP10cChallengeResponse,
  PostSEP10cChallengeRequest,
  PostSEP10cChallengeResponse,
  SEP10cInfo,
  SEP10cClient,
} from "@/types/types";
import { normalizeHomeDomainUrl } from "@/helpers/normalizeHomeDomainUrl";

export class SEP10cClientToml implements SEP10cClient {
  private tomlUrl: string;
  private sep10cInfo?: SEP10cInfo;

  constructor(tomlUrl: string) {
    this.tomlUrl = normalizeHomeDomainUrl(tomlUrl).toString();
  }

  async getSep10cInfo(): Promise<SEP10cInfo> {
    if (this.sep10cInfo) {
      return this.sep10cInfo;
    }

    const response = await fetch(this.tomlUrl, {
      method: "GET",
      headers: {
        "Content-Type": "text",
      },
    });
    if (!response.ok) {
      throw new Error(`${response.status} Error fetching TOML`);
    }
    const tomlStr = await response.text();
    const tomlObj = toml.parse(tomlStr);

    const signingKey = tomlObj.SIGNING_KEY as string;
    if (!signingKey) {
      throw new Error("SIGNING_KEY not found in TOML file");
    }
    const webAuthContractId = tomlObj.WEB_AUTH_CONTRACT_ID as string;
    if (!webAuthContractId) {
      throw new Error("WEB_AUTH_CONTRACT_ID not found in TOML file");
    }
    const webAuthEndpointC = tomlObj.WEB_AUTH_ENDPOINT_C as string;
    if (!webAuthEndpointC) {
      throw new Error("WEB_AUTH_ENDPOINT_C not found in TOML file");
    }

    this.sep10cInfo = {
      signingKey,
      webAuthContractId,
      webAuthEndpointC,
    };

    return this.sep10cInfo;
  }

  async getSEP10cChallenge(req: GetSEP10cChallengeRequest): Promise<GetSEP10cChallengeResponse> {
    if (!this.sep10cInfo) {
      await this.getSep10cInfo();
    }

    if (!req.address) {
      throw new Error("address is required");
    }

    // Construct the URL with query parameters
    const url = new URL(this.sep10cInfo?.webAuthEndpointC!);
    url.searchParams.append("address", req.address);
    if (req.memo) {
      url.searchParams.append("memo", req.memo);
    }
    if (req.home_domain) {
      url.searchParams.append("home_domain", req.home_domain);
    }
    if (req.client_domain) {
      url.searchParams.append("client_domain", req.client_domain);
    }
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(`${response.status} Error getting SEP-10c challenge`);
    }

    const { authorization_entry, server_signature } = await response.json();

    if (!authorization_entry || !server_signature) {
      throw new Error("Invalid response from server");
    }

    return { authorization_entry, server_signature };
  }

  async postSEP10cChallenge(req: PostSEP10cChallengeRequest): Promise<PostSEP10cChallengeResponse> {
    if (!this.sep10cInfo) {
      await this.getSep10cInfo();
    }

    const response = await fetch(this.sep10cInfo?.webAuthEndpointC!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      throw new Error(`${response.status} Error posting SEP-10c challenge`);
    }

    return (await response.json()) as PostSEP10cChallengeResponse;
  }
}
