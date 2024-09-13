import { Layout } from "@stellar/design-system";
import { Outlet } from "react-router-dom";
import { QueryProvider } from "./query/QueryProvider";

const PROJECT_ID = "project-template";
const PROJECT_TITLE = "Project";

export const App = () => {
  return (
    <QueryProvider>
      <Layout.Header
        projectId={PROJECT_ID}
        projectTitle={PROJECT_TITLE}
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
