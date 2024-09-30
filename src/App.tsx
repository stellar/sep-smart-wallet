import { useEffect } from "react";
import { Layout } from "@stellar/design-system";

import { PROJECT } from "@/config/settings";
import { Box } from "@/components/layout/Box";
import { QueryProvider } from "@/query/QueryProvider";
import { RouterLink } from "./components/RouterLink";

export const App = () => {
  useEffect(() => {
    // Set the document title using the environment variable
    document.title = PROJECT.TITLE;
  }, []);

  return (
    <QueryProvider>
      <Layout.Header
        projectId={PROJECT.ID || "meridian-2024-smart-wallet"}
        projectTitle={PROJECT.TITLE || "Smart Wallet"}
        hasThemeSwitch
      />
      <Layout.Content>
        <Box gap="xxl" direction="column">
          <Layout.Inset>
            <Home />
          </Layout.Inset>
        </Box>
      </Layout.Content>
      <Layout.Footer></Layout.Footer>
    </QueryProvider>
  );
};

export const Home = () => {
  return (
    <Box gap="lg">
      <RouterLink to="/debug" variant="primary">
        Debug Pages
      </RouterLink>
    </Box>
  );
};
