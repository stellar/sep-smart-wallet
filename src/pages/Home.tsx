import { Heading } from "@stellar/design-system";
import { Box } from "@/components/layout/Box";
import { RouterLink } from "@/components/RouterLink";

export const Home = () => {
  return (
    <Box gap="lg">
      <Heading size="md" as="h2">
        Home
      </Heading>
      <RouterLink to="/second" variant="primary">
        Go to Second page
      </RouterLink>
    </Box>
  );
};
