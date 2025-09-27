import { useReadContract } from "wagmi";
import { POOL_ABI } from "@/lib/config";

export function useUserPoolStatus(poolAddress: string, userAddress: string | null) {
  // Check if user has joined the pool
  const { data: hasJoined, isLoading: isJoinedLoading, error: joinedError } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: POOL_ABI,
    functionName: "hasUserJoined",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress && !!poolAddress,
      staleTime: 10000, // Cache for 10 seconds
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  // Note: isUserFullyVerified function was removed from contract
  // For now, we'll assume users are not fully verified until they complete all proofs
  const isFullyVerified = false;
  const isVerifiedLoading = false;
  const verifiedError = null;

  return {
    hasJoined: hasJoined || false,
    isFullyVerified: isFullyVerified || false,
    isLoading: isJoinedLoading || isVerifiedLoading,
    error: joinedError || verifiedError,
  };
}
