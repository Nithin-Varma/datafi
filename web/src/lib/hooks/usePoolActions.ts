"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESSES, USER_ABI, POOL_ABI, POOL_FACTORY_ABI } from "../config";

// Hook for creating a pool through user contract
export function useCreatePool() {
  const createPool = useWriteContract();
  const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({
    hash: createPool.data,
  });

  const createPoolAction = async (
    userContractAddress: string,
    name: string,
    description: string,
    dataType: string,
    proofRequirements: Array<{
      name: string;
      description: string;
      proofType: number;
      isRequired: boolean;
    }>,
    pricePerData: bigint,
    totalBudget: bigint,
    deadline: bigint
  ) => {
    try {
      // Call User contract which will then call PoolFactory
      await createPool.writeContract({
        address: userContractAddress as `0x${string}`,
        abi: USER_ABI,
        functionName: "createPool",
        args: [name, description, dataType, proofRequirements, pricePerData, totalBudget, deadline],
        value: totalBudget, // Send the total budget as ETH
      });
    } catch (err) {
      console.error("Error creating pool:", err);
      throw err;
    }
  };

  return {
    createPool: createPoolAction,
    isLoading,
    isSuccess,
    error,
  };
}

// Hook for joining a pool through user contract
export function useJoinPool() {
  const joinPool = useWriteContract();
  const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({
    hash: joinPool.data,
  });

  const joinPoolAction = async (userContractAddress: string, poolAddress: string) => {
    try {
      await joinPool.writeContract({
        address: userContractAddress as `0x${string}`,
        abi: USER_ABI,
        functionName: "joinPool",
        args: [poolAddress as `0x${string}`],
        value: undefined,
      });
    } catch (err) {
      console.error("Error joining pool:", err);
      throw err;
    }
  };

  return {
    joinPool: joinPoolAction,
    isLoading,
    isSuccess,
    error,
  };
}

// Hook for submitting data to a pool with automatic Lighthouse encryption
export function useSubmitData() {
  const submitData = useWriteContract();
  const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({
    hash: submitData.data,
  });

  const submitDataAction = async (
    poolAddress: string,
    data: any,
    userAddress: string,
    signedMessage: string,
    poolOwnerAddress?: string
  ) => {
    try {
      console.log("📤 Submitting data with Lighthouse encryption...");

      // 1. Encrypt and upload data to Lighthouse
      const { lighthouseService } = await import('../lighthouse');

      const encryptionResult = await lighthouseService.encryptAndUpload(
        data,
        userAddress,
        signedMessage,
        "pool-data-submission"
      );

      console.log("🔐 Data encrypted with CID:", encryptionResult.encryptedCID);

      // 2. Share with pool owner if provided
      if (poolOwnerAddress) {
        await lighthouseService.shareWithBuyers(
          encryptionResult.encryptedCID,
          [poolOwnerAddress],
          userAddress,
          signedMessage
        );
        console.log("👯 Data shared with pool owner");
      }

      // 3. Submit the encrypted CID to the smart contract
      await submitData.writeContract({
        address: poolAddress as `0x${string}`,
        abi: POOL_ABI,
        functionName: "submitData",
        args: [encryptionResult.encryptedCID],
        value: undefined,
      });

      console.log("✅ Data submitted successfully with Lighthouse encryption");

    } catch (err) {
      console.error("Error submitting data:", err);
      throw err;
    }
  };

  return {
    submitData: submitDataAction,
    isLoading,
    isSuccess,
    error,
  };
}

// Hook for purchasing data from a pool with automatic Lighthouse access transfer
export function usePurchaseData() {
  const purchaseData = useWriteContract();
  const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({
    hash: purchaseData.data,
  });

  const purchaseDataAction = async (
    poolAddress: string,
    value: bigint,
    sellerAddress?: string,
    encryptedCID?: string,
    buyerAddress?: string,
    signedMessage?: string
  ) => {
    try {
      // 1. Execute the blockchain transaction
      await purchaseData.writeContract({
        address: poolAddress as `0x${string}`,
        abi: POOL_ABI,
        functionName: "purchaseData",
        args: [],
        value: value,
      });

      // 2. If we have the required info, transfer Lighthouse access
      if (sellerAddress && encryptedCID && buyerAddress && signedMessage) {
        console.log("💰 Purchase successful, transferring Lighthouse access...");

        // Import verification service for access transfer
        const { verificationService } = await import('../verification-service');

        const accessTransferred = await verificationService.transferDataAccess(
          poolAddress,
          buyerAddress,
          sellerAddress,
          encryptedCID,
          signedMessage
        );

        if (accessTransferred) {
          console.log("✅ Data access transferred to buyer successfully");
        } else {
          console.warn("⚠️ Purchase completed but access transfer failed");
        }
      }

    } catch (err) {
      console.error("Error purchasing data:", err);
      throw err;
    }
  };

  return {
    purchaseData: purchaseDataAction,
    isLoading,
    isSuccess,
    error,
  };
}

