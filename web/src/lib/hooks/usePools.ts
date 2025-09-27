"use client";

import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESSES, POOL_FACTORY_ABI, POOL_ABI } from "../config";

// Hook to get all pools from PoolFactory
export function useAllPools() {
  const { data: allPools, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.POOL_FACTORY as `0x${string}`,
    abi: POOL_FACTORY_ABI,
    functionName: "getAllPools",
    query: {
      staleTime: 30000, // Cache for 30 seconds
      refetchInterval: 60000, // Refetch every minute
    },
  });

  return {
    allPools: allPools || [],
    isLoading,
    error,
  };
}

// Hook to get active pools from PoolFactory
export function useActivePools() {
  const { data: activePools, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.POOL_FACTORY as `0x${string}`,
    abi: POOL_FACTORY_ABI,
    functionName: "getActivePools",
  });

  return {
    activePools: activePools || [],
    isLoading,
    error,
  };
}

// Hook to get pools by data type
export function usePoolsByDataType(dataType: string) {
  const { data: pools, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.POOL_FACTORY as `0x${string}`,
    abi: POOL_FACTORY_ABI,
    functionName: "getPoolsByDataType",
    args: [dataType],
  });

  return {
    pools: pools || [],
    isLoading,
    error,
  };
}

// Hook to get total pools count
export function useTotalPools() {
  const { data: totalPools, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.POOL_FACTORY as `0x${string}`,
    abi: POOL_FACTORY_ABI,
    functionName: "getTotalPools",
  });

  return {
    totalPools: Number(totalPools || 0),
    isLoading,
    error,
  };
}

// Hook to get creator pools
export function useCreatorPools(creatorAddress: string) {
  const { data: creatorPools, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.POOL_FACTORY as `0x${string}`,
    abi: POOL_FACTORY_ABI,
    functionName: "getCreatorPools",
    args: [creatorAddress],
  });

  return {
    creatorPools: creatorPools || [],
    isLoading,
    error,
  };
}

// Hook to get individual pool details
export function usePoolDetails(poolAddress: string) {
  const { data: poolInfo, isLoading: poolInfoLoading, error: poolInfoError } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: POOL_ABI,
    functionName: "getPoolInfo",
    query: {
      staleTime: 15000, // Cache for 15 seconds
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  const { data: sellersCount, isLoading: sellersCountLoading, error: sellersCountError } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: POOL_ABI,
    functionName: "getJoinedSellersCount",
    query: {
      staleTime: 10000, // Cache for 10 seconds
      refetchInterval: 20000, // Refetch every 20 seconds
    },
  });

  const { data: sellers, isLoading: sellersLoading, error: sellersError } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: POOL_ABI,
    functionName: "getJoinedSellers",
    query: {
      staleTime: 10000, // Cache for 10 seconds
      refetchInterval: 20000, // Refetch every 20 seconds
    },
  });


  return {
    poolInfo,
    verifiedSellersCount: Number(sellersCount || 0), // Use sellersCount instead of verifiedSellersCount
    totalSellers: Array.isArray(sellers) ? sellers.length : 0,
    sellers: sellers || [],
    isLoading: poolInfoLoading || sellersCountLoading || sellersLoading,
    error: poolInfoError || sellersCountError || sellersError,
  };
}

// Hook to get multiple pool details at once
export function useMultiplePoolDetails(poolAddresses: string[]) {
  // We can't call hooks in a loop, so we'll return a simplified version
  // that the component can use to fetch individual pool details
  return {
    poolAddresses,
    isLoading: false,
    error: null,
  };
}
