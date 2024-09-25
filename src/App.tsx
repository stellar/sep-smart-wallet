import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { PROJECT } from "@/config/settings";
import { QueryProvider } from "@/query/QueryProvider";
import { Layout } from "@stellar/design-system";
import { TomlDomainConfig } from "./components/TomlDomainConfig";

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
        <Layout.Inset>
          <TomlDomainConfig />
        </Layout.Inset>
        <Layout.Inset>
          <Outlet />
        </Layout.Inset>
      </Layout.Content>
      <Layout.Footer></Layout.Footer>
    </QueryProvider>
  );
};
