"use client";

import { useState, useEffect } from "react";
import { usePoolDetails } from "@/lib/hooks/usePools";
import { useUser } from "@/lib/hooks/useUser";
import { useVerifySeller } from "@/lib/hooks/useVerification";
import { Button } from "@/components/ui/button";

interface PoolDetailsModalProps {
  poolAddress: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PoolDetailsModal({ poolAddress, isOpen, onClose }: PoolDetailsModalProps) {
  const { poolInfo, sellers, verifiedSellersCount, totalSellers, isLoading } = usePoolDetails(poolAddress);
  const { userContract } = useUser();
  const { verifySeller, isLoading: isVerifying, isSuccess: verificationSuccess } = useVerifySeller();
  const [verifyingSeller, setVerifyingSeller] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Handle modal visibility with smooth transitions
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isCreator = poolInfo?.creator?.toLowerCase() === userContract?.toLowerCase();
  const isSeller = sellers?.includes(userContract as `0x${string}` || "");

  const formatEther = (wei: bigint) => {
    return Number(wei) / 1e18;
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const isPoolExpired = (deadline: bigint) => {
    return Date.now() / 1000 > Number(deadline);
  };

  const handleVerify = async (sellerAddress: string, verified: boolean) => {
    if (!userContract || !poolAddress) return;
    
    setVerifyingSeller(sellerAddress);
    try {
      await verifySeller(poolAddress, sellerAddress, verified);
      alert(`Seller ${verified ? 'verified' : 'rejected'} successfully!`);
    } catch (error) {
      console.error("Verification failed:", error);
      alert("Verification failed. Please try again.");
    } finally {
      setVerifyingSeller(null);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl transform transition-all duration-300 scale-100">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-3xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">
                {poolInfo?.name || "Pool Details"}
              </h2>
              <p className="text-blue-100 text-lg">
                {poolInfo?.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-3xl font-light transition-colors duration-200 ml-4"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Pool Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Price & Budget Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 text-xl">💰</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per Data:</span>
                  <span className="font-semibold text-green-600">{formatEther(poolInfo?.pricePerData as bigint)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Budget:</span>
                  <span className="font-semibold">{formatEther(poolInfo?.totalBudget as bigint)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-semibold text-blue-600">{formatEther(poolInfo?.remainingBudget as bigint)} ETH</span>
                </div>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-xl">⏰</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-semibold">{formatDate(poolInfo?.createdAt as bigint)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deadline:</span>
                  <span className="font-semibold">{formatDate(poolInfo?.deadline as bigint)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    poolInfo?.isActive && !isPoolExpired(poolInfo?.deadline)
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {poolInfo?.isActive && !isPoolExpired(poolInfo?.deadline) ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Sellers Card */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 text-xl">👥</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Sellers</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold">{totalSellers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verified:</span>
                  <span className="font-semibold text-green-600">{verifiedSellersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-semibold text-yellow-600">{totalSellers - verifiedSellersCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Type & Requirements */}
          <div className="bg-gray-50 p-6 rounded-2xl mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                📊
              </span>
              Pool Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Data Type:</span>
                <span className="ml-2 font-semibold text-gray-900">{poolInfo?.dataType}</span>
              </div>
              <div>
                <span className="text-gray-600">Creator:</span>
                <span className="ml-2 font-mono text-sm text-gray-700">
                  {poolInfo?.creator?.slice(0, 6)}...{poolInfo?.creator?.slice(-4)}
                </span>
              </div>
            </div>
          </div>

          {/* Sellers List */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                {isCreator ? "👑" : "👤"}
              </span>
              {isCreator ? "Sellers in this Pool" : "Your Status"}
            </h3>
            
            {sellers && sellers.length > 0 ? (
              <div className="space-y-4">
                {sellers.map((seller, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-mono text-sm text-gray-800 font-medium">
                            {seller.slice(0, 6)}...{seller.slice(-4)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Seller #{index + 1}
                          </p>
                        </div>
                      </div>
                      
                      {isCreator ? (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleVerify(seller, true)}
                            disabled={isVerifying || verifyingSeller === seller}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded-lg disabled:opacity-50 transition-all duration-200"
                          >
                            {verifyingSeller === seller ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                                <span>Verifying...</span>
                              </div>
                            ) : (
                              "✓ Verify"
                            )}
                          </Button>
                          <Button
                            onClick={() => handleVerify(seller, false)}
                            disabled={isVerifying || verifyingSeller === seller}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm rounded-lg disabled:opacity-50 transition-all duration-200"
                          >
                            {verifyingSeller === seller ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                                <span>Rejecting...</span>
                              </div>
                            ) : (
                              "✗ Reject"
                            )}
                          </Button>
                        </div>
                      ) : seller.toLowerCase() === userContract?.toLowerCase() ? (
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            You
                          </span>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                            Pending
                          </span>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                          Other Seller
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">No sellers yet</h4>
                <p className="text-gray-500">Be the first to join this pool!</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors duration-200"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}