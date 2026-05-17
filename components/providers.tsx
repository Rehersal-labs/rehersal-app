"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { initPostHog } from "@/lib/posthog";
import { toast } from "@/hooks/use-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Don't retry on 4xx client errors
              const msg = error instanceof Error ? error.message : "";
              if (msg.includes("(401)") || msg.includes("(403)") || msg.includes("(404)")) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
        queryCache: new QueryCache({
          onError: (error, query) => {
            // Only show toast for background refetch errors, not initial loads
            // (initial load errors are handled per-component)
            if (query.state.data !== undefined) {
              const msg = error instanceof Error ? error.message : "Request failed";
              toast({
                title: "Data refresh failed",
                description: msg,
                variant: "destructive",
              });
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            const msg = error instanceof Error ? error.message : "Action failed";
            // Only show if not already handled by the mutation's own onError
            console.error("[mutation error]", msg);
          },
        }),
      })
  );

  useEffect(() => {
    initPostHog();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
