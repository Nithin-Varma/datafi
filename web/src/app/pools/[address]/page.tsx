"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import VerificationModal from "@/components/verification-modal";
import { useUser } from "@/lib/hooks/useUser";
import { usePoolActions } from "@/lib/hooks/usePoolActions";

interface PoolInfo {
  name: string;
  description: string;
  dataType: string;
  pricePerData: string;
  totalBudget: string;
  remainingBudget: string;
  creator: string;
  isActive: boolean;
  deadline: string;
}

interface ProofRequirement {
  name: string;
  description: string;
  proofType: string;
  isRequired: boolean;
}

export default function PoolDetailPage() {
  const params = useParams();
  const poolAddress = params.address as string;
  
  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);
  const [proofRequirements, setProofRequirements] = useState<ProofRequirement[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const { userContract, address } = useUser();
  const { joinPool, submitProof, submitSelfProof } = usePoolActions();

  useEffect(() => {
    if (poolAddress) {
      loadPoolInfo();
    }
  }, [poolAddress]);

  const loadPoolInfo = async () => {
    try {
      // TODO: Implement contract calls to get pool info
      // This would involve calling the Pool contract methods
      setLoading(false);
    } catch (error) {
      console.error("Error loading pool info:", error);
      setLoading(false);
    }
  };

  const handleJoinPool = async () => {
    if (!userContract) return;
    
    try {
      await joinPool(userContract, poolAddress);
      setIsJoined(true);
    } catch (error) {
      console.error("Error joining pool:", error);
    }
  };

  const handleVerify = () => {
    setShowVerificationModal(true);
  };

  const handleProofSubmission = async (proofName: string, proofHash: string, isSelfProof: boolean) => {
    if (!userContract) return;
    
    try {
      if (isSelfProof) {
        await submitSelfProof(userContract, poolAddress, proofName, proofHash);
      } else {
        await submitProof(userContract, poolAddress, proofName, proofHash);
      }
    } catch (error) {
      console.error("Error submitting proof:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!poolInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pool Not Found</h1>
          <p className="text-gray-600">The requested pool could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Pool Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{poolInfo.name}</h1>
              <p className="text-gray-600 text-lg">{poolInfo.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{poolInfo.pricePerData} ETH</div>
              <div className="text-sm text-gray-500">per data point</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Data Type</div>
              <div className="font-semibold text-gray-900 capitalize">{poolInfo.dataType}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Total Budget</div>
              <div className="font-semibold text-gray-900">{poolInfo.totalBudget} ETH</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Deadline</div>
              <div className="font-semibold text-gray-900">
                {new Date(parseInt(poolInfo.deadline) * 1000).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Proof Requirements */}
          {proofRequirements.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Proofs</h3>
              <div className="flex flex-wrap gap-2">
                {proofRequirements.map((proof, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    <span>
                      {proof.proofType === 'SELF_AGE_VERIFICATION' || proof.proofType === 'SELF_NATIONALITY' 
                        ? '🔐' 
                        : proof.proofType === 'EMAIL_VERIFICATION'
                        ? '📧'
                        : '📄'
                      }
                    </span>
                    <span>{proof.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!isJoined ? (
              <Button
                onClick={handleJoinPool}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Join Pool
              </Button>
            ) : !isVerified ? (
              <Button
                onClick={handleVerify}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Verify Proofs
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-2xl">✓</span>
                <span className="font-semibold">Fully Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Pool Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
            <div className="text-sm text-gray-500">Verified Sellers</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
            <div className="text-sm text-gray-500">Data Points Collected</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-gray-900 mb-1">{poolInfo.remainingBudget} ETH</div>
            <div className="text-sm text-gray-500">Remaining Budget</div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          proofRequirements={proofRequirements}
          onProofSubmission={handleProofSubmission}
        />
      )}
    </div>
  );
}
