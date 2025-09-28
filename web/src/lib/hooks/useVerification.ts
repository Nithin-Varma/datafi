"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESSES, POOL_ABI } from "../config";

// Hook for verifying a seller (only pool creator can do this)
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

// Hook for submitting verification data (for sellers)
export function useSubmitVerification() {
  const submitVerification = useWriteContract();
  const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({
    hash: submitVerification.data,
  });

  const submitVerificationAction = async (poolAddress: string, encryptedData: string) => {
    try {
      await submitVerification.writeContract({
        address: poolAddress as `0x${string}`,
        abi: POOL_ABI,
        functionName: "submitData",
        args: [encryptedData],
        value: undefined,
      });
    } catch (err) {
      console.error("Error submitting verification:", err);
      throw err;
    }
  };

  return {
    submitVerification: submitVerificationAction,
    isLoading,
    isSuccess,
    error,
  };
}
