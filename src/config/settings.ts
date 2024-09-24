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

export const STELLAR: StellarConfig = {
  NETWORK_PASSPHRASE: "Test SDF Network ; September 2015",
  HORIZON_URL: "https://horizon-testnet.stellar.org",
  SOROBAN_RPC_URL: "https://soroban-testnet.stellar.org",
  MAX_FEE: "10000",
  SOURCE_ACCOUNT: {
    PRIVATE_KEY: "SAARF2ZWAHZJMKA6LXIFVNIHUBEUTMKV5NWCCUZV6ORPKLUK6RSOYZ4D",
    PUBLIC_KEY: "GAX7FKBADU7HQFB3EYLCYPFKIXHE7SJSBCX7CCGXVVWJ5OU3VTWOFEI5",
  },
};

export const PROJECT: ProjectConfig = {
  ID: "meridian-2024-smart-wallet",
  TITLE: "Smart Wallet",
  DOMAIN: "localhost",
};

export const TOKEN_CONTRACT: TokenContractConfig = {
  NATIVE: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  USDC: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
};

export const G_ACCOUNT_ED25519_SIGNER: SignerKeypair = {
  PUBLIC_KEY: "GC4BDFONC3EHB5VZCI5BYF2OJEXX7LCU7JROUYF5RRY62FAWMF4GFV3X",
  PRIVATE_KEY: "SB5HCY4MPV6CNFOPNCTZ5IOU5YGKMYJCASA346NHPLYG4W5ULBTTLYLL",
};

// contract deployed from https://github.com/stellar/soroban-examples/tree/v21.6.0/account
export const C_ACCOUNT_ED25519_SIGNER: SignerKeypair = {
  PUBLIC_KEY: "CCU5TWNSNHKCZLMQOYYKOBHN45K23A6JFD3UABZJ7MMFSAUMKAC5P4FT",
  PRIVATE_KEY: "SAARF2ZWAHZJMKA6LXIFVNIHUBEUTMKV5NWCCUZV6ORPKLUK6RSOYZ4D", // correct signature
  // PRIVATE_KEY: "SC6KX53MU72XPGYKHW76B7DI3SXVFHQLNMAKXHD3KF5VCGY2PJJ3ACSQ", // bad signature
};

// contract deployed from https://github.com/philipliu/demo/blob/708390d210a12310b93096039301f1036cd41b35/auth_contract/contracts/custom_account/src/lib.rs
export const WEBAUTH_CONTRACT = {
  ID: "CCB7YGKACB5LDXDATYBTC37DXD63LBRR76HZTAXBJJR47JMF5JBNRF4D",
  FN_NAME: "web_auth_verify",
  SIGNER: {
    PUBLIC_KEY: "GC4BDFONC3EHB5VZCI5BYF2OJEXX7LCU7JROUYF5RRY62FAWMF4GFV3X",
    PRIVATE_KEY: "SB5HCY4MPV6CNFOPNCTZ5IOU5YGKMYJCASA346NHPLYG4W5ULBTTLYLL", // correct signature
    // PRIVATE_KEY: "SC6KX53MU72XPGYKHW76B7DI3SXVFHQLNMAKXHD3KF5VCGY2PJJ3ACSQ", // bad signature
  },
};

export const PASSKEY_CONTRACT = {
  // // ℹ️  Using wasm hash 8f2aca22d8832d28bee3fb1baa3ce6b9a6ef0328b87163a016fdf8b33826b666
  // // ℹ️  Transaction hash is 030dd6ff93369d7d298405dd7d38704e7836824fca32f1e533d825f74a5cc998
  // FACTORY: "CB4EKTD6XVN5U7N7BU77IDFDDKUTC747WV357ANADMKORLDCOGWXFHJ7", // 🟡 without storing contract ID map

  // ℹ️  Using wasm hash 32157aa731966ebf54fe3da598c08449c95353955c27cfc44b73ab37799dd35b
  // ℹ️  Transaction hash is 2c9e648d2140cd93c1930967c4be39c98cfe9d02997fc00e06ed4fd57cde972f
  FACTORY: "CCNM5FQIWCBG5NUFYQRFLSVZKJGJ6ECBYIUUKMGSYHVGLKEPJCR46UHG", // 🟢 with storing contract ID map

  // WALLET_WASM is installed in the soroban network and will be used by factory to deploy new contracts
  WALLET_WASM: "ff6fca6e5eaf386cb8a0d659bf1606fb7a94f93e9c9c1fcbe66a062da246b11d", // with storing contract ID map
};

export const SEP10cServerKeypair = {
  publicKey: "GA3QC2PT4BOXMVYST5LOCMNIGFXELL6UDI6L7OVM3ZHVL4WQROT3KATR",
  privateKey: "SBYRCGDNOHY4LPOXDR5NXZE5OJGPMO2RUXSPAMKH5XNFK5HZH3QDUM65",
};
