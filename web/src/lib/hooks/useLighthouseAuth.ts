"use client";

import { useSignMessage as useWagmiSignMessage, useAccount } from "wagmi";

/**
 * Hook for Lighthouse authentication with proper message format
 */
export function useLighthouseAuth() {
  const { address } = useAccount();
  const { signMessageAsync } = useWagmiSignMessage();

  const getLighthouseSignature = async (): Promise<string> => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    try {
      // Lighthouse expects a specific message format for authentication
      const message = `I am signing for Lighthouse encryption and access control.
Address: ${address}
Timestamp: ${Date.now()}`;

      const signature = await signMessageAsync({ message });

      console.log("✅ Lighthouse authentication signature created");
      return signature;
    } catch (error) {
      console.error("❌ Failed to create Lighthouse signature:", error);
      throw new Error("Failed to authenticate with Lighthouse");
    }
  };

  const getAuthMessage = (): string => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    return `I am signing for Lighthouse encryption and access control.
Address: ${address}
Timestamp: ${Date.now()}`;
  };

  return {
    getLighthouseSignature,
    getAuthMessage,
    address,
    isConnected: !!address
  };
}

export default useLighthouseAuth;