import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { queryClient } from "./lib/queryClient";
import { router } from "./routes/router";
import { AuthInitializer } from "./components/common/AuthInitializer";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <RouterProvider router={router} />
      </AuthInitializer>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  </StrictMode>
);