// Hook for verifying a seller in a pool (only pool creator can do this)
export function useVerifySeller() {
  const verifySeller = useWriteContract();
  const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({
    hash: verifySeller.data,
  });

  const verifySellerAction = async (poolAddress: string, sellerAddress: string, verified: boolean) => {
    try {
      await verifySeller.writeContract({
        address: poolAddress as `0x${string}`,
        abi: POOL_ABI,
        functionName: "verifySeller",
        args: [sellerAddress as `0x${string}`, verified],
        value: undefined,
      });
    } catch (err) {
      console.error("Error verifying seller:", err);
      throw err;
    }
  };

  return {
    verifySeller: verifySellerAction,
    isLoading,
    isSuccess,
    error,
  };
}

// Hook for closing a pool (only pool creator can do this)
// Note: closePool function is not available in the current POOL_ABI
export function useClosePool() {
  const closePool = useWriteContract();
  const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({
    hash: closePool.data,
  });

  const closePoolAction = async (poolAddress: string) => {
    try {
      // Note: closePool function is not available in the current POOL_ABI
      // This is a placeholder for future implementation
      throw new Error("closePool function is not available in the current contract");
    } catch (err) {
      console.error("Error closing pool:", err);
      throw err;
    }
  };

  return {
    closePool: closePoolAction,
    isLoading,
    isSuccess,
    error,
  };
}

// Hook for submitting proof to a pool
export function useSubmitProof() {
  const submitProof = useWriteContract();
  const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({
    hash: submitProof.data,
  });

  const submitProofAction = async (
    userContractAddress: string,
    poolAddress: string,
    proofName: string,
    proofHash: string
  ) => {
    try {
      await submitProof.writeContract({
        address: userContractAddress as `0x${string}`,
        abi: USER_ABI,
        functionName: "submitProof",
        args: [poolAddress as `0x${string}`, proofName, proofHash as `0x${string}`],
      });
    } catch (err) {
      console.error("Error submitting proof:", err);
      throw err;
    }
  };

  return {
    submitProof: submitProofAction,
    isLoading,
    isSuccess,
    error,
  };
}

// Hook for submitting Self proof to a pool with automatic Lighthouse encryption
export function useSubmitSelfProof() {
  const submitSelfProof = useWriteContract();
  const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({
    hash: submitSelfProof.data,
  });

  const submitSelfProofAction = async (
    userContractAddress: string,
    poolAddress: string,
    proofName: string,
    selfVerificationData: any,
    userAddress: string,
    signedMessage: string,
    poolOwnerAddress?: string
  ) => {
    try {
      console.log("🔏 Processing Self proof with Lighthouse encryption...");

      // 1. Process Self verification with automatic Lighthouse encryption
      const { verificationService } = await import('../verification-service');

      const verificationResult = await verificationService.processSelfVerification(
        poolAddress,
        userAddress,
        selfVerificationData
      );

      if (!verificationResult.success) {
        throw new Error(verificationResult.error || "Self verification failed");
      }

      // 2. Submit proof to smart contract
      await submitSelfProof.writeContract({
        address: userContractAddress as `0x${string}`,
        abi: USER_ABI,
        functionName: "submitSelfProof",
        args: [poolAddress as `0x${string}`, proofName, verificationResult.proofHash as `0x${string}`],
      });

      console.log("✅ Self proof submitted successfully with Lighthouse encryption");

    } catch (err) {
      console.error("Error submitting Self proof:", err);
      throw err;
    }
  };

  return {
    submitSelfProof: submitSelfProofAction,
    isLoading,
    isSuccess,
    error,
  };
}

// Hook for submitting ZK Email proof with automatic Lighthouse encryption
export function useSubmitZKEmailProof() {
  const submitZKEmailProof = useWriteContract();
  const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({
    hash: submitZKEmailProof.data,
  });

  const submitZKEmailProofAction = async (
    userContractAddress: string,
    poolAddress: string,
    proofName: string,
    emlContent: string,
    verificationType: 'registry' | 'hackerhouse' | 'netflix',
    userAddress: string,
    signedMessage: string,
    poolOwnerAddress?: string
  ) => {
    try {
      console.log("📧 Processing ZK Email proof with Lighthouse encryption...");

      // 1. Process ZK Email verification with automatic Lighthouse encryption
      const { verificationService } = await import('../verification-service');

      const verificationResult = await verificationService.processZKEmailVerification(
        poolAddress,
        userAddress,
        emlContent,
        verificationType,
        poolOwnerAddress
      );

      if (!verificationResult.success) {
        throw new Error(verificationResult.error || "ZK Email verification failed");
      }

      // 2. Submit proof to smart contract
      await submitZKEmailProof.writeContract({
        address: userContractAddress as `0x${string}`,
        abi: USER_ABI,
        functionName: "submitProof",
        args: [poolAddress as `0x${string}`, proofName, verificationResult.proofHash as `0x${string}`],
      });

      console.log("✅ ZK Email proof submitted successfully with Lighthouse encryption");

    } catch (err) {
      console.error("Error submitting ZK Email proof:", err);
      throw err;
    }
  };

  return {
    submitZKEmailProof: submitZKEmailProofAction,
    isLoading,
    isSuccess,
    error,
  };
}
