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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Available Data Pools
        </h2>
        
        <div className="flex space-x-2">
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
          >
            All
          </Button>
          <Button
            onClick={() => setFilter("email")}
            variant={filter === "email" ? "default" : "outline"}
            size="sm"
          >
            Email
          </Button>
          <Button
            onClick={() => setFilter("phone")}
            variant={filter === "phone" ? "default" : "outline"}
            size="sm"
          >
            Phone
          </Button>
        </div>
      </div>

      {filteredPools.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No pools found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredPools.map((pool, index) => (
            <div
              key={pool.address}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {pool.info.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {pool.info.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Data Type: {pool.info.dataType}</span>
                    <span>•</span>
                    <span>Created: {formatDate(pool.info.createdAt)}</span>
                    <span>•</span>
                    <span>Deadline: {formatDate(pool.info.deadline)}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatEther(pool.info.pricePerData)} ETH
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    per data point
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Budget</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formatEther(pool.info.totalBudget)} ETH
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Remaining Budget</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formatEther(pool.info.remainingBudget)} ETH
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Verified Sellers</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {pool.verifiedSellersCount} / {pool.totalSellers}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    pool.info.isActive && !isPoolExpired(pool.info.deadline)
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}>
                    {pool.info.isActive && !isPoolExpired(pool.info.deadline) ? "Active" : "Inactive"}
                  </span>
                  
                  {isPoolExpired(pool.info.deadline) && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Expired
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Navigate to pool details or join pool
                      console.log("Join pool:", pool.address);
                    }}
                    disabled={!pool.info.isActive || isPoolExpired(pool.info.deadline)}
                  >
                    {pool.verifiedSellersCount > 0 ? "Buy Data" : "Join Pool"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Show pool details
                      console.log("View details:", pool.address);
                    }}
                  >
                    View Details
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
