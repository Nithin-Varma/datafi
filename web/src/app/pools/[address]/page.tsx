"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/hooks/useUser";
import { usePoolDetails } from "@/lib/hooks/usePools";
import { useJoinPool, useVerifySeller } from "@/lib/hooks/usePoolActions";
import { useVerifySeller as useVerifySellerHook } from "@/lib/hooks/useVerification";
import { useUserPoolStatus } from "@/lib/hooks/useUserPoolStatus";
import Link from "next/link";

export default function PoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const poolAddress = params.address as string;
  
  const { userContract, address: userEOA } = useUser();
  const { poolInfo, sellers, verifiedSellersCount, totalSellers, isLoading, error } = usePoolDetails(poolAddress);
  const { joinPool, isLoading: isJoining, isSuccess: joinedSuccessfully } = useJoinPool();
  const { verifySeller, isLoading: isVerifying } = useVerifySellerHook();
  const { hasJoined, isFullyVerified, isLoading: statusLoading } = useUserPoolStatus(poolAddress, userContract);
  const [verifyingSeller, setVerifyingSeller] = useState<string | null>(null);
  const [justJoined, setJustJoined] = useState(false);

  // Show success message when joined
  useEffect(() => {
    if (joinedSuccessfully && !justJoined) {
      setJustJoined(true);
      setTimeout(() => {
        alert("Successfully joined the pool! You can now submit data.");
      }, 1000);
    }
  }, [joinedSuccessfully, justJoined]);


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
  
  // Debug logging (commented out for production)
  // console.log("Pool Details Debug:", {
  //   poolAddress,
  //   userContract,
  //   userEOA,
  //   creator: poolInfo?.creator,
  //   isCreator,
  //   isSeller,
  //   sellers,
  //   hasJoined
  // });

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
    
    try {
      await joinPool(userContract, poolAddress);
    } catch (error) {
      console.error("Error joining pool:", error);
      alert("Failed to join pool. Please try again.");
    }
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

  // Early returns after all hooks
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Pool Details</h3>
          <p className="text-gray-600">Fetching pool information...</p>
        </div>
      </div>
    );
  }

  if (error || !poolInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pool Not Found</h1>
          <p className="text-gray-600 mb-6">The requested pool could not be found.</p>
          <Link href="/pools" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Pools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/pools" 
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              ← Back to Pools
            </Link>
            <div className="flex space-x-3">
              {isCreator && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  👑 You created this pool
                </span>
              )}
              {isSeller && !isCreator && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  ✅ You joined this pool
                </span>
              )}
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{poolInfo.name}</h1>
          <p className="text-xl text-gray-600 mb-6">{poolInfo.description}</p>
        </div>

        {/* Pool Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Price Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 text-xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Price</h3>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {formatEther(poolInfo.pricePerData)} ETH
            </div>
            <div className="text-sm text-gray-500">per data point</div>
          </div>

          {/* Budget Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 text-xl">💼</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Budget</h3>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {formatEther(poolInfo.totalBudget)} ETH
            </div>
            <div className="text-sm text-gray-500">total budget</div>
          </div>

          {/* Sellers Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-purple-600 text-xl">👥</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Sellers</h3>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {totalSellers}
            </div>
            <div className="text-sm text-gray-500">{verifiedSellersCount} verified</div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-orange-600 text-xl">⏰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Status</h3>
            </div>
            <div className={`text-lg font-bold mb-1 ${
              poolInfo.isActive && !isPoolExpired(poolInfo.deadline)
                ? "text-green-600"
                : "text-red-600"
            }`}>
              {poolInfo.isActive && !isPoolExpired(poolInfo.deadline) ? "Active" : "Inactive"}
            </div>
            <div className="text-sm text-gray-500">
              Deadline: {formatDate(poolInfo.deadline)}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pool Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Pool Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Data Type:</span>
                  <span className="ml-2 font-semibold text-gray-900">{poolInfo.dataType}</span>
                </div>
                <div>
                  <span className="text-gray-600">Creator:</span>
                  <span className="ml-2 font-mono text-sm text-gray-700">
                    {poolInfo.creator?.slice(0, 6)}...{poolInfo.creator?.slice(-4)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Remaining Budget:</span>
                  <span className="ml-2 font-semibold text-gray-900">{formatEther(poolInfo.remainingBudget)} ETH</span>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 font-semibold text-gray-900">{formatDate(poolInfo.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Sellers List */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {isCreator ? "Sellers in this Pool" : "Your Status"}
              </h3>
              
              {sellers && sellers.length > 0 ? (
                <div className="space-y-3">
                  {sellers.map((seller, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
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
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded-lg disabled:opacity-50"
                            >
                              {verifyingSeller === seller ? "Verifying..." : "✓ Verify"}
                            </Button>
                            <Button
                              onClick={() => handleVerify(seller, false)}
                              disabled={isVerifying || verifyingSeller === seller}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm rounded-lg disabled:opacity-50"
                            >
                              {verifyingSeller === seller ? "Rejecting..." : "✗ Reject"}
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
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">👥</div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No sellers yet</h4>
                  <p className="text-gray-500">Be the first to join this pool!</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
              {!isCreator && !isSeller && (
                <Button
                  onClick={handleJoinPool}
                  disabled={isJoining}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold mb-4 disabled:opacity-50"
                >
                  {isJoining ? "Joining..." : "Join Pool"}
                </Button>
              )}

              {isSeller && !isCreator && (
                <Link
                  href={`/pools/${poolAddress}/verify`}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold mb-4 text-center block"
                >
                  Submit Proofs
                </Link>
              )}

              {isCreator && (
                <div className="space-y-4">
                  <div className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold text-center cursor-default">
                    👑 Your Pool
                  </div>
                  <div className="text-sm text-gray-600">
                    As the creator, you can verify sellers and manage the pool.
                  </div>
                  <div className="text-sm text-gray-500">
                    Use the seller list to verify or reject sellers.
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-2">Pool Address:</div>
                <div className="font-mono text-xs text-gray-500 break-all">
                  {poolAddress}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}