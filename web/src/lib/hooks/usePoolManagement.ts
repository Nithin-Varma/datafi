"use client";

import { useReadContract } from "wagmi";
import { POOL_ABI } from "../config";
import { useJoinPool, useSubmitData, usePurchaseData, useVerifySeller, useClosePool } from "./usePoolActions";

// Hook for managing a specific pool
export function usePoolManagement(poolAddress: string, userContractAddress?: string) {
  // Get pool info
  const { data: poolInfo, isLoading: poolInfoLoading, error: poolInfoError } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: POOL_ABI,
    functionName: "getPoolInfo",
  });

  // Get sellers
  const { data: sellers, isLoading: sellersLoading, error: sellersError } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: POOL_ABI,
    functionName: "getSellers",
  });

  // Get verified sellers count
  const { data: verifiedSellersCount, isLoading: verifiedLoading, error: verifiedError } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: POOL_ABI,
    functionName: "getVerifiedSellersCount",
  });

  // Get seller data for a specific seller
  // Note: getSellerData function is not available in the current POOL_ABI
  const getSellerData = (sellerAddress: string) => {
    // This is a placeholder for future implementation
    // The getSellerData function is not available in the current contract
    return {
      sellerData: null,
      isLoading: false,
      error: new Error("getSellerData function is not available in the current contract"),
    };
  };

  // Pool actions
  const { joinPool, isLoading: joiningPool, isSuccess: joinedPool } = useJoinPool();
  const { submitData, isLoading: submittingData, isSuccess: dataSubmitted } = useSubmitData();
  const { purchaseData, isLoading: purchasingData, isSuccess: dataPurchased } = usePurchaseData();
  const { verifySeller, isLoading: verifyingSeller, isSuccess: sellerVerified } = useVerifySeller();
  const { closePool, isLoading: closingPool, isSuccess: poolClosed } = useClosePool();

  return {
    // Pool data
    poolInfo,
    sellers: sellers || [],
    verifiedSellersCount: Number(verifiedSellersCount || 0),
    totalSellers: Array.isArray(sellers) ? sellers.length : 0,
    
    // Loading states
    isLoading: poolInfoLoading || sellersLoading || verifiedLoading,
    error: poolInfoError || sellersError || verifiedError,
    
    // Actions
    joinPool: () => userContractAddress ? joinPool(userContractAddress, poolAddress) : () => { throw new Error("User contract address is required to join pool"); },
    submitData: (encryptedData: string) => submitData(poolAddress, encryptedData),
    purchaseData: (value: bigint) => purchaseData(poolAddress, value),
    verifySeller: (sellerAddress: string, verified: boolean) => verifySeller(poolAddress, sellerAddress, verified),
    closePool: () => closePool(poolAddress),
    
    // Action states
    isJoining: joiningPool,
    isSubmitting: submittingData,
    isPurchasing: purchasingData,
    isVerifying: verifyingSeller,
    isClosing: closingPool,
    
    // Success states
    hasJoined: joinedPool,
    hasSubmitted: dataSubmitted,
    hasPurchased: dataPurchased,
    hasVerified: sellerVerified,
    hasClosed: poolClosed,
    
    // Helper functions
    getSellerData,
  };
}

// Hook for pool statistics
export function usePoolStats(poolAddress: string) {
  const { poolInfo, sellers, verifiedSellersCount, totalSellers, isLoading, error } = usePoolManagement(poolAddress);

  const stats = {
    totalBudget: poolInfo?.totalBudget || 0n,
    remainingBudget: poolInfo?.remainingBudget || 0n,
    pricePerData: poolInfo?.pricePerData || 0n,
    totalSellers,
    verifiedSellersCount,
    pendingSellers: totalSellers - verifiedSellersCount,
    isActive: poolInfo?.isActive || false,
    isExpired: poolInfo ? Date.now() / 1000 > Number(poolInfo.deadline) : false,
    createdAt: poolInfo?.createdAt || 0n,
    deadline: poolInfo?.deadline || 0n,
  };

  return {
    stats,
    isLoading,
    error,
  };
}

// Hook for pool creator actions (only pool creator can use these)
export function usePoolCreatorActions(poolAddress: string, creatorAddress: string) {
  const { poolInfo, verifySeller, closePool, isVerifying, isClosing, hasVerified, hasClosed } = usePoolManagement(poolAddress);
  
  const isCreator = poolInfo?.creator?.toLowerCase() === creatorAddress?.toLowerCase();
  
  return {
    isCreator,
    verifySeller: isCreator ? verifySeller : null,
    closePool: isCreator ? closePool : null,
    isVerifying,
    isClosing,
    hasVerified,
    hasClosed,
  };
}
