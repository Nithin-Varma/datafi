"use client";

import { useState } from "react";
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

  if (!isOpen) return null;

  const isCreator = poolInfo?.creator?.toLowerCase() === userContract?.toLowerCase();
  const isSeller = sellers?.includes(userContract || "");

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

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-transform duration-200 scale-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {poolInfo?.name || "Pool Details"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Pool Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pool Information</h3>
            <div className="space-y-2">
              <p><strong>Description:</strong> {poolInfo?.description}</p>
              <p><strong>Data Type:</strong> {poolInfo?.dataType}</p>
              <p><strong>Price per Data:</strong> {formatEther(poolInfo?.pricePerData || 0n)} ETH</p>
              <p><strong>Total Budget:</strong> {formatEther(poolInfo?.totalBudget || 0n)} ETH</p>
              <p><strong>Remaining Budget:</strong> {formatEther(poolInfo?.remainingBudget || 0n)} ETH</p>
              <p><strong>Created:</strong> {formatDate(poolInfo?.createdAt || 0n)}</p>
              <p><strong>Deadline:</strong> {formatDate(poolInfo?.deadline || 0n)}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  poolInfo?.isActive && !isPoolExpired(poolInfo?.deadline || 0n)
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {poolInfo?.isActive && !isPoolExpired(poolInfo?.deadline || 0n) ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Statistics</h3>
            <div className="space-y-2">
              <p><strong>Total Sellers:</strong> {totalSellers}</p>
              <p><strong>Verified Sellers:</strong> {verifiedSellersCount}</p>
              <p><strong>Pending Verification:</strong> {totalSellers - verifiedSellersCount}</p>
            </div>
          </div>
        </div>

        {/* Sellers List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isCreator ? "Sellers in this Pool" : "Your Verification Status"}
          </h3>
          
          {sellers && sellers.length > 0 ? (
            <div className="space-y-3">
              {sellers.map((seller, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm text-gray-600">
                        {seller.slice(0, 6)}...{seller.slice(-4)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Seller #{index + 1}
                      </p>
                    </div>
                    
                    {isCreator ? (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleVerify(seller, true)}
                          disabled={isVerifying || verifyingSeller === seller}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm disabled:opacity-50"
                        >
                          {verifyingSeller === seller ? (
                            <div className="flex items-center space-x-1">
                              <div className="animate-spin rounded-full h-3 w-3 border border-white/20 border-t-white"></div>
                              <span>Verifying...</span>
                            </div>
                          ) : (
                            "✓ Verify"
                          )}
                        </Button>
                        <Button
                          onClick={() => handleVerify(seller, false)}
                          disabled={isVerifying || verifyingSeller === seller}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm disabled:opacity-50"
                        >
                          {verifyingSeller === seller ? (
                            <div className="flex items-center space-x-1">
                              <div className="animate-spin rounded-full h-3 w-3 border border-white/20 border-t-white"></div>
                              <span>Rejecting...</span>
                            </div>
                          ) : (
                            "✗ Reject"
                          )}
                        </Button>
                      </div>
                    ) : seller.toLowerCase() === userContract?.toLowerCase() ? (
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          You
                        </span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          Pending Verification
                        </span>
                      </div>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        Other Seller
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-gray-600">No sellers have joined this pool yet.</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-8">
          <Button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
