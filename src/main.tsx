import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router";
import ChessBackendTester from "./ChessBackendTester";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ChessBackendTester />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
