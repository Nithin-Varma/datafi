"use client";

import { useUser } from "@/lib/hooks/useUser";
import { useUserPoolCounts, useUserFinancialStats, useUserCreatedPoolsWithDetails, useUserJoinedPoolsWithDetails } from "@/lib/hooks/useUserPools";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { DashboardSkeleton } from "@/components/skeleton-loading";

export default function Dashboard() {
  const { isConnected } = useAccount();
  const { isUserCreated, isLoading, userEOA, userContractAddress } = useUser();
  const router = useRouter();

  // Get user's pool counts and financial stats (with caching)
  const { createdCount, joinedCount, isLoading: countsLoading } = useUserPoolCounts(userContractAddress || "");
  const { totalSpent, totalEarned, isLoading: financialLoading } = useUserFinancialStats(userContractAddress || "");
  
  // Get user's pools (simplified to avoid hooks rule violations)
  const { createdPools, isLoading: createdPoolsLoading } = useUserCreatedPoolsWithDetails(userContractAddress || "");
  const { joinedPools, isLoading: joinedPoolsLoading } = useUserJoinedPoolsWithDetails(userContractAddress || "");

  // Only show loading if we don't have user contract address yet
  const isLoadingData = isLoading || (!userContractAddress && (countsLoading || financialLoading || createdPoolsLoading || joinedPoolsLoading));

  // Debug logging
  console.log("Dashboard debug:", { isConnected, isUserCreated, isLoading });

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (isLoadingData) {
    return <DashboardSkeleton />;
  }

  // Show loading while checking user status
  if (isConnected && isUserCreated === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Checking User Status</h3>
          <p className="text-gray-600">Verifying your account...</p>
        </div>
      </div>
    );
  }

  if (!isUserCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h2>
          <p className="text-gray-600 mb-6">Please create your account first.</p>
          <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">DataFi</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/pools" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
              Pools
            </Link>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-600">
                U
              </span>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-white rounded-2xl p-8 mb-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back!
              </h2>
              <p className="text-gray-600 text-lg">
                Your DataFi Dashboard
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {totalEarned ? `${Number(totalEarned) / 1e18}` : "0"} ETH
              </div>
              <div className="text-gray-600">Total Earnings</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 mb-1">{createdCount}</div>
            <div className="text-gray-600">Pools Created</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 mb-1">{joinedCount}</div>
            <div className="text-gray-600">Pools Joined</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 mb-1">{Number(totalEarned) / 1e18}</div>
            <div className="text-gray-600">ETH Earned</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 mb-1">{Number(totalSpent) / 1e18}</div>
            <div className="text-gray-600">ETH Spent</div>
          </div>
        </div>

        {/* My Pools Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Created Pools */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">My Created Pools</h3>
              <Link href="/pools" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
                {createdPools.length > 0 ? (
                  <div className="space-y-3">
                    {createdPools.map((pool, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-sm font-mono text-gray-600">
                          {pool.address.slice(0, 6)}...{pool.address.slice(-4)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-gray-600 mb-4">You haven't created any pools yet</p>
                    <Link href="/pools" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Create Pool
                    </Link>
                  </div>
                )}
          </div>

          {/* Joined Pools */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">My Joined Pools</h3>
              <Link href="/pools" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Browse Pools
              </Link>
            </div>
                {joinedPools.length > 0 ? (
                  <div className="space-y-3">
                    {joinedPools.map((pool, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-sm font-mono text-gray-600">
                          {pool.address.slice(0, 6)}...{pool.address.slice(-4)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🤝</div>
                    <p className="text-gray-600 mb-4">You haven't joined any pools yet</p>
                    <Link href="/pools" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Browse Pools
                    </Link>
                  </div>
                )}
          </div>
        </div>

        {/* Account Summary */}
        <div className="bg-white rounded-2xl p-6 mt-8 border border-gray-100 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Account Summary</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Earned</label>
              <p className="text-gray-900 font-medium text-lg">
                {Number(totalEarned) / 1e18} ETH
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Spent</label>
              <p className="text-gray-900 font-medium text-lg">
                {Number(totalSpent) / 1e18} ETH
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Net Profit</label>
              <p className="text-gray-900 font-medium text-lg">
                {(Number(totalEarned) - Number(totalSpent)) / 1e18} ETH
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Active Pools</label>
              <p className="text-gray-900 font-medium text-lg">
                {createdCount + joinedCount} pools
              </p>
            </div>
          </div>
        </div>

        {/* User Addresses */}
        <div className="bg-white rounded-2xl p-6 mt-8 border border-gray-100 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Addresses</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address (EOA)</label>
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="text-sm font-mono text-gray-900 break-all">
                  {userEOA || "Not connected"}
                </p>
                {userEOA && (
                  <button 
                    onClick={() => navigator.clipboard.writeText(userEOA)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    📋 Copy Address
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Contract Address</label>
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="text-sm font-mono text-gray-900 break-all">
                  {userContractAddress || "Not created"}
                </p>
                {userContractAddress && (
                  <button 
                    onClick={() => navigator.clipboard.writeText(userContractAddress)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    📋 Copy Address
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {userEOA && userContractAddress && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">ℹ️</span>
                <p className="text-sm text-blue-800">
                  <strong>Your User Contract:</strong> This is your personal smart contract that tracks your pools, earnings, and spending. 
                  All your DataFi activities are managed through this contract.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
