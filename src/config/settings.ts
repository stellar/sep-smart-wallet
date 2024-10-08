// Type definitions
type StellarConfig = {
  NETWORK_PASSPHRASE: string;
  HORIZON_URL: string;
  SOROBAN_RPC_URL: string;
  MAX_FEE: string;
  SOURCE_ACCOUNT: SignerKeypair;
};

type ProjectConfig = {
  ID: string;
  TITLE: string;
  DOMAIN: string;
};

type TokenContractConfig = {
  NATIVE: string;
  USDC: string;
};

type SignerKeypair = {
  PRIVATE_KEY: string;
  PUBLIC_KEY: string;
};

// STELLAR constants for the project, used to get data and submit transaction to the Horizon and Soroban servers.
export const STELLAR: StellarConfig = {
  NETWORK_PASSPHRASE: import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015",
  HORIZON_URL: import.meta.env.VITE_STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org",
  SOROBAN_RPC_URL: import.meta.env.VITE_STELLAR_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org",
  MAX_FEE: import.meta.env.VITE_STELLAR_MAX_FEE || "10000",
  SOURCE_ACCOUNT: {
    PRIVATE_KEY:
      import.meta.env.VITE_STELLAR_SOURCE_ACCOUNT_PRIVATE_KEY ||
      "SAARF2ZWAHZJMKA6LXIFVNIHUBEUTMKV5NWCCUZV6ORPKLUK6RSOYZ4D",
    PUBLIC_KEY:
      import.meta.env.VITE_STELLAR_SOURCE_ACCOUNT_PUBLIC_KEY ||
      "GAX7FKBADU7HQFB3EYLCYPFKIXHE7SJSBCX7CCGXVVWJ5OU3VTWOFEI5",
  },
};

// PROJECT constants for the project, used to identify the project and its domain.
export const PROJECT: ProjectConfig = {
  ID: import.meta.env.VITE_PROJECT_ID || "meridian-2024-smart-wallet",
  TITLE: import.meta.env.VITE_PROJECT_TITLE || "SEP Smart Wallet",
  DOMAIN: import.meta.env.VITE_PROJECT_DOMAIN || "localhost",
};

export const PASSKEY = {
  DEFAULT_NAME: import.meta.env.VITE_PASSKEY_NAME || "passkey-meridian2024-localhost",
  PROJECT_NAME: import.meta.env.VITE_PASSKEY_PROJECT_NAME || "Meridian 2024 Smart Wallet!",
  // CONTRACT_FACTORY_ID is used to store the contract ID and the wallet wasm hash that will be used to deploy the Passkey-backed smart contracts (AKA smart wallets).
  CONTRACT_FACTORY_ID:
    import.meta.env.VITE_PASSKEY_CONTRACT_FACTORY || "CCNM5FQIWCBG5NUFYQRFLSVZKJGJ6ECBYIUUKMGSYHVGLKEPJCR46UHG",
  // import.meta.env.VITE_PASSKEY_CONTRACT_FACTORY || "CB4EKTD6XVN5U7N7BU77IDFDDKUTC747WV357ANADMKORLDCOGWXFHJ7",
};

// TOKEN_CONTRACT is used to store the contract ID for the tokens we use in this project.
export const TOKEN_CONTRACT: TokenContractConfig = {
  NATIVE: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  // USDC: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA", // Circle's USDC
  USDC: "CDTY3P6OVY3SMZXR3DZA667NAXFECA6A3AOZXEU33DD2ACBY43CIKDPT", // Test USDC
};

// C_ACCOUNT_ED25519_SIGNER is a C-account signer keypair used to sign transactions in the project. It is used to mock a user's signature.
// contract deployed from https://github.com/stellar/soroban-examples/tree/v21.6.0/account
export const C_ACCOUNT_ED25519_SIGNER: SignerKeypair = {
  PUBLIC_KEY: "CCU5TWNSNHKCZLMQOYYKOBHN45K23A6JFD3UABZJ7MMFSAUMKAC5P4FT",
  PRIVATE_KEY: "SAARF2ZWAHZJMKA6LXIFVNIHUBEUTMKV5NWCCUZV6ORPKLUK6RSOYZ4D", // 🟢 correct signature
  // PRIVATE_KEY: "SC6KX53MU72XPGYKHW76B7DI3SXVFHQLNMAKXHD3KF5VCGY2PJJ3ACSQ", // 🔴 bad signature
};

// WEBAUTH_CONTRACT is a contract used to verify the signature of the user through Soroban's `require_auth()` method.
// contract deployed from https://github.com/philipliu/demo/blob/812490ec3559678374ab7d785686bce9691a9add/sep10c/contracts/web_auth/src/lib.rs#L17
export const WEBAUTH_CONTRACT = {
  ID: "CDQDXQPUUDLUZGSBQZBUMZA6ZKVR5JWEX4Y32K3MYQYUMAHIJFLVNOYB",
  FN_NAME: "web_auth_verify",
  SIGNER: {
    PUBLIC_KEY: "GC4BDFONC3EHB5VZCI5BYF2OJEXX7LCU7JROUYF5RRY62FAWMF4GFV3X",
    PRIVATE_KEY: "SB5HCY4MPV6CNFOPNCTZ5IOU5YGKMYJCASA346NHPLYG4W5ULBTTLYLL", // 🟢 correct signature
    // PRIVATE_KEY: "SC6KX53MU72XPGYKHW76B7DI3SXVFHQLNMAKXHD3KF5VCGY2PJJ3ACSQ", // 🔴 bad signature
  },
};

// SEP10cServerKeypair is a server keypair used to sign SEP-10c tokens when the SEP-10c server is mocked through SEP10cClientMock.
export const SEP10cServerKeypair = {
  publicKey: "GA3QC2PT4BOXMVYST5LOCMNIGFXELL6UDI6L7OVM3ZHVL4WQROT3KATR",
  privateKey: "SBYRCGDNOHY4LPOXDR5NXZE5OJGPMO2RUXSPAMKH5XNFK5HZH3QDUM65",
};

export const DEFAULT_ANCHOR_TOML_DOMAIN = "anchor-sep-server-m24.stellar.org";
