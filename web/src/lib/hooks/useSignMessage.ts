"use client";

import { useSignMessage as useWagmiSignMessage, useAccount } from "wagmi";

/**
 * Hook for getting signed messages required for Lighthouse authentication
 */
export function useSignMessage() {
  const { address } = useAccount();
  const { signMessageAsync } = useWagmiSignMessage();

  const getSignedMessage = async (customMessage?: string): Promise<string> => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    try {
      const message = customMessage || `Sign this message to authenticate with Lighthouse for DataFi.
Address: ${address}
Timestamp: ${Date.now()}
Nonce: ${Math.random().toString(36).substring(7)}`;

      const signature = await signMessageAsync({ message });

      console.log("✅ Message signed successfully");
      return signature;
    } catch (error) {
      console.error("❌ Failed to sign message:", error);
      throw new Error("Failed to sign message for Lighthouse authentication");
    }
  };

  return {
    getSignedMessage,
    address,
  };
}

export default useSignMessage;