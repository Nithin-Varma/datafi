"use client";

import { usePoolDetails } from "@/lib/hooks/usePools";
import { Button } from "@/components/ui/button";

interface PoolCardProps {
  poolAddress: string;
  onJoin?: (poolAddress: string) => void;
  onBuy?: (poolAddress: string) => void;
  onViewDetails?: (poolAddress: string) => void;
}

export function PoolCard({ poolAddress, onJoin, onBuy, onViewDetails }: PoolCardProps) {
  const { poolInfo, verifiedSellersCount, totalSellers, isLoading, error } = usePoolDetails(poolAddress);

  // Debug logging
  console.log("PoolCard debug:", { poolAddress, poolInfo, isLoading, error });

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
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            poolInfo.isActive && !isPoolExpired(poolInfo.deadline)
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}>
            {poolInfo.isActive && !isPoolExpired(poolInfo.deadline) ? "🟢 Active" : "🔴 Inactive"}
          </span>
          
          {isPoolExpired(poolInfo.deadline) && (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
              ⏰ Expired
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              if (verifiedSellersCount > 0 && onBuy) {
                onBuy(poolAddress);
              } else if (onJoin) {
                onJoin(poolAddress);
              }
            }}
            disabled={!poolInfo.isActive || isPoolExpired(poolInfo.deadline)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 text-sm"
          >
            {verifiedSellersCount > 0 ? "💰 Buy" : "🚀 join as a seller"}
          </Button>
          
          <Button
            onClick={() => onViewDetails?.(poolAddress)}
            className="bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-300 text-sm"
          >
            👁️
          </Button>
        </div>
      </div>
    </div>
  );
}
