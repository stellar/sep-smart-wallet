import { Heading } from "@stellar/design-system";
import { Box } from "@/components/layout/Box";
import { RouterLink } from "@/components/RouterLink";
import { ACCOUNT_A_PUBLIC_KEY, NATIVE_CONTRACT_ID } from "@/config/settings";
import { AccountBalance } from "@/components/AccountBalance";

type TokenInfo = {
  name: string;
  contractId: string;
};

export const Home = () => {
  const tokenInfo: TokenInfo = {
    contractId: NATIVE_CONTRACT_ID,
    name: "XLM",
  };
  const accountId = ACCOUNT_A_PUBLIC_KEY;

  return (
    <Box gap="lg">
      <Heading size="md" as="h2">
        {accountId}
      </Heading>
      <Heading size="md" as="h3">
        XLM Balance
      </Heading>
      <AccountBalance accountId={accountId} contractId={tokenInfo.contractId} tokenName={tokenInfo.name} />
      <RouterLink to="/second" variant="primary">
        Go to Second page
      </RouterLink>
    </Box>
  );
};
