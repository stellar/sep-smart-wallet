# SOROBAN envs that are sourced by stellar-cli automatically:
export STELLAR_RPC_URL=https://soroban-testnet.stellar.org:443
export STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
export STELLAR_ACCOUNT=default

# Choose an asset to use:
export ASSET=USDC:GDQOE23CFSUMSVQK4Y5JHPPYK73VYCNHZHA7ENKCV37P6SUEO6XQBKPP 		# Our USDC
# export ASSET=USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5 	# CIRCLE USDC
# export ASSET=native		 													# XLM

# Factory and Wallet contracts
export WEBAUTHN_FACTORY=CAJWHSAL56JEL64QKPAODVK3WDHC2DFXDR5MRLOTQDXTIVAFFS5O3ACO
export WEBAUTHN_WASM=739eef7fae6d43b04a36f778dae6946436cff37712e328b46e8dabc9ea5917d9

generate-default-account:
	stellar keys generate default --global

clean:
	rm -rf out/
	rm -rf contracts/webauthn-factory/target/
	rm -rf contracts/webauthn-wallet/target/
	@cd contracts/webauthn-factory && cargo clean
	@cd contracts/webauthn-wallet && cargo clean

fmt:
	@cd contracts/webauthn-factory && cargo fmt --all
	@cd contracts/webauthn-wallet && cargo fmt --all

build:
	rm -rf out/
	
	rm -rf contracts/webauthn-wallet/target/wasm32-unknown-unknown/
	@cd contracts/webauthn-wallet && stellar contract build --package webauthn-wallet --out-dir ../../out
	stellar contract optimize --wasm ./out/webauthn_wallet.wasm

	rm -rf contracts/webauthn-factory/target/wasm32-unknown-unknown/
	@cd contracts/webauthn-factory && stellar contract build --package webauthn-factory --out-dir ../../out
	stellar contract optimize --wasm ./out/webauthn_factory.wasm

get-or-create-token-contract:
	stellar contract asset deploy --asset $(ASSET) 2>/dev/null || stellar contract id asset --asset $(ASSET)

deploy:
	stellar contract deploy --wasm ./out/webauthn_factory.optimized.wasm
	stellar contract install --wasm ./out/webauthn_wallet.optimized.wasm

init:
	stellar contract invoke --id $(WEBAUTHN_FACTORY) -- init --wasm_hash $(WEBAUTHN_WASM)
