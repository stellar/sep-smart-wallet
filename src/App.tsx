import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { PROJECT, TOKEN_CONTRACT } from "@/config/settings";
import { QueryProvider } from "@/query/QueryProvider";
import { Layout } from "@stellar/design-system";
import { TomlDomainConfig } from "./components/TomlDomainConfig";
import { UserAccountConfig } from "./components/UserAccountConfig";
import { Box } from "./components/layout/Box";
import { useTokenStore } from "./store/useTokenStore";

export const App = () => {
  useEffect(() => {
    // Set the document title using the environment variable
    document.title = PROJECT.TITLE;
  }, []);

  const { tokenInfo, setTokenInfo } = useTokenStore();
  useEffect(() => {
    if (!tokenInfo) {
      setTokenInfo({
        contractId: TOKEN_CONTRACT.NATIVE,
        name: "XLM",
      });
    }
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
            <TomlDomainConfig />
            <UserAccountConfig />
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
