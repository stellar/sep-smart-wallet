import { useEffect } from "react";
import { Layout } from "@stellar/design-system";

import { Box } from "@/components/layout/Box";
import { PROJECT } from "@/config/settings";
import { DemoHome } from "@/pages/DemoHome";
import { DemoDebugger } from "@/pages/DemoDebugger";
import { QueryProvider } from "@/query/QueryProvider";

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
        <Box gap="xxl" direction="column" addlClassName="LayoutContent">
          <DemoHome />
          <hr className="LayoutDivider" />
          <DemoDebugger />
        </Box>
      </Layout.Content>
      <Layout.Footer></Layout.Footer>
    </QueryProvider>
  );
};
