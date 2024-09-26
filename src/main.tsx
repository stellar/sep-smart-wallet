import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Route pages
import { App } from "@/App";
import { Home } from "@/pages/Home";
import { PassKeyDebugPage } from "@/pages/PassKeyDebugPage";
import { SEP10cDebugPage } from "@/pages/SEP10cDebugPage";

// Styles
import "@stellar/design-system/build/styles.min.css";
import "@/styles/global.scss";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // Using nested routes to keep the main layout
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/sep10c",
        element: <SEP10cDebugPage />,
      },
      {
        path: "/passkey",
        element: <PassKeyDebugPage />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
