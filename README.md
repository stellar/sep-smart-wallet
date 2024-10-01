# sep-smart-wallet

> [!WARNING]  
> This code is for demonstration purposes only and has not been audited. Do not use it to store, protect, or secure assets or accounts on a public network.

A passkey-based smart wallet that interacts with SEP-10c (alpha) and SEP-24 protocols.

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- [stellar-cli]

### Installation

The following commands use Yarn, but you can use npm if you prefer:

```sh
yarn install
yarn dev
```

### Soroban Contracts

For details on the Soroban contracts used in this project, refer to the [soroban](./soroban/README.md) directory.

After deploying the contracts and retrieving the updated values for `WEBAUTHN_FACTORY` and `WEBAUTHN_WASM`, use these values to update the `.env` file by setting the `VITE_PASSKEY_CONTRACT_FACTORY` and `VITE_PASSKEY_CONTRACT_WALLET_WASM` variables, as demonstrated in the [`.env.example`] file.

[stellar-cli]: https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup#install-the-stellar-cli
[`.env.example`]: ./.env.example
