"use client";

import { useState } from "react";
import * as lighthouse from "@lighthouse-web3/sdk";
import { useAccount } from "wagmi";

interface ZkEmailVerificationResult {
  isValid: boolean;
  proofHash: string;
  email: string;
  encryptedCid: string;
}

export function useZkEmailVerification() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  const verifyAndStore = async (
    emlFile: File,
    buyerAddress: string,
    poolAddress: string
  ): Promise<ZkEmailVerificationResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Read EML file content
      const emailContent = await readEmlFile(emlFile);

      // Step 2: Extract email from EML content
      const extractedEmail = extractEmailFromEml(emailContent);

      // Step 3: Verify ZK-Email proof (using deployed blueprint)
      const zkProofResult = await verifyZkEmailProof(emailContent);

      if (!zkProofResult.isValid) {
        throw new Error("ZK-Email verification failed");
      }

      // Step 4: Encrypt and store in Lighthouse
      const encryptionResult = await encryptAndStoreInLighthouse(
        extractedEmail,
        buyerAddress
      );

      return {
        isValid: true,
        proofHash: zkProofResult.proofHash,
        email: extractedEmail,
        encryptedCid: encryptionResult.cid,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Verification failed";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const readEmlFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error("Failed to read EML file"));
        }
      };
      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsText(file);
    });
  };

  const extractEmailFromEml = (emlContent: string): string => {
    // Extract email from EML headers
    const fromMatch = emlContent.match(/From:\s*.*?<(.+?)>/i);
    if (fromMatch && fromMatch[1]) {
      return fromMatch[1];
    }

    // Fallback: try to find email pattern
    const emailMatch = emlContent.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch && emailMatch[1]) {
      return emailMatch[1];
    }

    throw new Error("Could not extract email from EML file");
  };

  const verifyZkEmailProof = async (emailContent: string): Promise<{ isValid: boolean; proofHash: string }> => {
    try {
      // For demo purposes, we'll simulate ZK-Email verification
      // In production, you would call your ZK-Email circuit/blueprint

      // Check if email contains ZK-Verify hackerhouse keywords
      const hasZkVerifyKeywords = emailContent.toLowerCase().includes("zk-verify") &&
                                 emailContent.toLowerCase().includes("hackerhouse");

      if (!hasZkVerifyKeywords) {
        throw new Error("Email does not contain ZK-Verify hackerhouse verification");
      }

      // Simulate proof generation
      const proofHash = generateRandomProofHash();

      // In production, you would:
      // 1. Send email content to ZK-Email circuit
      // 2. Get back verification proof
      // 3. Verify proof on-chain

      return {
        isValid: true,
        proofHash: proofHash
      };

    } catch (error) {
      console.error("ZK-Email verification failed:", error);
      return {
        isValid: false,
        proofHash: ""
      };
    }
  };

  const encryptAndStoreInLighthouse = async (
    email: string,
    buyerAddress: string
  ): Promise<{ cid: string }> => {
    try {
      // Create email data object
      const emailData = {
        email: email,
        timestamp: new Date().toISOString(),
        verified: true,
        verificationMethod: "zk-email"
      };

      // Convert to JSON string
      const dataString = JSON.stringify(emailData);

      // Create a blob for upload
      const blob = new Blob([dataString], { type: 'application/json' });
      const file = new File([blob], 'verified-email.json', { type: 'application/json' });

      // Upload to Lighthouse with encryption
      const uploadResponse = await lighthouse.uploadEncrypted(
        [file],
        process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || '',
        address || '',
        '' // Use default JWT token
      );

      const cid = uploadResponse.data[0].Hash;

      // Share access with buyer
      await shareAccessWithBuyer(cid, buyerAddress);

      return { cid };

    } catch (error) {
      console.error("Lighthouse storage failed:", error);
      throw new Error("Failed to store encrypted email data");
    }
  };

  const shareAccessWithBuyer = async (cid: string, buyerAddress: string) => {
    try {
      // Share access with the buyer
      const shareResponse = await lighthouse.shareFile(
        address || '',
        [buyerAddress],
        cid,
        '' // Use default signature method
      );

      console.log("Access shared with buyer:", shareResponse);

    } catch (error) {
      console.error("Failed to share access with buyer:", error);
      throw new Error("Failed to grant buyer access to encrypted data");
    }
  };

  const generateRandomProofHash = (): string => {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    return '0x' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  return {
    verifyAndStore,
    isLoading,
    error,
  };
}