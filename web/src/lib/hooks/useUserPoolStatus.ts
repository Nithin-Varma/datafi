import { useReadContract } from "wagmi";
import { POOL_ABI } from "@/lib/config";

export function useUserPoolStatus(poolAddress: string, userAddress: string | null) {
  // Check if user has joined the pool
  const { data: hasJoined, isLoading: isJoinedLoading, error: joinedError, refetch } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: POOL_ABI,
    functionName: "hasUserJoined",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress && !!poolAddress,
      staleTime: 5000, // Cache for 5 seconds (shorter)
      refetchInterval: 10000, // Refetch every 10 seconds (more frequent)
    },
  });

  // Debug logging
  console.log("useUserPoolStatus Debug:", {
    poolAddress,
    userAddress,
    hasJoined,
    isJoinedLoading,
    joinedError
  });

  // Check if user is fully verified
  const { data: isFullyVerified, isLoading: isVerifiedLoading, error: verifiedError } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: POOL_ABI,
    functionName: "isUserFullyVerified",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress && !!poolAddress,
      staleTime: 5000,
      refetchInterval: 10000,
    },
  });

  return {
    hasJoined: hasJoined || false,
    isFullyVerified: isFullyVerified || false,
    isLoading: isJoinedLoading || isVerifiedLoading,
    error: joinedError || verifiedError,
    refetch, // Expose refetch function for manual refresh
  };
}
