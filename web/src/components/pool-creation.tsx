"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCreatePool } from "@/lib/hooks/usePoolActions";
import { useUser } from "@/lib/hooks/useUser";
import ProofSelection, { ProofRequirement } from "./proof-selection";

export function PoolCreation() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dataType: "email",
    pricePerData: "",
    totalBudget: "",
    deadline: "",
  });
  const [selectedProofs, setSelectedProofs] = useState<ProofRequirement[]>([]);

  const { userContract } = useUser();
  const { createPool, isLoading: isCreatingPool, isSuccess: poolCreated, error: createError } = useCreatePool();

  // Helper function to convert proof type string to number
  const getProofTypeNumber = (proofType: string): number => {
    switch (proofType) {
      case 'SELF_AGE_VERIFICATION': return 0;
      case 'SELF_NATIONALITY': return 1;
      case 'EMAIL_VERIFICATION': return 2;
      case 'HACKERHOUSE_INVITATION': return 3;
      case 'CUSTOM': return 4;
      default: return 4;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.pricePerData || !formData.totalBudget || !userContract) {
      alert("Please fill in all required fields");
      return;
    }

    if (selectedProofs.length === 0) {
      alert("Please select at least one proof requirement");
      return;
    }

    const deadline = Math.floor(Date.now() / 1000) + (parseInt(formData.deadline) * 24 * 60 * 60); // Convert days to seconds

    try {
      // Convert proof requirements to the format expected by the contract
      const proofRequirements = selectedProofs.map(proof => ({
        name: proof.name,
        description: proof.description,
        proofType: getProofTypeNumber(proof.proofType),
        isRequired: proof.isRequired
      }));

      await createPool(
        userContract,
        formData.name,
        formData.description,
        formData.dataType,
        proofRequirements,
        BigInt(parseFloat(formData.pricePerData) * 1e18), // Convert to wei
        BigInt(parseFloat(formData.totalBudget) * 1e18), // Convert to wei
        BigInt(deadline)
      );
    } catch (error) {
      console.error("Error creating pool:", error);
      alert(`Failed to create pool: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Your data pool is now live and accepting sellers.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-green-800">
            <strong>Transaction Status:</strong> Confirmed
          </p>
          <p className="text-sm text-green-700 mt-1">
            Your pool is now active on Base Sepolia testnet.
          </p>
        </div>
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

        {/* Error Display */}
        {createError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 text-xl mr-3">⚠️</div>
              <div>
                <h4 className="text-red-800 font-semibold">Transaction Failed</h4>
                <p className="text-red-700 text-sm mt-1">
                  {createError.message || 'Unknown error occurred'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Proof Requirements Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Proof Requirements</h3>
          <ProofSelection 
            selectedProofs={selectedProofs}
            onProofsChange={setSelectedProofs}
          />
        </div>

        <Button
          type="submit"
          disabled={isCreatingPool}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {isCreatingPool ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
              <span>Creating Pool...</span>
              <span className="text-xs text-white/80">Confirm transaction in your wallet</span>
            </div>
          ) : (
            "Create Pool"
          )}
        </Button>
      </form>
    </div>
  );
}
