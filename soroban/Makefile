export SOROBAN_RPC_URL=https://soroban-testnet.stellar.org:443
export SOROBAN_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
export SOROBAN_ACCOUNT=default

export NATIVE_CONTRACT=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC

export WEBAUTHN_FACTORY=CAJWHSAL56JEL64QKPAODVK3WDHC2DFXDR5MRLOTQDXTIVAFFS5O3ACO
export WEBAUTHN_WASM=739eef7fae6d43b04a36f778dae6946436cff37712e328b46e8dabc9ea5917d9

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

deploy:
	stellar contract asset deploy --asset native || stellar contract id asset --asset native
	stellar contract deploy --wasm ./out/webauthn_factory.optimized.wasm
	stellar contract install --wasm ./out/webauthn_wallet.optimized.wasm

init:
	stellar contract invoke --id $(WEBAUTHN_FACTORY) -- init --wasm_hash $(WEBAUTHN_WASM)

bindings:
	stellar contract bindings typescript --id $(NATIVE_CONTRACT) --network testnet --output-dir ./out/sac-sdk --overwrite
	stellar contract bindings typescript --id $(WEBAUTHN_FACTORY) --network testnet --output-dir ./out/passkey-factory-sdk --overwrite
	stellar contract bindings typescript --id $(WEBAUTHN_FACTORY) --wasm ./out/webauthn_wallet.optimized.wasm --network testnet --output-dir ./out/passkey-kit-sdk --overwrite
