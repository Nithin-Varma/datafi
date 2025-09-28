"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/hooks/useUser";
import { usePoolDetails } from "@/lib/hooks/usePools";
import { useSubmitProof, useSubmitSelfProof } from "@/lib/hooks/usePoolActions";
import Link from "next/link";

export default function PoolVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const poolAddress = params.address as string;
  
  const { userContract } = useUser();
  const { poolInfo, sellers, isLoading, error } = usePoolDetails(poolAddress);
  const { submitProof, isLoading: isSubmittingProof } = useSubmitProof();
  const { submitSelfProof, isLoading: isSubmittingSelfProof } = useSubmitSelfProof();
  
  const [selectedProofs, setSelectedProofs] = useState<Set<string>>(new Set());
  const [proofData, setProofData] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSeller = sellers?.includes(userContract as `0x${string}` || "0x" as `0x${string}`);

  useEffect(() => {
    if (!isSeller && !isLoading) {
      router.push(`/pools/${poolAddress}`);
    }
  }, [isSeller, isLoading, router, poolAddress]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Pool Details</h3>
          <p className="text-gray-600">Fetching verification requirements...</p>
        </div>
      </div>
    );
  }

  if (error || !poolInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pool Not Found</h1>
          <p className="text-gray-600 mb-6">The requested pool could not be found.</p>
          <Link href="/pools" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Pools
          </Link>
        </div>
      </div>
    );
  }

  if (!isSeller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You must be a member of this pool to submit proofs.</p>
          <Link href={`/pools/${poolAddress}`} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Pool
          </Link>
        </div>
      </div>
    );
  }

  const handleProofSelection = (proofName: string) => {
    const newSelected = new Set(selectedProofs);
    if (newSelected.has(proofName)) {
      newSelected.delete(proofName);
    } else {
      newSelected.add(proofName);
    }
    setSelectedProofs(newSelected);
  };

  const handleProofDataChange = (proofName: string, value: string) => {
    setProofData(prev => ({
      ...prev,
      [proofName]: value
    }));
  };

  const handleSelfVerification = async (proofName: string) => {
    if (!userContract) return;
    
    setIsSubmitting(true);
    try {
      // For Self Protocol verification, we would normally redirect to Self
      // For now, we'll simulate the verification process
      const confirmed = window.confirm(
        `This will redirect you to Self Protocol for ${proofName} verification. Continue?`
      );
      
      if (confirmed) {
        // Generate a mock proof hash for Self verification
        const proofHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        await submitSelfProof(userContract, poolAddress, proofName, proofHash);
        alert(`Self verification for ${proofName} submitted successfully!`);
      }
    } catch (error) {
      console.error("Error submitting Self proof:", error);
      alert("Failed to submit Self verification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailUpload = async (proofName: string) => {
    if (!userContract) return;
    
    setIsSubmitting(true);
    try {
      // Check if file is selected
      const fileInput = document.querySelector(`input[type="file"]`) as HTMLInputElement;
      if (!fileInput?.files?.[0]) {
        alert("Please select an .eml file first");
        setIsSubmitting(false);
        return;
      }
      
      // Generate a mock proof hash for email verification
      const proofHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      await submitProof(userContract, poolAddress, proofName, proofHash);
      alert(`Email verification for ${proofName} submitted successfully!`);
    } catch (error) {
      console.error("Error submitting email proof:", error);
      alert("Failed to submit email verification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomProof = async (proofName: string) => {
    if (!userContract) return;
    
    setIsSubmitting(true);
    try {
      // Generate a mock proof hash for custom proof
      const proofHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      await submitProof(userContract, poolAddress, proofName, proofHash);
      alert(`Custom proof for ${proofName} submitted successfully!`);
    } catch (error) {
      console.error("Error submitting custom proof:", error);
      alert("Failed to submit custom proof. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock proof requirements for now
  const proofRequirements = [
    {
      name: "age_verification",
      description: "Must be over 18 years old",
      proofType: "SELF_AGE_VERIFICATION",
      isRequired: true
    },
    {
      name: "nationality",
      description: "Indian citizen verification",
      proofType: "SELF_NATIONALITY", 
      isRequired: true
    },
    {
      name: "email_verification",
      description: "Netflix subscription verification",
      proofType: "EMAIL_VERIFICATION",
      isRequired: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href={`/pools/${poolAddress}`} 
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              ← Back to Pool
            </Link>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              ✅ You joined this pool
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Submit Proofs</h1>
          <p className="text-xl text-gray-600 mb-6">
            Complete the verification requirements for {poolInfo.name}
          </p>
        </div>

        {/* Proof Requirements */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Verification Requirements</h3>
          
          <div className="space-y-6">
            {proofRequirements.map((requirement, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{requirement.name}</h4>
                    <p className="text-gray-600">{requirement.description}</p>
                    {requirement.isRequired && (
                      <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                        Required
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={() => handleProofSelection(requirement.name)}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      selectedProofs.has(requirement.name)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {selectedProofs.has(requirement.name) ? "Selected" : "Select"}
                  </Button>
                </div>

                {selectedProofs.has(requirement.name) && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    {requirement.proofType === "SELF_AGE_VERIFICATION" || requirement.proofType === "SELF_NATIONALITY" ? (
                      <div>
                        <p className="text-sm text-gray-600 mb-3">
                          This requires Self Protocol verification. Click below to verify.
                        </p>
                        <Button
                          onClick={() => handleSelfVerification(requirement.name)}
                          disabled={isSubmitting || isSubmittingSelfProof}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                          {isSubmitting || isSubmittingSelfProof ? "Verifying..." : "Verify with Self"}
                        </Button>
                      </div>
                    ) : requirement.proofType === "EMAIL_VERIFICATION" ? (
                      <div>
                        <p className="text-sm text-gray-600 mb-3">
                          Upload your .eml file for email verification.
                        </p>
                        <input
                          type="file"
                          accept=".eml"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleProofDataChange(requirement.name, file.name);
                            }
                          }}
                          className="mb-3 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <Button
                          onClick={() => handleEmailUpload(requirement.name)}
                          disabled={isSubmitting || isSubmittingProof}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                          {isSubmitting || isSubmittingProof ? "Uploading..." : "Upload & Verify"}
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600 mb-3">
                          Provide your custom proof data.
                        </p>
                        <textarea
                          placeholder="Enter your proof data here..."
                          value={proofData[requirement.name] || ""}
                          onChange={(e) => handleProofDataChange(requirement.name, e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg mb-3"
                          rows={3}
                        />
                        <Button
                          onClick={() => handleCustomProof(requirement.name)}
                          disabled={isSubmitting || isSubmittingProof}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                          {isSubmitting || isSubmittingProof ? "Submitting..." : "Submit Proof"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submit All Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedProofs.size} of {proofRequirements.length} proofs selected
              </div>
              <Button
                disabled={selectedProofs.size === 0 || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit All Selected Proofs"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
