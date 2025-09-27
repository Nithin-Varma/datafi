"use client";

import { usePoolDetails } from "@/lib/hooks/usePools";
import { useJoinPool } from "@/lib/hooks/usePoolActions";
import { useUser } from "@/lib/hooks/useUser";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { PoolDetailsModal } from "@/components/pool-details-modal";
import VerificationModal from "@/components/verification-modal";

interface PoolCardProps {
  poolAddress: string;
  onJoin?: (poolAddress: string) => void;
  onBuy?: (poolAddress: string) => void;
  onViewDetails?: (poolAddress: string) => void;
}

export function PoolCard({ poolAddress, onJoin, onBuy, onViewDetails }: PoolCardProps) {
  const { poolInfo, verifiedSellersCount, totalSellers, sellers, isLoading, error } = usePoolDetails(poolAddress);
  const { userContract } = useUser();
  const { joinPool, isLoading: isJoining, isSuccess: joinedSuccessfully } = useJoinPool();
  const [isJoiningPool, setIsJoiningPool] = useState(false);
  const [modalType, setModalType] = useState<'none' | 'details' | 'verification'>('none');
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [justJoined, setJustJoined] = useState(false);

  // Ensure only one modal is open at a time
  useEffect(() => {
    // This is now handled by the single modalType state
  }, [modalType]);

  // Show success message when joined and update local state
  if (joinedSuccessfully && !justJoined) {
    setJustJoined(true);
    setTimeout(() => {
      alert("Successfully joined the pool! You can now submit data.");
    }, 1000);
  }

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

  const formatEther = (wei: bigint) => {
    return Number(wei) / 1e18;
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const isPoolExpired = (deadline: bigint) => {
    return Date.now() / 1000 > Number(deadline);
  };

  // Determine user role
  const isCreator = poolInfo?.creator?.toLowerCase() === userContract?.toLowerCase();
  const isSeller = sellers?.includes(userContract as `0x${string}` || "" as `0x${string}`) || justJoined;

  const handleViewDetails = () => {
    if (isModalLoading) return; // Prevent rapid clicking
    
    // Close any open modals first
    setModalType('none');
    
    // Use requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
      if (isCreator) {
        setModalType('details');
      } else if (isSeller) {
        setModalType('verification');
      } else {
        // Regular user - show basic details
        setModalType('details');
      }
    });
  };

  // Close modals with proper state management
  const closeModal = () => {
    setModalType('none');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:scale-105 flex flex-col">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
          <span className="text-lg">📊</span>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {poolInfo.name}
          </h3>
          <p className="text-gray-600 text-sm">
            {poolInfo.dataType} • {formatDate(poolInfo.createdAt)}
          </p>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4 leading-relaxed text-sm flex-1">
        {poolInfo.description}
      </p>
      
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {formatEther(poolInfo.pricePerData)} ETH
        </div>
        <div className="text-gray-600 text-sm">
          per data point
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
          <div className="text-xs text-gray-600 mb-1">Budget</div>
          <div className="text-sm font-bold text-gray-900">
            {formatEther(poolInfo.totalBudget)} ETH
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
          <div className="text-xs text-gray-600 mb-1">Remaining</div>
          <div className="text-sm font-bold text-gray-900">
            {formatEther(poolInfo.remainingBudget)} ETH
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
          <div className="text-xs text-gray-600 mb-1">Sellers</div>
          <div className="text-sm font-bold text-gray-900">
            {verifiedSellersCount}/{totalSellers}
          </div>
        </div>
      </div>

      <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                poolInfo.isActive && !isPoolExpired(poolInfo.deadline)
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}>
                {poolInfo.isActive && !isPoolExpired(poolInfo.deadline) ? "🟢 Active" : "🔴 Inactive"}
              </span>
              
              {(isSeller || justJoined) && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  ✅ You're a Seller
                </span>
              )}
              
              {isCreator && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  👑 Pool Creator
                </span>
              )}
            </div>
            
            {isPoolExpired(poolInfo.deadline) && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                ⏰ Expired
              </span>
            )}
          </div>
        
        <div className="flex space-x-2">
          {/* Show join button only if user is NOT creator and NOT already a seller */}
          {!isCreator && !isSeller && !justJoined && (
            <Button
              onClick={async () => {
                if (userContract) {
                  setIsJoiningPool(true);
                  try {
                    await joinPool(userContract, poolAddress);
                    if (onJoin) {
                      onJoin(poolAddress);
                    }
                  } catch (error) {
                    console.error("Failed to join pool:", error);
                    alert("Failed to join pool. Please try again.");
                  } finally {
                    setIsJoiningPool(false);
                  }
                } else {
                  alert("Please create a user account first.");
                }
              }}
              disabled={!poolInfo.isActive || isPoolExpired(poolInfo.deadline) || isJoiningPool || isJoining}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 text-sm"
            >
              {isJoiningPool || isJoining ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                  <span>Joining...</span>
                </div>
              ) : (
                "🚀 Join as Seller"
              )}
            </Button>
          )}
          
          {/* Show buy button only for non-sellers when there are verified sellers */}
          {!isCreator && !isSeller && !justJoined && verifiedSellersCount > 0 && (
            <Button
              onClick={() => onBuy?.(poolAddress)}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-800 text-white font-semibold px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm"
            >
              💰 Buy Data
            </Button>
          )}
          
          <Button
            onClick={handleViewDetails}
            disabled={isModalLoading}
            className={`${isCreator || isSeller || justJoined ? 'w-full' : ''} bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-300 text-sm disabled:opacity-50`}
          >
            {isModalLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                <span>Loading...</span>
              </div>
            ) : (
              isCreator ? "👥 Manage" : (isSeller || justJoined) ? "✅ Verify" : "👁️ View"
            )}
          </Button>
        </div>
      </div>

      {/* Modals */}
      {modalType === 'details' && (
        <PoolDetailsModal
          poolAddress={poolAddress}
          isOpen={true}
          onClose={closeModal}
        />
      )}
      
      {modalType === 'verification' && (
        <VerificationModal
          poolAddress={poolAddress}
          isOpen={true}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
