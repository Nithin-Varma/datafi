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

// Hook for submitting data to a pool
export function useSubmitData() {
  const submitData = useWriteContract();
  const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({
    hash: submitData.data,
  });

  const submitDataAction = async (poolAddress: string, encryptedData: string) => {
    try {
      await submitData.writeContract({
        address: poolAddress as `0x${string}`,
        abi: POOL_ABI,
        functionName: "submitData",
        args: [encryptedData],
        value: undefined,
      });
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

// Hook for purchasing data from a pool
export function usePurchaseData() {
  const purchaseData = useWriteContract();
  const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({
    hash: purchaseData.data,
  });

  const purchaseDataAction = async (poolAddress: string, value: bigint) => {
    try {
      await purchaseData.writeContract({
        address: poolAddress as `0x${string}`,
        abi: POOL_ABI,
        functionName: "purchaseData",
        args: [],
        value: value,
      });
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
export function useClosePool() {
  const closePool = useWriteContract();
  const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({
    hash: closePool.data,
  });

  const closePoolAction = async (poolAddress: string) => {
    try {
      await closePool.writeContract({
        address: poolAddress as `0x${string}`,
        abi: POOL_ABI,
        functionName: "closePool",
        args: [],
        value: undefined,
      });
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

// Hook for submitting Self proof to a pool
export function useSubmitSelfProof() {
  const submitSelfProof = useWriteContract();
  const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({
    hash: submitSelfProof.data,
  });

  const submitSelfProofAction = async (
    userContractAddress: string,
    poolAddress: string,
    proofName: string,
    selfProofHash: string
  ) => {
    try {
      await submitSelfProof.writeContract({
        address: userContractAddress as `0x${string}`,
        abi: USER_ABI,
        functionName: "submitSelfProof",
        args: [poolAddress as `0x${string}`, proofName, selfProofHash as `0x${string}`],
      });
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
