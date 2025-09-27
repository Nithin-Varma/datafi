"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESSES, POOL_FACTORY_ABI, POOL_ABI } from "@/lib/config";


interface PoolInfo {
  name: string;
  description: string;
  dataType: string;
  pricePerData: bigint;
  totalBudget: bigint;
  remainingBudget: bigint;
  creator: string;
  isActive: boolean;
  createdAt: bigint;
  deadline: bigint;
}

interface PoolData {
  address: string;
  info: PoolInfo;
  verifiedSellersCount: number;
  totalSellers: number;
}

export function PoolList() {
  const [pools, setPools] = useState<PoolData[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Get all pools
  const { data: allPools } = useReadContract({
    address: CONTRACT_ADDRESSES.POOL_FACTORY as `0x${string}`,
    abi: POOL_FACTORY_ABI,
    functionName: "getAllPools",
  });

  // Get pools by data type
  const { data: emailPools } = useReadContract({
    address: CONTRACT_ADDRESSES.POOL_FACTORY as `0x${string}`,
    abi: POOL_FACTORY_ABI,
    functionName: "getPoolsByDataType",
    args: ["email"],
  });

  const { data: phonePools } = useReadContract({
    address: CONTRACT_ADDRESSES.POOL_FACTORY as `0x${string}`,
    abi: POOL_FACTORY_ABI,
    functionName: "getPoolsByDataType",
    args: ["phone"],
  });

  useEffect(() => {
    const loadPools = async () => {
      if (!allPools) return;

      setLoading(true);
      const poolData: PoolData[] = [];

      for (const poolAddress of allPools) {
        try {
          // This would need to be implemented with proper contract calls
          // For now, we'll create mock data
          const mockPool: PoolData = {
            address: poolAddress,
            info: {
              name: "Sample Pool",
              description: "Looking for email data from food delivery users",
              dataType: "email",
              pricePerData: 1000000000000000000n, // 1 ETH
              totalBudget: 10000000000000000000n, // 10 ETH
              remainingBudget: 8000000000000000000n, // 8 ETH
              creator: "0x...",
              isActive: true,
              createdAt: BigInt(Date.now() / 1000),
              deadline: BigInt(Date.now() / 1000 + 30 * 24 * 60 * 60),
            },
            verifiedSellersCount: 5,
            totalSellers: 8,
          };
          poolData.push(mockPool);
        } catch (error) {
          console.error(`Error loading pool ${poolAddress}:`, error);
        }
      }

      setPools(poolData);
      setLoading(false);
    };

    loadPools();
  }, [allPools]);

  const filteredPools = pools.filter(pool => {
    if (filter === "all") return true;
    return pool.info.dataType === filter;
  });

  const formatEther = (wei: bigint) => {
    return Number(wei) / 1e18;
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const isPoolExpired = (deadline: bigint) => {
    return Date.now() / 1000 > Number(deadline);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-3xl">🔍</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Available Data Pools
        </h2>
        <p className="text-gray-600">
          Discover and join data pools to start earning
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <Button
          onClick={() => setFilter("all")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            filter === "all"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          All Pools
        </Button>
        <Button
          onClick={() => setFilter("email")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            filter === "email"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          📧 Email
        </Button>
        <Button
          onClick={() => setFilter("phone")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            filter === "phone"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          📱 Phone
        </Button>
      </div>

      {filteredPools.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 text-lg">
            No pools found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredPools.map((pool, index) => (
            <div
              key={pool.address}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:scale-105"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                      <span className="text-lg">📊</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {pool.info.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {pool.info.dataType} • Created {formatDate(pool.info.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {pool.info.description}
                  </p>
                </div>
                
                <div className="text-right ml-6">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatEther(pool.info.pricePerData)} ETH
                  </div>
                  <div className="text-gray-600 text-sm">
                    per data point
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm text-gray-600 mb-1">Total Budget</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatEther(pool.info.totalBudget)} ETH
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm text-gray-600 mb-1">Remaining</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatEther(pool.info.remainingBudget)} ETH
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm text-gray-600 mb-1">Sellers</div>
                  <div className="text-xl font-bold text-gray-900">
                    {pool.verifiedSellersCount} / {pool.totalSellers}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    pool.info.isActive && !isPoolExpired(pool.info.deadline)
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}>
                    {pool.info.isActive && !isPoolExpired(pool.info.deadline) ? "🟢 Active" : "🔴 Inactive"}
                  </span>
                  
                  {isPoolExpired(pool.info.deadline) && (
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                      ⏰ Expired
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      // Navigate to pool details or join pool
                      console.log("Join pool:", pool.address);
                    }}
                    disabled={!pool.info.isActive || isPoolExpired(pool.info.deadline)}
                    className="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {pool.verifiedSellersCount > 0 ? "💰 Buy Data" : "🚀 Join Pool"}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      // Show pool details
                      console.log("View details:", pool.address);
                    }}
                    className="bg-gray-50 text-gray-700 font-semibold px-6 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all duration-300"
                  >
                    👁️ Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
