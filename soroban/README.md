# Soroban Project

> [!WARNING]  
> This code is for demonstration purposes only and has not been audited. Do not use it to store, protect, or secure assets or accounts on a public network.

This repository contains [Soroban] contracts used in the `sep-smart-wallet` application, demonstrating account abstraction on [Stellar] with support for [WebAuthn].

## Contracts

- `webauth-verify`: A Soroban contract used by a SEP-10c server to construct a challenge for a WebAuthn device to verify its ownership of a Soroban account contract. This is not used by this project, but is included for reference. An example implementation can be found [here](https://github.com/stellar/java-stellar-anchor-sdk/blob/feature/m24-demo/core/src/main/java/org/stellar/anchor/sep10/Sep10CService.java).
- `webauthn-factory`: A Soroban factory contract that deploys and initializes new instances of WebAuthn contract accounts.
- `webauthn-wallet`: A Soroban account contract initialized with an ECDSA secp256r1 public key for a WebAuthn device (e.g., a passkey from a browser, computer, phone, or Yubikey). This contract functions as an account on the network, capable of holding assets and controlled by the WebAuthn device's signatures.

## Usage

To deploy the contracts for this demo, use the [`Makefile`] in this repository with the following commands:

```sh
make build
make deploy
```

👋👋👋 At this stage, you’ll need to update the Makefile with the following values:

- `WEBAUTHN_FACTORY`: The address of the deployed `webauthn-factory` contract.
- `WEBAUTHN_WASM`: The WASM hash for the `webauthn-wallet` contract.

Once updated, you can initialize the factory contract by running:

```sh
make init
```

## Source

This project is adapted from @kalepail’s [passkey-kit](https://github.com/kalepail/passkey-kit), which itself was adapted from @leighmcculloch’s [original demo](https://github.com/leighmcculloch/soroban-webauthn).

[Stellar]: https://stellar.org
[Soroban]: https://soroban.stellar.org
[WebAuthn]: https://www.w3.org/TR/webauthn-2/
[`Makefile`]: ./Makefile
