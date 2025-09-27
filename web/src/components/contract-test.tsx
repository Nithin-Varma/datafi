"use client";

import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESSES, POOL_FACTORY_ABI } from "@/lib/config";

export function ContractTest() {
  const { data: totalPools, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.POOL_FACTORY as `0x${string}`,
    abi: POOL_FACTORY_ABI,
    functionName: "getTotalPools",
  });

  const { data: allPools, isLoading: poolsLoading, error: poolsError } = useReadContract({
    address: CONTRACT_ADDRESSES.POOL_FACTORY as `0x${string}`,
    abi: POOL_FACTORY_ABI,
    functionName: "getAllPools",
  });

  console.log("Contract Test:", {
    totalPools,
    allPools,
    isLoading,
    error,
    poolsLoading,
    poolsError,
    contractAddress: CONTRACT_ADDRESSES.POOL_FACTORY
  });

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-yellow-800 mb-2">Contract Test Debug</h3>
      <div className="text-sm text-yellow-700 space-y-1">
        <p><strong>Contract Address:</strong> {CONTRACT_ADDRESSES.POOL_FACTORY}</p>
        <p><strong>Total Pools:</strong> {totalPools?.toString() || "Loading..."}</p>
        <p><strong>All Pools:</strong> {allPools?.length || 0} pools</p>
        <p><strong>Loading:</strong> {isLoading ? "Yes" : "No"}</p>
        <p><strong>Error:</strong> {error ? error.message : "None"}</p>
      </div>
    </div>
  );
}
