"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESSES, USER_ABI, POOL_ABI } from "../config";

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
    pricePerData: bigint,
    totalBudget: bigint,
    deadline: bigint
  ) => {
    try {
      await createPool.writeContract({
        address: userContractAddress as `0x${string}`,
        abi: USER_ABI,
        functionName: "createPool",
        args: [name, description, dataType, pricePerData, totalBudget, deadline],
        value: 0n,
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

// Hook for joining a pool
export function useJoinPool() {
  const joinPool = useWriteContract();
  const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({
    hash: joinPool.data,
  });

  const joinPoolAction = async (poolAddress: string) => {
    try {
      await joinPool.writeContract({
        address: poolAddress as `0x${string}`,
        abi: POOL_ABI,
        functionName: "joinPool",
        args: [],
        value: 0n,
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
        value: 0n,
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
        args: [sellerAddress, verified],
        value: 0n,
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
        value: 0n,
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
