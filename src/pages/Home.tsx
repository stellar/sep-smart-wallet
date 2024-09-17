import { Heading } from "@stellar/design-system";
import { Box } from "@/components/layout/Box";
import { RouterLink } from "@/components/RouterLink";
import { ACCOUNT_A_PUBLIC_KEY, NATIVE_CONTRACT_ID } from "@/config/settings";
import { AccountBalance } from "@/components/accountBalance";

export const Home = () => {
  const accountId = ACCOUNT_A_PUBLIC_KEY;
  const contractId = NATIVE_CONTRACT_ID;

  return (
    <Box gap="lg">
      <Heading size="md" as="h2">
        Home
      </Heading>
      <AccountBalance accountId={accountId} contractId={contractId} />
      <RouterLink to="/second" variant="primary">
        Go to Second page
      </RouterLink>
    </Box>
  );
};
