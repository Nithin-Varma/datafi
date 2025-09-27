"use client";

import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESSES, USER_ABI } from "../config";
import { useMultiplePoolDetails } from "./usePools";

// Hook to get user's created pools
export function useUserCreatedPools(userContractAddress: string) {
  const { data: createdPools, isLoading, error } = useReadContract({
    address: userContractAddress as `0x${string}`,
    abi: USER_ABI,
    functionName: "getCreatedPools",
  });

  return {
    createdPools: createdPools || [],
    isLoading,
    error,
  };
}

// Hook to get user's joined pools
export function useUserJoinedPools(userContractAddress: string) {
  const { data: joinedPools, isLoading, error } = useReadContract({
    address: userContractAddress as `0x${string}`,
    abi: USER_ABI,
    functionName: "getJoinedPools",
  });

  return {
    joinedPools: joinedPools || [],
    isLoading,
    error,
  };
}

// Hook to get user's pool counts
export function useUserPoolCounts(userContractAddress: string) {
  const { data: createdCount, isLoading: createdLoading, error: createdError } = useReadContract({
    address: userContractAddress as `0x${string}`,
    abi: USER_ABI,
    functionName: "getCreatedPoolsCount",
  });

  const { data: joinedCount, isLoading: joinedLoading, error: joinedError } = useReadContract({
    address: userContractAddress as `0x${string}`,
    abi: USER_ABI,
    functionName: "getJoinedPoolsCount",
  });

  return {
    createdCount: Number(createdCount || 0),
    joinedCount: Number(joinedCount || 0),
    isLoading: createdLoading || joinedLoading,
    error: createdError || joinedError,
  };
}

// Hook to get user's financial stats
export function useUserFinancialStats(userContractAddress: string) {
  const { data: totalSpent, isLoading: spentLoading, error: spentError } = useReadContract({
    address: userContractAddress as `0x${string}`,
    abi: USER_ABI,
    functionName: "getTotalSpent",
  });

  const { data: totalEarned, isLoading: earnedLoading, error: earnedError } = useReadContract({
    address: userContractAddress as `0x${string}`,
    abi: USER_ABI,
    functionName: "getTotalEarned",
  });

  return {
    totalSpent: totalSpent || 0n,
    totalEarned: totalEarned || 0n,
    isLoading: spentLoading || earnedLoading,
    error: spentError || earnedError,
  };
}

// Hook to get user's created pools with full details
export function useUserCreatedPoolsWithDetails(userContractAddress: string) {
  const { createdPools, isLoading: poolsLoading, error: poolsError } = useUserCreatedPools(userContractAddress);

  return {
    createdPools: createdPools.map(address => ({ address })),
    isLoading: poolsLoading,
    error: poolsError,
  };
}

// Hook to get user's joined pools with full details
export function useUserJoinedPoolsWithDetails(userContractAddress: string) {
  const { joinedPools, isLoading: poolsLoading, error: poolsError } = useUserJoinedPools(userContractAddress);

  return {
    joinedPools: joinedPools.map(address => ({ address })),
    isLoading: poolsLoading,
    error: poolsError,
  };
}
