import { Heading } from "@stellar/design-system";
import { Keypair } from "@stellar/stellar-sdk";

import { Box } from "@/components/layout/Box";
import { RouterLink } from "@/components/RouterLink";
import { C_ACCOUNT_ED25519_SIGNER } from "@/config/settings";
import { ContractSigner } from "@/types/types";
// import { PassKeyManager } from "@/components/PassKeyManager";

export const Home = () => {
  const accountSigner: ContractSigner = {
    addressId: C_ACCOUNT_ED25519_SIGNER.PUBLIC_KEY,
    method: Keypair.fromSecret(C_ACCOUNT_ED25519_SIGNER.PRIVATE_KEY),
  };

  // const b32 = Keypair.fromPublicKey("GAX7FKBADU7HQFB3EYLCYPFKIXHE7SJSBCX7CCGXVVWJ5OU3VTWOFEI5")
  //   .rawPublicKey()
  //   .toString("hex");
  // console.log(b32);

  return (
    <Box gap="lg">
      <Heading size="md" as="h2">
        {accountSigner.addressId}
      </Heading>
      <Heading size="md" as="h3">
        XLM Balance
      </Heading>
      {/* <PassKeyManager accountSigner={accountSigner} contractId={tokenInfo.contractId} tokenName={tokenInfo.name} /> */}
      <RouterLink to="/token" variant="primary">
        Token Debugger
      </RouterLink>
      <RouterLink to="/sep10c" variant="primary">
        SEP-10c Debugger
      </RouterLink>
    </Box>
  );
};
