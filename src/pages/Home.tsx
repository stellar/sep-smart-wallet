import { Box } from "@/components/layout/Box";
import { RouterLink } from "@/components/RouterLink";
import { useTokenStore } from "@/store/useTokenStore";

export const Home = () => {
  // Populate Store with default values
  const { tokenInfo } = useTokenStore();

  return (
    <Box gap="lg">
      <RouterLink to="/token" variant="primary">
        Token Debugger ({tokenInfo?.name})
      </RouterLink>
      <RouterLink to="/sep10c" variant="primary">
        SEP-10c Debugger
      </RouterLink>
      <RouterLink to="/passkey" variant="primary">
        Passkey Debugger
      </RouterLink>
    </Box>
  );
};
