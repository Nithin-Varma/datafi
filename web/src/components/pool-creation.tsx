"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCreatePool } from "@/lib/hooks/usePoolActions";
import { useUser } from "@/lib/hooks/useUser";

export function PoolCreation() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dataType: "email",
    pricePerData: "",
    totalBudget: "",
    deadline: "",
  });

  const { userContract } = useUser();
  const { createPool, isLoading: isCreatingPool, isSuccess: poolCreated } = useCreatePool();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.pricePerData || !formData.totalBudget || !userContract) {
      alert("Please fill in all required fields");
      return;
    }

    const deadline = Math.floor(Date.now() / 1000) + (parseInt(formData.deadline) * 24 * 60 * 60); // Convert days to seconds

    try {
      await createPool(
        userContract,
        formData.name,
        formData.description,
        formData.dataType,
        BigInt(parseFloat(formData.pricePerData) * 1e18), // Convert to wei
        BigInt(parseFloat(formData.totalBudget) * 1e18), // Convert to wei
        BigInt(deadline)
      );
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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-3xl">🏊</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Create Data Pool
        </h2>
        <p className="text-gray-600">
          Set up your data marketplace and start collecting valuable insights
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Pool Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="e.g., Zomato Users Email Data"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dataType" className="block text-sm font-medium text-gray-700">
              Data Type *
            </label>
            <select
              id="dataType"
              name="dataType"
              value={formData.dataType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              required
            >
              <option value="email">Email Address</option>
              <option value="phone">Phone Number</option>
              <option value="address">Physical Address</option>
              <option value="preferences">User Preferences</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            placeholder="Describe what data you're looking for and how it will be used..."
            required
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="pricePerData" className="block text-sm font-medium text-gray-700">
              Price per Data (ETH) *
            </label>
            <input
              type="number"
              id="pricePerData"
              name="pricePerData"
              value={formData.pricePerData}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="totalBudget" className="block text-sm font-medium text-gray-700">
              Total Budget (ETH) *
            </label>
            <input
              type="number"
              id="totalBudget"
              name="totalBudget"
              value={formData.totalBudget}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="1.0"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
              Duration (Days) *
            </label>
            <input
              type="number"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              min="1"
              max="365"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="30"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isCreatingPool}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {isCreatingPool ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
              <span>Creating Pool...</span>
            </div>
          ) : (
            "Create Pool"
          )}
        </Button>
      </form>
    </div>
  );
}
