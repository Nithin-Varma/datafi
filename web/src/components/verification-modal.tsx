"use client";

import { useState } from "react";
import { usePoolDetails } from "@/lib/hooks/usePools";
import { useUser } from "@/lib/hooks/useUser";
import { useSubmitVerification } from "@/lib/hooks/useVerification";
import { Button } from "@/components/ui/button";

interface VerificationModalProps {
  poolAddress: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VerificationModal({ poolAddress, isOpen, onClose }: VerificationModalProps) {
  const { poolInfo, sellers, isLoading } = usePoolDetails(poolAddress);
  const { userContract } = useUser();
  const { submitVerification, isLoading: isSubmitting, isSuccess: submissionSuccess } = useSubmitVerification();
  const [verificationData, setVerificationData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    country: "",
    additionalInfo: ""
  });

  if (!isOpen) return null;

  // Check if user is a seller in this pool
  const isSeller = sellers?.includes(userContract || "");

  const formatEther = (wei: bigint) => {
    return Number(wei) / 1e18;
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const isPoolExpired = (deadline: bigint) => {
    return Date.now() / 1000 > Number(deadline);
  };

  const handleVerification = async () => {
    if (!userContract || !poolAddress) return;
    
    try {
      // Encrypt the verification data (simplified for now)
      const encryptedData = JSON.stringify(verificationData);
      
      await submitVerification(poolAddress, encryptedData);
      alert("Verification submitted! Your data will be reviewed by the pool creator.");
      onClose();
    } catch (error) {
      console.error("Verification failed:", error);
      alert("Verification failed. Please try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVerificationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is authorized to verify
  if (!isSeller) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You need to join this pool as a seller before you can verify your data.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-transform duration-200 scale-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Verify Your Data for {poolInfo?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Pool Info */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Pool Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Data Type:</strong> {poolInfo?.dataType}</p>
              <p><strong>Price per Data:</strong> {formatEther(poolInfo?.pricePerData || 0n)} ETH</p>
            </div>
            <div>
              <p><strong>Deadline:</strong> {formatDate(poolInfo?.deadline || 0n)}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  poolInfo?.isActive && !isPoolExpired(poolInfo?.deadline || 0n)
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {poolInfo?.isActive && !isPoolExpired(poolInfo?.deadline || 0n) ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Verification Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Provide Your Information</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={verificationData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={verificationData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={verificationData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={verificationData.age}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your age"
                min="18"
                max="100"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                name="country"
                value={verificationData.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select your country</option>
                <option value="US">United States</option>
                <option value="IN">India</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="JP">Japan</option>
                <option value="CN">China</option>
                <option value="BR">Brazil</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
              <textarea
                name="additionalInfo"
                value={verificationData.additionalInfo}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional information you'd like to provide..."
              />
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-yellow-50 p-4 rounded-lg mt-6">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 text-lg">⚠️</span>
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Privacy Notice:</p>
              <p>Your data will be encrypted and stored securely. Only the pool creator can verify your information. You will be paid {formatEther(poolInfo?.pricePerData || 0n)} ETH per data point once verified.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-8">
          <Button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerification}
            disabled={isSubmitting || !verificationData.name || !verificationData.email}
            className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              "Submit Verification"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
