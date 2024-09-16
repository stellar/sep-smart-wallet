import { Layout } from "@stellar/design-system";
import { Outlet } from "react-router-dom";
import { QueryProvider } from "@/query/QueryProvider";
import { PROJECT_ID, PROJECT_TITLE } from "@/config/settings";

export const App = () => {
  return (
    <QueryProvider>
      <Layout.Header
        projectId={PROJECT_ID || "meridian-2024-smart-wallet"}
        projectTitle={PROJECT_TITLE || "Smart Wallet"}
        hasThemeSwitch
      />
      <Layout.Content>
        <Layout.Inset>
          <Outlet />
        </Layout.Inset>
      </Layout.Content>
      <Layout.Footer />
    </QueryProvider>
  );
};
