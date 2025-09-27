"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { usePoolDetails } from "@/lib/hooks/usePools";
import { useSubmitProof, useSubmitSelfProof } from "@/lib/hooks/usePoolActions";
import { useUser } from "@/lib/hooks/useUser";

interface ProofRequirement {
  name: string;
  description: string;
  proofType: string;
  isRequired: boolean;
}

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  poolAddress?: string;
  proofRequirements?: ProofRequirement[];
  onProofSubmission?: (proofName: string, proofHash: string, isSelfProof: boolean) => void;
}

export default function VerificationModal({ 
  isOpen, 
  onClose, 
  poolAddress,
  proofRequirements = [], 
  onProofSubmission 
}: VerificationModalProps) {
  const [currentProofIndex, setCurrentProofIndex] = useState(0);
  const [submittedProofs, setSubmittedProofs] = useState<Set<string>>(new Set());
  const [emailFile, setEmailFile] = useState<File | null>(null);
  const [customProof, setCustomProof] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [poolProofRequirements, setPoolProofRequirements] = useState<ProofRequirement[]>([]);

  // Load pool details if poolAddress is provided
  const { poolInfo } = usePoolDetails(poolAddress || "");
  const { userContract } = useUser();
  const { submitProof } = useSubmitProof();
  const { submitSelfProof } = useSubmitSelfProof();

  // Load proof requirements from pool contract
  useEffect(() => {
    if (poolAddress && poolInfo) {
      // TODO: Load proof requirements from contract
      // For now, use default requirements
      setPoolProofRequirements([
        {
          name: "age_verification",
          description: "Must be over 18 years old",
          proofType: "SELF_AGE_VERIFICATION",
          isRequired: true
        },
        {
          name: "indian_citizen",
          description: "Must be Indian citizen",
          proofType: "SELF_NATIONALITY",
          isRequired: true
        }
      ]);
    }
  }, [poolAddress, poolInfo]);

  // Use provided proof requirements or loaded ones
  const requirements = proofRequirements.length > 0 ? proofRequirements : poolProofRequirements;

  if (!isOpen) return null;

  const currentProof = requirements[currentProofIndex];
  const isLastProof = currentProofIndex === requirements.length - 1;
  const allProofsSubmitted = submittedProofs.size === requirements.length;

  const handleSelfVerification = async () => {
    // This would integrate with your Self verification system
    // For now, we'll simulate the process
    setIsSubmitting(true);
    
    try {
      // TODO: Integrate with Self Protocol
      // This would trigger the Self verification flow
      console.log("Starting Self verification for:", currentProof.name);
      
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock proof hash (in real implementation, this would come from Self)
      const proofHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      if (onProofSubmission) {
        await onProofSubmission(currentProof.name, proofHash, true);
      } else if (userContract && poolAddress) {
        await submitSelfProof(userContract, poolAddress, currentProof.name, proofHash);
      }
      setSubmittedProofs((prev: Set<string>) => new Set([...prev, currentProof.name]));
      
      if (!isLastProof) {
        setCurrentProofIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error("Self verification failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailUpload = async () => {
    if (!emailFile) return;
    
    setIsSubmitting(true);
    
    try {
      // TODO: Implement ZK proof generation from .eml file
      // This would process the email file and generate a ZK proof
      console.log("Processing email file:", emailFile.name);
      
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock proof hash (in real implementation, this would be the ZK proof)
      const proofHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      if (onProofSubmission) {
        await onProofSubmission(currentProof.name, proofHash, false);
      } else if (userContract && poolAddress) {
        await submitProof(userContract, poolAddress, currentProof.name, proofHash);
      }
      setSubmittedProofs((prev: Set<string>) => new Set([...prev, currentProof.name]));
      
      if (!isLastProof) {
        setCurrentProofIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error("Email verification failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomProof = async () => {
    if (!customProof.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Generate a mock proof hash for custom proof
      const proofHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      if (onProofSubmission) {
        await onProofSubmission(currentProof.name, proofHash, false);
      } else if (userContract && poolAddress) {
        await submitProof(userContract, poolAddress, currentProof.name, proofHash);
      }
      setSubmittedProofs((prev: Set<string>) => new Set([...prev, currentProof.name]));
      
      if (!isLastProof) {
        setCurrentProofIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error("Custom proof submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.eml')) {
      setEmailFile(file);
    } else {
      alert("Please select a valid .eml file");
    }
  };

  const getProofIcon = (proofType: string) => {
    switch (proofType) {
      case 'SELF_AGE_VERIFICATION':
      case 'SELF_NATIONALITY':
        return '🔐';
      case 'EMAIL_VERIFICATION':
        return '📧';
      case 'HACKERHOUSE_INVITATION':
        return '🏠';
      default:
        return '📄';
    }
  };

  const renderProofStep = () => {
    const isSubmitted = submittedProofs.has(currentProof.name);
    
    if (isSubmitted) {
      return (
        <div className="text-center py-8">
          <div className="text-6xl text-green-600 mb-4">✓</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Proof Submitted!</h3>
          <p className="text-gray-600 mb-6">{currentProof.description} has been verified.</p>
          <Button
            onClick={() => {
              if (!isLastProof) {
                setCurrentProofIndex(prev => prev + 1);
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
          >
            {isLastProof ? "Complete Verification" : "Next Proof"}
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-4">{getProofIcon(currentProof.proofType)}</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{currentProof.description}</h3>
          <p className="text-gray-600">
            Step {currentProofIndex + 1} of {proofRequirements.length}
          </p>
        </div>

        {/* Self Verification */}
        {(currentProof.proofType === 'SELF_AGE_VERIFICATION' || currentProof.proofType === 'SELF_NATIONALITY') && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Self Protocol Verification</h4>
              <p className="text-blue-800 text-sm">
                This will open the Self verification process in a new window. 
                You'll need to complete the verification and return here.
              </p>
            </div>
            <Button
              onClick={handleSelfVerification}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
            >
              {isSubmitting ? "Verifying..." : "Start Self Verification"}
            </Button>
          </div>
        )}

        {/* Email Verification */}
        {currentProof.proofType === 'EMAIL_VERIFICATION' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Email Verification</h4>
              <p className="text-green-800 text-sm">
                Upload your Netflix subscription email (.eml file) for ZK proof generation.
              </p>
            </div>
            <div className="space-y-3">
              <input
                type="file"
                accept=".eml"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              {emailFile && (
                <div className="text-sm text-gray-600">
                  Selected: {emailFile.name}
                </div>
              )}
              <Button
                onClick={handleEmailUpload}
                disabled={!emailFile || isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
              >
                {isSubmitting ? "Processing..." : "Upload & Verify"}
              </Button>
            </div>
          </div>
        )}

        {/* Custom Proof */}
        {currentProof.proofType === 'HACKERHOUSE_INVITATION' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">HackerHouse Invitation</h4>
              <p className="text-purple-800 text-sm">
                Provide proof of your HackerHouse invitation.
              </p>
            </div>
            <div className="space-y-3">
              <textarea
                value={customProof}
                onChange={(e) => setCustomProof(e.target.value)}
                placeholder="Describe your HackerHouse invitation or provide proof..."
                className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none"
              />
              <Button
                onClick={handleCustomProof}
                disabled={!customProof.trim() || isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold"
              >
                {isSubmitting ? "Submitting..." : "Submit Proof"}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Verify Your Identity</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{submittedProofs.size} / {requirements.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(submittedProofs.size / requirements.length) * 100}%` }}
              />
            </div>
          </div>

          {renderProofStep()}

          {allProofsSubmitted && (
            <div className="text-center py-8">
              <div className="text-6xl text-green-600 mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Verification Complete!</h3>
              <p className="text-gray-600 mb-6">
                You have successfully verified all required proofs. You are now eligible to participate in this pool.
              </p>
              <Button
                onClick={onClose}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}