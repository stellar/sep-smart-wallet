import { Heading } from "@stellar/design-system";
import { Keypair } from "@stellar/stellar-sdk";

import { AccountBalance } from "@/components/AccountBalance";
import { Box } from "@/components/layout/Box";
import { RouterLink } from "@/components/RouterLink";
import { ACCOUNT_A_PRIVATE_KEY, NATIVE_CONTRACT_ID } from "@/config/settings";

type TokenInfo = {
  name: string;
  contractId: string;
};

export const Home = () => {
  const tokenInfo: TokenInfo = {
    contractId: NATIVE_CONTRACT_ID,
    name: "XLM",
  };
  const accountKP = Keypair.fromSecret(ACCOUNT_A_PRIVATE_KEY);

  return (
    <Box gap="lg">
      <Heading size="md" as="h2">
        {accountKP.publicKey()}
      </Heading>
      <Heading size="md" as="h3">
        XLM Balance
      </Heading>
      <AccountBalance accountKP={accountKP} contractId={tokenInfo.contractId} tokenName={tokenInfo.name} />
      <RouterLink to="/second" variant="primary">
        Go to Second page
      </RouterLink>
    </Box>
  );
};
