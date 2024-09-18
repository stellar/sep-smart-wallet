import { Heading } from "@stellar/design-system";
import { Keypair } from "@stellar/stellar-sdk";

import { AccountBalance } from "@/components/AccountBalance";
import { Box } from "@/components/layout/Box";
import { RouterLink } from "@/components/RouterLink";
import { G_ACCOUNT_ED25519_SIGNER, TOKEN_CONTRACT } from "@/config/settings";
import { ContractSigner } from "@/types/types";

type TokenInfo = {
  name: string;
  contractId: string;
};

export const Home = () => {
  const tokenInfo: TokenInfo = {
    contractId: TOKEN_CONTRACT.NATIVE,
    name: "XLM",
  };

  const accountSigner: ContractSigner = {
    addressId: G_ACCOUNT_ED25519_SIGNER.PUBLIC_KEY,
    method: Keypair.fromSecret(G_ACCOUNT_ED25519_SIGNER.PRIVATE_KEY),
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
      <AccountBalance accountSigner={accountSigner} contractId={tokenInfo.contractId} tokenName={tokenInfo.name} />
      <RouterLink to="/second" variant="primary">
        Go to Second page
      </RouterLink>
    </Box>
  );
};
