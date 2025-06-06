import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Board from "./Board";
import { createBrowserRouter, RouterProvider } from "react-router";
import Login from "./Login";

const router = createBrowserRouter([
  {
    path: "/login",
    element: (

          <Login />

    ),
  },
  {
    path: "/",
    element: (
      <div className="bg-[#0D1321] min-h-screen ">
        <div className="pt-20">
          <Board />
        </div>
      </div>
    ),
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>
);
