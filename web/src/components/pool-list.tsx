"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAllPools, usePoolsByDataType } from "@/lib/hooks/usePools";
import { PoolCard } from "@/components/pool-card";



export function PoolList() {
  const [filter, setFilter] = useState<string>("all");

  // Get all pools using the hook
  const { allPools, isLoading: allPoolsLoading } = useAllPools();

  
  // Get pools by data type
  const { pools: emailPools, isLoading: emailPoolsLoading } = usePoolsByDataType("email");
  const { pools: phonePools, isLoading: phonePoolsLoading } = usePoolsByDataType("phone");

  const loading = allPoolsLoading;

  // Filter pools based on data type
  const getFilteredPools = () => {
    if (filter === "all") return allPools;
    if (filter === "email") return emailPools;
    if (filter === "phone") return phonePools;
    return allPools;
  };

  const filteredPools = getFilteredPools();


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
              <p className="text-gray-600 text-lg mb-4">
                {allPools.length === 0 
                  ? "No pools have been created yet. Be the first to create a pool!"
                  : "No pools found matching your criteria."
                }
              </p>
              {allPools.length === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-blue-800 text-sm">
                    💡 <strong>Tip:</strong> Switch to the "Create New Pool" tab to create your first data pool!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {filteredPools.map((poolAddress) => (
                <PoolCard
                  key={poolAddress}
                  poolAddress={poolAddress}
                  onJoin={(address) => {
                    console.log("Successfully joined pool:", address);
                  }}
                  onBuy={(address) => {
                    console.log("Buy data from pool:", address);
                  }}
                  onViewDetails={(address) => {
                    console.log("View pool details:", address);
                  }}
                />
              ))}
            </div>
          )}
    </div>
  );
}
