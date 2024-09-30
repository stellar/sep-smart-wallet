import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Layout } from "@stellar/design-system";

import { PROJECT } from "@/config/settings";
import { Box } from "@/components/layout/Box";
import { TokenConfig } from "@/components/TokenConfig";
import { TomlDomainConfig } from "@/components/TomlDomainConfig";
import { UserAccountConfig } from "@/components/UserAccountConfig";
import { QueryProvider } from "@/query/QueryProvider";

export const DebugApp = () => {
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
            <UserAccountConfig />
            <TokenConfig />
            <TomlDomainConfig />
          </Layout.Inset>
          <Layout.Inset>
            <Outlet />
          </Layout.Inset>
        </Box>
      </Layout.Content>
      <Layout.Footer></Layout.Footer>
    </QueryProvider>
  );
};
