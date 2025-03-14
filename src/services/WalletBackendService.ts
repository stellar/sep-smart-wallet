import { Keypair } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";

const WALLET_BACKEND_SECRET = "SALLK7FWPRLASQ6747CH6ULRRUG5SYNH5FZ6BBOMXQXSNTNUQA5HVDO5";
const WALLET_BACKEND_DOMAIN = "http://localhost:8001";

export class WalletBackendService {
  private static instance: WalletBackendService;
  public static getInstance(): WalletBackendService {
    if (!WalletBackendService.instance) {
      WalletBackendService.instance = new WalletBackendService();
    }

    return WalletBackendService.instance;
  }

  private readonly secret: string;
  private readonly domain: string;

  constructor(secret: string = WALLET_BACKEND_SECRET, domain: string = WALLET_BACKEND_DOMAIN) {
    this.secret = secret;
    this.domain = domain;
  }

  private generateAuthHeader(reqBody?: string | null): string {
    // now should be in unix
    const now = new Date();
    const nowUnix = Math.floor(now.getTime() / 1000);

    // build payload
    const walletBackendHostname = new URL(this.domain).hostname;
    const payload = `${nowUnix}.${walletBackendHostname}.${reqBody ?? ""}`;

    // sign payload
    const signer = Keypair.fromSecret(this.secret);
    const signature = signer.sign(Buffer.from(payload, "utf8")).toString("base64");

    // build auth header
    return `t=${nowUnix}, s=${signature}`;
  }

  private async request<T>(endpoint: string, method: string = "GET", body?: any): Promise<T> {
    const reqBody = body ? JSON.stringify(body) : null;
    const authHeader = this.generateAuthHeader(reqBody);

    const url = new URL(endpoint, this.domain);
    const response = await fetch(url.toString(), {
      method,
      headers: {
        "Content-Type": "application/json",
        Signature: authHeader,
      },
      ...(body && { body: reqBody }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getPayments(): Promise<any> {
    return this.request("/payments");
  }
}
