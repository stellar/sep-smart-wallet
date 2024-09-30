import { Box } from "@/components/layout/Box";
import { RouterLink } from "@/components/RouterLink";

export const DebugHome = () => {
  return (
    <Box gap="lg">
      <RouterLink to="/debug/sep10c" variant="primary">
        SEP-10c Debugger
      </RouterLink>
      <RouterLink to="/debug/passkey" variant="primary">
        Passkey Debugger
      </RouterLink>
    </Box>
  );
};
