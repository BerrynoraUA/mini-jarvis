"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--color-canvas)",
            color: "var(--color-ink)",
            border: "1px solid var(--color-hairline)",
            borderRadius: "999px",
            fontSize: "0.875rem",
          },
        }}
      />
    </QueryClientProvider>
  );
}
