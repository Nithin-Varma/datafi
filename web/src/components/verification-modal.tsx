"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/hooks/useUser";
import { useSubmitSelfProof } from "@/lib/hooks/usePoolActions";
import { useZkEmailVerification } from "@/lib/hooks/useZkEmailVerification";
import { usePoolDetails } from "@/lib/hooks/usePools";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, AlertCircle, Upload } from "lucide-react";

interface ProofRequirement {
  name: string;
  description: string;
  proofType: number;
  isRequired: boolean;
}

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  poolAddress: string;
  proofRequirements: ProofRequirement[];
}

export default function VerificationModal({
  isOpen,
  onClose,
  poolAddress,
  proofRequirements,
}: VerificationModalProps) {
  const { userContract } = useUser();
  const { submitSelfProof, isLoading: isSubmitting } = useSubmitSelfProof();
  const { verifyAndStore, isLoading: isZkEmailLoading, error: zkEmailError } = useZkEmailVerification();
  const { poolInfo } = usePoolDetails(poolAddress);
  const [currentStep, setCurrentStep] = useState(0);
  const [verificationResults, setVerificationResults] = useState<Record<string, boolean>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [encryptedDataCid, setEncryptedDataCid] = useState<string>("");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setVerificationResults({});
      setIsVerifying(false);
      setSelectedFile(null);
      setEncryptedDataCid("");
    }
  }, [isOpen]);

  const currentRequirement = proofRequirements[currentStep];
  const isLastStep = currentStep === proofRequirements.length - 1;
  const allVerified = Object.values(verificationResults).every(result => result === true);

  const handleSelfVerification = async () => {
    if (!currentRequirement) return;

    setIsVerifying(true);

    try {
      // Simulate Self Protocol verification
      // In real implementation, this would redirect to Self Protocol
      const isSuccess = await simulateSelfVerification();

      if (isSuccess) {
        setVerificationResults(prev => ({
          ...prev,
          [currentRequirement.name]: true
        }));

        // Submit proof to contract
        const proofHash = generateRandomProofHash();
        await submitSelfProof(userContract!, poolAddress, currentRequirement.name, proofHash);

        if (isLastStep) {
          // All verifications complete
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          setCurrentStep(prev => prev + 1);
        }
      } else {
        setVerificationResults(prev => ({
          ...prev,
          [currentRequirement.name]: false
        }));
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setVerificationResults(prev => ({
        ...prev,
        [currentRequirement.name]: false
      }));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleZkEmailVerification = async () => {
    if (!currentRequirement || !selectedFile) return;

    setIsVerifying(true);

    try {
      // Get pool creator address (buyer) from pool info
      const buyerAddress = poolInfo?.creator;
      if (!buyerAddress) {
        throw new Error("Could not determine pool creator address");
      }

      const result = await verifyAndStore(selectedFile, buyerAddress, poolAddress);

      if (result && result.isValid) {
        setVerificationResults(prev => ({
          ...prev,
          [currentRequirement.name]: true
        }));

        setEncryptedDataCid(result.encryptedCid);

        // Submit proof to contract
        await submitSelfProof(userContract!, poolAddress, currentRequirement.name, result.proofHash);

        if (isLastStep) {
          // All verifications complete - trigger payment
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          setCurrentStep(prev => prev + 1);
        }
      } else {
        setVerificationResults(prev => ({
          ...prev,
          [currentRequirement.name]: false
        }));
      }
    } catch (error) {
      console.error("ZK-Email verification failed:", error);
      setVerificationResults(prev => ({
        ...prev,
        [currentRequirement.name]: false
      }));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.eml')) {
      setSelectedFile(file);
    } else {
      alert('Please select a valid .eml file');
    }
  };

  const simulateSelfVerification = async (): Promise<boolean> => {
    // Simulate Self Protocol verification process
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo purposes, always return true
        // In real implementation, this would handle Self Protocol response
        resolve(true);
      }, 2000);
    });
  };

  const generateRandomProofHash = (): string => {
    // Generate a random bytes32 hash for demo
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    return '0x' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const getProofTypeLabel = (proofType: number): string => {
    switch (proofType) {
      case 0: return "Age Verification";
      case 1: return "Nationality Verification";
      case 2: return "Email Verification";
      case 3: return "Custom Proof";
      default: return "Unknown Proof";
    }
  };

  const getProofTypeIcon = (proofType: number): string => {
    switch (proofType) {
      case 0: return "🎂";
      case 1: return "🌍";
      case 2: return "📧";
      case 3: return "📄";
      default: return "❓";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Verify Your Identity</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep + 1} of {proofRequirements.length}</span>
            <span>{Math.round(((currentStep + 1) / proofRequirements.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / proofRequirements.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Verification Step */}
        {currentRequirement && (
          <div className="mb-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">
                {getProofTypeIcon(currentRequirement.proofType)}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {getProofTypeLabel(currentRequirement.proofType)}
              </h3>
              <p className="text-gray-600">
                {currentRequirement.description}
              </p>
            </div>

            {/* Self Protocol Integration */}
            {(currentRequirement.proofType === 0 || currentRequirement.proofType === 1) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">🔐</div>
                  <h4 className="font-semibold text-blue-900 mb-2">Self Protocol Verification</h4>
                  <p className="text-blue-700 text-sm mb-4">
                    Scan the QR code with your mobile device to verify your identity
                  </p>
                  
                  {/* QR Code Placeholder */}
                  <div className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-8 mb-4">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📱</div>
                      <p className="text-sm text-gray-600">QR Code would appear here</p>
                      <p className="text-xs text-gray-500 mt-1">Self Protocol integration</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleSelfVerification}
                    disabled={isVerifying || isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isVerifying ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Verify with Self Protocol"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* ZK-Email Verification */}
            {currentRequirement.proofType === 2 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">📧</div>
                  <h4 className="font-semibold text-green-900 mb-2">ZK-Email Verification</h4>
                  <p className="text-green-700 text-sm mb-4">
                    Upload your ZK-Verify hackerhouse acceptance email (.eml)
                  </p>

                  {/* File Upload */}
                  <div className="mb-4">
                    <label className="block w-full">
                      <div className={`border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer ${
                        selectedFile
                          ? "border-green-400 bg-green-50"
                          : "border-green-300 hover:border-green-400"
                      }`}>
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-green-600" />
                          <p className="text-sm text-green-700">
                            {selectedFile ? selectedFile.name : "Click to upload .eml file"}
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept=".eml"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* ZK-Email Error Display */}
                  {zkEmailError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-red-700 text-sm">{zkEmailError}</p>
                    </div>
                  )}

                  {/* Verification Info */}
                  <div className="bg-white border border-green-200 rounded-lg p-3 mb-4 text-left">
                    <h5 className="font-medium text-green-900 mb-2">✅ ZK-Email Verification Process:</h5>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• Validates ZK-Verify hackerhouse acceptance</li>
                      <li>• Extracts your email securely</li>
                      <li>• Encrypts and stores in Lighthouse</li>
                      <li>• Grants buyer access to encrypted data</li>
                      <li>• Triggers automatic payment on success</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleZkEmailVerification}
                    disabled={!selectedFile || isVerifying || isSubmitting || isZkEmailLoading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isVerifying || isZkEmailLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                        <span>Verifying & Storing...</span>
                      </div>
                    ) : (
                      "Verify & Store Email"
                    )}
                  </Button>

                  {/* Success Message */}
                  {encryptedDataCid && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-700 text-sm">
                        ✅ Email encrypted and stored successfully!
                      </p>
                      <p className="text-blue-600 text-xs mt-1">
                        CID: {encryptedDataCid.substring(0, 20)}...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentRequirement.proofType === 3 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">📄</div>
                  <h4 className="font-semibold text-purple-900 mb-2">Custom Proof</h4>
                  <p className="text-purple-700 text-sm mb-4">
                    Provide your custom verification
                  </p>
                  <textarea
                    placeholder="Enter your proof details..."
                    className="w-full p-3 border border-purple-300 rounded-lg mb-4 h-20"
                  />
                  <Button
                    onClick={handleSelfVerification}
                    disabled={isVerifying || isSubmitting}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isVerifying ? "Verifying..." : "Submit Proof"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Verification Results */}
        {Object.keys(verificationResults).length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Verification Status</h4>
            <div className="space-y-2">
              {Object.entries(verificationResults).map(([proofName, isSuccess]) => (
                <div key={proofName} className="flex items-center space-x-2">
                  {isSuccess ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`text-sm ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
                    {proofName}: {isSuccess ? 'Verified' : 'Failed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {allVerified && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="text-center">
              <div className="text-3xl mb-2">🎉</div>
              <h4 className="font-semibold text-green-900 mb-2">All Verifications Complete!</h4>
              <p className="text-green-700 text-sm">
                You have successfully verified all required proofs. You are now a verified seller in this pool.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            {allVerified ? "Close" : "Cancel"}
          </Button>
          
          {!allVerified && (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!verificationResults[currentRequirement?.name]}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLastStep ? "Complete" : "Next"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}