import { Box } from "@/components/layout/Box";
import { RouterLink } from "@/components/RouterLink";

export const Home = () => {
  return (
    <Box gap="lg">
      <RouterLink to="/sep10c" variant="primary">
        SEP-10c Debugger
      </RouterLink>
      <RouterLink to="/passkey" variant="primary">
        Passkey Debugger
      </RouterLink>
    </Box>
  );
};
