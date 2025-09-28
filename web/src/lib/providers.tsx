"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, optimism, arbitrum, base, sepolia, baseSepolia } from "wagmi/chains";
import { WALLETCONNECT_PROJECT_ID } from "./config";
import { setupZKVerification } from "./zk-integration-example";
import { useEffect } from "react";
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
  appName: "DataFi",
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [sepolia, mainnet, polygon, optimism, arbitrum, base, baseSepolia],
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  // Initialize ZK circuit on app startup
  useEffect(() => {
    setupZKVerification();
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
