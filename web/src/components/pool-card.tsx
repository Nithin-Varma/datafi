"use client";

import { usePoolDetails } from "@/lib/hooks/usePools";
import { useJoinPool } from "@/lib/hooks/usePoolActions";
import { useUser } from "@/lib/hooks/useUser";
import { useUserPoolStatus } from "@/lib/hooks/useUserPoolStatus";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VerificationModal from "@/components/verification-modal";

interface PoolCardProps {
  poolAddress: string;
  onJoin?: (poolAddress: string) => void;
  onBuy?: (poolAddress: string) => void;
  onViewDetails?: (poolAddress: string) => void;
}

export function PoolCard({ poolAddress, onJoin, onBuy, onViewDetails }: PoolCardProps) {
  const { poolInfo, verifiedSellersCount, totalSellers, sellers, isLoading, error } = usePoolDetails(poolAddress);
  const { userContract, address: userEOA } = useUser();
  const { joinPool, isLoading: isJoining, isSuccess: joinedSuccessfully } = useJoinPool();
  const { hasJoined: contractHasJoined, isFullyVerified, isLoading: statusLoading, refetch } = useUserPoolStatus(poolAddress, userContract);
  const [isJoiningPool, setIsJoiningPool] = useState(false);
  const [justJoined, setJustJoined] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [localHasJoined, setLocalHasJoined] = useState(false);
  
  // Use contract state or local state (for immediate updates)
  const hasJoined = contractHasJoined || localHasJoined;
  const router = useRouter();

  // Show success message when joined and update local state
  useEffect(() => {
    if (joinedSuccessfully && !justJoined) {
      setJustJoined(true);
      setLocalHasJoined(true); // Immediately update local state
      // Manually refetch the user status after joining
      setTimeout(() => {
        refetch();
        alert("Successfully joined the pool! You can now submit data.");
      }, 1000);
    }
  }, [joinedSuccessfully, justJoined, refetch]);

  const formatEther = (wei: bigint) => {
    return Number(wei) / 1e18;
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const isPoolExpired = (deadline: bigint) => {
    return Date.now() / 1000 > Number(deadline);
  };

  // Determine user role - compare with both user contract and EOA address
  const isCreator = poolInfo?.creator?.toLowerCase() === userContract?.toLowerCase() || 
                    poolInfo?.creator?.toLowerCase() === userEOA?.toLowerCase();
  const isSeller = hasJoined; // Use contract state instead of local state
  
  // Debug logging
  console.log("Pool Card Debug:", {
    poolAddress,
    userContract,
    userEOA,
    creator: poolInfo?.creator,
    isCreator,
    isSeller,
    sellers,
    hasJoined,
    contractHasJoined,
    localHasJoined,
    joinedSuccessfully
  });

  const handleJoinPool = async () => {
    if (!userContract) {
      alert("Please connect your wallet first");
      return;
    }
    
    // Double-check creator status
    if (isCreator) {
      alert("You cannot join your own pool!");
      return;
    }
    
    setIsJoiningPool(true);
    try {
      await joinPool(userContract, poolAddress);
    } catch (error) {
      console.error("Error joining pool:", error);
      alert("Failed to join pool. Please try again.");
    } finally {
      setIsJoiningPool(false);
    }
  };

  const handleViewDetails = () => {
    router.push(`/pools/${poolAddress}`);
  };

  const handleSubmitAndVerify = () => {
    // Check if pool has age or nationality proof requirements
    const hasAgeOrNationality = poolInfo?.proofRequirements?.some(
      (req: any) => req.proofType === 0 || req.proofType === 1 // 0 = age, 1 = nationality
    );
    
    if (hasAgeOrNationality) {
      // Redirect to Self page for verification
      router.push('/self');
    } else {
      // Show verification modal for other proof types
      setIsVerificationModalOpen(true);
    }
  };

  // Early returns after all hooks
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !poolInfo) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="text-center text-gray-500">
          <p>Failed to load pool details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{poolInfo.name}</h3>
          <p className="text-gray-600 text-sm mb-3">{poolInfo.description}</p>
        </div>
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-blue-600">{formatEther(poolInfo.pricePerData)} ETH</div>
          <div className="text-sm text-gray-500">per data</div>
        </div>
      </div>

      {/* Pool Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Data Type</div>
          <div className="font-semibold text-gray-900">{poolInfo.dataType}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Budget</div>
          <div className="font-semibold text-gray-900">{formatEther(poolInfo.totalBudget)} ETH</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Sellers</div>
          <div className="font-semibold text-gray-900">{totalSellers} joined</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Deadline</div>
          <div className="font-semibold text-gray-900">{formatDate(poolInfo.deadline)}</div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          poolInfo.isActive && !isPoolExpired(poolInfo.deadline)
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}>
          {poolInfo.isActive && !isPoolExpired(poolInfo.deadline) ? "Active" : "Inactive"}
        </span>
      </div>

      {/* User Role Display */}
      {isCreator && (
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            👑 You created this pool
          </span>
        </div>
      )}

      {isSeller && !isCreator && (
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            ✅ You joined this pool
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-3">
        <Button
          onClick={handleViewDetails}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
        >
          View Details
        </Button>
        
        {/* Creator Actions */}
        {isCreator && (
          <div className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 text-center cursor-default">
            👑 Your Pool
          </div>
        )}
        
        {/* Join Pool for non-creators - ONLY if not joined */}
        {!isCreator && !hasJoined && (
          <Button
            onClick={handleJoinPool}
            disabled={isJoiningPool || isJoining}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50"
          >
            {isJoiningPool || isJoining ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                <span>Joining...</span>
              </div>
            ) : (
              "Join Pool"
            )}
          </Button>
        )}

        {/* Seller Actions */}
        {isSeller && !isCreator && (
          <Button
            onClick={handleSubmitAndVerify}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
          >
            Submit & Verify
          </Button>
        )}
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        poolAddress={poolAddress}
        proofRequirements={poolInfo?.proofRequirements || []}
      />
    </div>
  );
}