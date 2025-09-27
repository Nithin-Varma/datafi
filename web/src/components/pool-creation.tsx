"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESSES, POOL_FACTORY_ABI } from "@/lib/config";

export function PoolCreation() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dataType: "email",
    pricePerData: "",
    totalBudget: "",
    deadline: "",
  });

  const createPool = useWriteContract();
  const { isLoading: isCreatingPool, isSuccess: poolCreated } = useWaitForTransactionReceipt({
    hash: createPool.data?.hash,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.pricePerData || !formData.totalBudget) {
      alert("Please fill in all required fields");
      return;
    }

    const deadline = Math.floor(Date.now() / 1000) + (parseInt(formData.deadline) * 24 * 60 * 60); // Convert days to seconds

    try {
      await createPool.writeContract({
        address: CONTRACT_ADDRESSES.POOL_FACTORY as `0x${string}`,
        abi: POOL_FACTORY_ABI,
        functionName: "createPool",
        args: [
          formData.name,
          formData.description,
          formData.dataType,
          BigInt(parseFloat(formData.pricePerData) * 1e18), // Convert to wei
          BigInt(parseFloat(formData.totalBudget) * 1e18), // Convert to wei
          BigInt(deadline)
        ],
        value: 0n, // No fee
      });
    } catch (error) {
      console.error("Error creating pool:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  if (poolCreated) {
    return (
      <div className="text-center py-8">
        <div className="text-green-600 text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Pool Created Successfully!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Your data pool is now live and accepting sellers.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Create Data Pool
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pool Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Zomato Users Email Data"
              required
            />
          </div>

          <div>
            <label htmlFor="dataType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Type *
            </label>
            <select
              id="dataType"
              name="dataType"
              value={formData.dataType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="email">Email Address</option>
              <option value="phone">Phone Number</option>
              <option value="address">Physical Address</option>
              <option value="preferences">User Preferences</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Describe what data you're looking for and how it will be used..."
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pricePerData" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price per Data (ETH) *
            </label>
            <input
              type="number"
              id="pricePerData"
              name="pricePerData"
              value={formData.pricePerData}
              onChange={handleChange}
              step="0.001"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="0.01"
              required
            />
          </div>

          <div>
            <label htmlFor="totalBudget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Budget (ETH) *
            </label>
            <input
              type="number"
              id="totalBudget"
              name="totalBudget"
              value={formData.totalBudget}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="1.0"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pool Duration (Days)
          </label>
          <input
            type="number"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            min="1"
            max="365"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="30"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isCreatingPool}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md disabled:opacity-50"
        >
          {isCreatingPool ? "Creating Pool..." : "Create Pool"}
        </Button>
      </form>
    </div>
  );
}
