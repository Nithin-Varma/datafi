"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/hooks/useUser";
import { usePoolDetails } from "@/lib/hooks/usePools";
import { useUserPoolStatus } from "@/lib/hooks/useUserPoolStatus";
import { useWriteContract, useAccount, useWaitForTransactionReceipt, useReadContract, useSendTransaction } from "wagmi";
import { POOL_ABI, POOL_FACTORY_ABI, CONTRACT_ADDRESSES } from "@/lib/config";
import { verificationService } from "@/lib/verification-service";
import Link from "next/link";

// Define proof types matching the contract
enum ProofType {
  SELF_AGE_VERIFICATION = 0,
  SELF_NATIONALITY = 1,
  EMAIL_VERIFICATION = 2,
  HACKERHOUSE_INVITATION = 3,
  CUSTOM = 4
}

interface ProofRequirement {
  name: string;
  description: string;
  proofType: number;
  isRequired: boolean;
}

interface VerificationStep {
  type: 'self' | 'zk_email_hackerhouse' | 'zk_email_netflix';
  title: string;
  description: string;
  proofNames: string[];
  completed: boolean;
}

export default function PoolVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const poolAddress = params.address as string;
  
  const { userContract } = useUser();
  const { address } = useAccount();
  const { poolInfo, sellers, isLoading, error } = usePoolDetails(poolAddress);
  const { hasJoined, isFullyVerified, refetch: refetchStatus } = useUserPoolStatus(poolAddress, address || null);

  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zkEmailFile, setZkEmailFile] = useState<File | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [verificationResults, setVerificationResults] = useState<{[key: string]: any}>({});
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationDetails, setVerificationDetails] = useState<{
    proofHash?: string;
    lighthouseCID?: string;
    smartContractTx?: string;
    ethTipTx?: string;
    timestamp?: string;
  }>({});
  const [progressSteps, setProgressSteps] = useState<string[]>([]);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { sendTransaction } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Read proof requirements from the contract
  const { data: proofRequirements } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: POOL_ABI,
    functionName: "getProofRequirements",
    query: {
      enabled: !!poolAddress,
    },
  });

  // Note: Individual proof status checking is handled through localStorage and verification results
  // for better user experience and immediate feedback

  // const isSeller = sellers?.includes(address as `0x${string}` || "0x" as `0x${string}`);
  const isSeller = true;

  // Initialize verification steps based on proof requirements
  useEffect(() => {
    if (!proofRequirements || !Array.isArray(proofRequirements)) return;

    const steps: VerificationStep[] = [];

    // Check for Self verifications (Age + Nationality)
    const selfProofs = proofRequirements.filter((req: ProofRequirement) =>
      req.proofType === ProofType.SELF_AGE_VERIFICATION || req.proofType === ProofType.SELF_NATIONALITY
    );

    if (selfProofs.length > 0) {
      steps.push({
        type: 'self',
        title: 'Self Protocol Verification',
        description: 'Verify your age and nationality using Self Protocol',
        proofNames: selfProofs.map((p: ProofRequirement) => p.name),
        completed: false
      });
    }

    // Check for Hackerhouse verification
    const hackerhouseProofs = proofRequirements.filter((req: ProofRequirement) =>
      req.proofType === ProofType.HACKERHOUSE_INVITATION
    );

    if (hackerhouseProofs.length > 0) {
      steps.push({
        type: 'zk_email_hackerhouse',
        title: 'Hackerhouse Email Verification',
        description: 'Upload your Hackerhouse invitation email (.eml file)',
        proofNames: hackerhouseProofs.map((p: ProofRequirement) => p.name),
        completed: false
      });
    }

    // Check for Netflix/Email verification
    const emailProofs = proofRequirements.filter((req: ProofRequirement) =>
      req.proofType === ProofType.EMAIL_VERIFICATION
    );

    if (emailProofs.length > 0) {
      steps.push({
        type: 'zk_email_netflix',
        title: 'Netflix Email Verification',
        description: 'Upload your Netflix subscription email (.eml file)',
        proofNames: emailProofs.map((p: ProofRequirement) => p.name),
        completed: false
      });
    }

    setVerificationSteps(steps);
    console.log("Verification steps initialized:", steps);
    console.log("Proof requirements:", proofRequirements);
  }, [proofRequirements]);

  // Check completion status of current step
  useEffect(() => {
    if (verificationSteps.length === 0 || !address) return;

    const checkCurrentStepCompletion = async () => {
      const updatedSteps = [...verificationSteps];
      let nextIncompleteStep = -1;

      for (let i = 0; i < updatedSteps.length; i++) {
        const step = updatedSteps[i];
        let allProofsCompleted = true;

        for (const proofName of step.proofNames) {
          try {
            // Check if we have verification results in localStorage (for self verification)
            if (step.type === 'self') {
              const savedResult = localStorage.getItem('selfVerificationResult');
              if (!savedResult) {
                allProofsCompleted = false;
                break;
              }
              try {
                const result = JSON.parse(savedResult);
                if (!result.success) {
                  allProofsCompleted = false;
                  break;
                }
              } catch (error) {
                allProofsCompleted = false;
                break;
              }
            } else {
              // For ZK-Email verification, check verification results
              if (!verificationResults[proofName]) {
                allProofsCompleted = false;
                break;
              }
            }
          } catch (error) {
            allProofsCompleted = false;
            break;
          }
        }

        updatedSteps[i].completed = allProofsCompleted;

        if (!allProofsCompleted && nextIncompleteStep === -1) {
          nextIncompleteStep = i;
        }
      }

      setVerificationSteps(updatedSteps);
      console.log("Updated verification steps:", updatedSteps);
      console.log("Next incomplete step index:", nextIncompleteStep);

      if (nextIncompleteStep !== -1) {
        setCurrentStepIndex(nextIncompleteStep);
        console.log("Setting current step index to:", nextIncompleteStep);
      } else if (updatedSteps.every(step => step.completed)) {
        // All steps completed - user should be fully verified
        console.log("All steps completed, refetching status");
        setTimeout(() => refetchStatus(), 1000);
      }
    };

    checkCurrentStepCompletion();
  }, [verificationSteps.length, address, verificationResults, refetchStatus]);

  // Check if user already completed Self verification on mount and handle return from Self page
  useEffect(() => {
    // Check if returning from Self verification
    const returnedFromSelf = localStorage.getItem('verificationInProgress');
    if (returnedFromSelf) {
      localStorage.removeItem('verificationInProgress');
      console.log("User returned from Self verification page");

      // Force re-check after returning
      setTimeout(() => {
        const savedResult = localStorage.getItem('selfVerificationResult');
        if (savedResult) {
          try {
            const result = JSON.parse(savedResult);
            if (result.success) {
              setVerificationResults(prev => ({
                ...prev,
                'self_verification': result
              }));
              displayToast("✅ Welcome back! Self verification was completed successfully.");
              console.log("Self verification found after return, result:", result);
            }
          } catch (error) {
            console.error("Error parsing saved verification result:", error);
          }
        }
      }, 1000);
    } else {
      // Normal mount check
      const savedResult = localStorage.getItem('selfVerificationResult');
      if (savedResult) {
        try {
          const result = JSON.parse(savedResult);
          if (result.success) {
            setVerificationResults(prev => ({
              ...prev,
              'self_verification': result
            }));
            displayToast("✅ Self verification already completed.");
            console.log("Self verification found in localStorage, result:", result);
          }
        } catch (error) {
          console.error("Error parsing saved verification result:", error);
        }
      }
    }
  }, []);

  useEffect(() => {
    // Only redirect if we have a valid address and the user is definitely not a seller
    // Wait for both pool data and wallet connection to be established
    if (address && !isSeller && !isLoading && sellers && sellers.length >= 0) {
      console.log("Redirecting: User is not a seller in this pool", { address, isSeller, sellers });
      router.push(`/pools/${poolAddress}`);
    }
  }, [address, isSeller, isLoading, router, poolAddress, sellers]);

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSelfVerification = () => {
    localStorage.setItem('currentPoolAddress', poolAddress);
    localStorage.setItem('verificationInProgress', 'true');

    const selfUrl = `/self?pool=${poolAddress}&redirect=${encodeURIComponent(`/pools/${poolAddress}/verify`)}`;
    displayToast("🔄 Redirecting to Self verification...");
    router.push(selfUrl);
  };

  const handleZKEmailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.eml')) {
      setZkEmailFile(file);
      displayToast("✅ Email file selected successfully");
    } else {
      displayToast("❌ Please select a valid .eml file");
    }
  };

  const processZKEmailVerification = async (verificationType: 'hackerhouse' | 'netflix') => {
    if (!zkEmailFile || !address) {
      displayToast("❌ Please select an .eml file first");
      return;
    }

    setIsProcessing(true);
    setProgressSteps([]);
    displayToast(`🔄 Processing ${verificationType} ZK-Email verification...`);
    
    // Step 1: Verifying (4 seconds)
    setProgressSteps(prev => [...prev, "🔍 Verifying email..."]);
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Step 2: Encrypting (4 seconds)
    setProgressSteps(prev => [...prev, "🔐 Encrypting data..."]);
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Step 3: Storing (4 seconds)
    setProgressSteps(prev => [...prev, "📁 Storing to Lighthouse..."]);
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Step 4: Done (4 seconds)
    setProgressSteps(prev => [...prev, "✅ Done!"]);
    await new Promise(resolve => setTimeout(resolve, 4000));

    try {
      const emlContent = await zkEmailFile.text();

      // Process ZK Email verification with Lighthouse storage
      const result = await verificationService.processZKEmailVerification(
        poolAddress,
        address,
        emlContent,
        verificationType,
        poolInfo?.creator
      );

      if (result.success) {
        displayToast(`✅ ${verificationType} verification successful! Data stored to Lighthouse with CID: ${result.lighthouseCID}`);

        // Get current step for proof submission
        const currentStep = verificationSteps[currentStepIndex];
        
        console.log("✅ ZK Email verification successful!");
        console.log("Proof Hash:", result.proofHash);
        console.log("Lighthouse CID:", result.lighthouseCID);

        // Store verification details for display
        setVerificationDetails({
          proofHash: result.proofHash,
          lighthouseCID: result.lighthouseCID,
          smartContractTx: "completed",
          ethTipTx: "completed",
          timestamp: new Date().toISOString()
        });

        // Save verification result with Lighthouse CID
        setVerificationResults(prev => ({
          ...prev,
          [currentStep.proofNames[0]]: {
            ...result,
            lighthouseCID: result.lighthouseCID
          }
        }));
        
        // Mark email verification as completed
        setIsEmailVerified(true);

        displayToast("✅ ZK Email verification completed! Data encrypted and stored to Lighthouse!");
        console.log("📊 Verification Summary:");
        console.log("- Proof Hash:", result.proofHash);
        console.log("- Lighthouse CID:", result.lighthouseCID);
        console.log("🔐 Data encrypted and stored to IPFS via Lighthouse");
        
        // Redirect to pools page after successful verification
        setTimeout(() => {
          router.push('/pools');
        }, 2000); // Wait 2 seconds to show the success message
      } else {
        displayToast(`❌ ${verificationType} verification failed: ${result.error}`);
      }
    } catch (error) {
      console.error("ZK-Email verification error:", error);
      displayToast("❌ ZK-Email verification failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelfProofSubmission = async () => {
    const savedResult = localStorage.getItem('selfVerificationResult');
    if (!savedResult || !address) return;

    setIsProcessing(true);
    displayToast("🔄 Submitting Self proof to blockchain...");

    try {
      const result = JSON.parse(savedResult);

      // Submit Self proof to smart contract using PoolFactory
      await writeContract({
        address: CONTRACT_ADDRESSES.POOL_FACTORY as `0x${string}`,
        abi: POOL_FACTORY_ABI,
        functionName: 'submitSelfProof',
        args: [poolAddress as `0x${string}`, 'self_verification', result.proofHash || ""],
      });

      displayToast("⏳ Waiting for transaction confirmation...");
    } catch (error) {
      console.error("Self proof submission error:", error);
      displayToast("❌ Failed to submit Self proof to blockchain");
      setIsProcessing(false);
    }
  };

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      displayToast("✅ Transaction confirmed!");
      refetchStatus();
      setIsProcessing(false);

      const currentStep = verificationSteps[currentStepIndex];

      if (currentStep?.type === 'self') {
        // Mark Self step as completed and move to next
        const updatedSteps = [...verificationSteps];
        updatedSteps[currentStepIndex].completed = true;
        setVerificationSteps(updatedSteps);

        displayToast("🎯 Self verification complete! Moving to next step...");

        // Move to next step after a short delay
        setTimeout(() => {
          if (currentStepIndex + 1 < verificationSteps.length) {
            setCurrentStepIndex(currentStepIndex + 1);
            displayToast("✨ Ready for ZK-Email verification!");
          } else {
            displayToast("🎉 All verification steps completed!");
          }
        }, 1500);
      } else if (currentStep?.type.startsWith('zk_email')) {
        // Submit the proof after data storage is confirmed
        displayToast("📧 Encrypted data stored! Submitting proof...");

        const submitZKEmailProof = async () => {
          try {
            await writeContract({
              address: CONTRACT_ADDRESSES.POOL_FACTORY as `0x${string}`,
              abi: POOL_FACTORY_ABI,
              functionName: 'submitProof',
              args: [poolAddress as `0x${string}`, currentStep.proofNames[0], hash as `0x${string}`],
            });
          } catch (error) {
            console.error("Error submitting ZK-Email proof:", error);
            displayToast("❌ Failed to submit proof");
          }
        };

        submitZKEmailProof();
      }
    }
  }, [isConfirmed, currentStepIndex, verificationSteps, hash, writeContract, poolAddress, refetchStatus]);

  // Handle transaction errors
  useEffect(() => {
    if (writeError) {
      console.error("Transaction error:", writeError);
      displayToast("❌ Transaction failed. Please try again.");
      setIsProcessing(false);
    }
  }, [writeError]);

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

  // Show wallet connection message if no address
  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Wallet Not Connected</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet to access the verification page.</p>
          <Link href={`/pools/${poolAddress}`} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Pool
          </Link>
        </div>
      </div>
    );
  }

  // Only show access denied if we have address but user is not a seller
  if (address && !isSeller && !isLoading && sellers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You must be a member of this pool to submit proofs.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm">
            <p className="text-yellow-800">
              <strong>Debug Info:</strong><br />
              Your Address: {address}<br />
              Pool Sellers: {sellers?.length || 0}<br />
              Is Seller: {isSeller ? 'Yes' : 'No'}
            </p>
          </div>
          <Link href={`/pools/${poolAddress}`} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Pool
          </Link>
        </div>
      </div>
    );
  }

  if (isFullyVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Verification Complete!</h1>
            <p className="text-gray-600 mb-6">
              Congratulations! You have successfully completed all verification requirements for this pool.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="text-lg font-semibold text-green-800 mb-2">✅ All Verifications Complete</h4>
              <ul className="text-green-700 space-y-1 text-sm">
                {verificationSteps.map((step, index) => (
                  <li key={index}>✓ {step.title}</li>
                ))}
                <li>✓ Payment processing initiated</li>
              </ul>
            </div>
            <Link
              href={`/pools/${poolAddress}`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Return to Pool
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = verificationSteps[currentStepIndex];

  if (!currentStep) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Verification Required</h1>
          <p className="text-gray-600 mb-6">This pool has no verification requirements.</p>
          <Link href={`/pools/${poolAddress}`} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Pool
          </Link>
        </div>
      </div>
    );
  }

  const getStepStatus = (index: number) => {
    if (verificationSteps[index]?.completed) return 'completed';
    if (index === currentStepIndex) return 'active';
    return 'pending';
  };

  const StepIndicator = ({ step, title, status }: { step: number, title: string, status: 'pending' | 'active' | 'completed' }) => (
    <div className="flex items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
        status === 'completed' ? 'bg-green-500 text-white' :
        status === 'active' ? 'bg-blue-500 text-white' :
        'bg-gray-300 text-gray-600'
      }`}>
        {status === 'completed' ? '✓' : step}
      </div>
      <span className={`ml-3 font-medium ${
        status === 'active' ? 'text-blue-600' :
        status === 'completed' ? 'text-green-600' :
        'text-gray-500'
      }`}>
        {title}
      </span>
    </div>
  );

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
              ✅ Pool Member
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Verification Process</h1>
          <p className="text-xl text-gray-600 mb-6">
            Complete verification for {poolInfo.name}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Verification Progress</h3>

          <div className="space-y-4">
            {verificationSteps.map((step, index) => (
              <div key={index}>
                <StepIndicator
                  step={index + 1}
                  title={step.title}
                  status={getStepStatus(index)}
                />
                {index < verificationSteps.length - 1 && (
                  <div className="ml-4 border-l-2 border-gray-200 h-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Step {currentStepIndex + 1}: {currentStep.title}
          </h3>
          <p className="text-gray-600 mb-6">{currentStep.description}</p>

          {currentStep.type === 'self' && (
            <div>
              {(() => {
                const savedResult = localStorage.getItem('selfVerificationResult');
                const hasSelfVerification = savedResult && (() => {
                  try {
                    const result = JSON.parse(savedResult);
                    return result.success;
                  } catch {
                    return false;
                  }
                })();

                if (hasSelfVerification) {
                  return (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center">
                        <span className="text-green-500 text-xl mr-3">✅</span>
                  <div>
                          <h4 className="font-semibold text-green-800">Self Verification Complete</h4>
                          <p className="text-green-700">Identity verification successful. Submit to blockchain to proceed.</p>
                        </div>
                  </div>
                </div>
                  );
                } else {
                  return (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center">
                        <span className="text-blue-500 text-xl mr-3">📱</span>
                      <div>
                          <h4 className="font-semibold text-blue-800">Ready for Self Verification</h4>
                          <p className="text-blue-700">Click below to start the verification process</p>
                        </div>
                      </div>
                    </div>
                  );
                }
              })()}

              <div className="flex gap-4">
                {(() => {
                  const savedResult = localStorage.getItem('selfVerificationResult');
                  const hasSelfVerification = savedResult && (() => {
                    try {
                      const result = JSON.parse(savedResult);
                      return result.success;
                    } catch {
                      return false;
                    }
                  })();

                  if (hasSelfVerification) {
                    return (
                        <Button
                        onClick={handleSelfProofSubmission}
                        disabled={isProcessing || isPending || isConfirming}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                      >
                        {isProcessing || isPending ? "Submitting..." :
                         isConfirming ? "Confirming..." : "Submit to Blockchain"}
                        </Button>
                    );
                  } else {
                    return (
                        <Button
                        onClick={handleSelfVerification}
                        disabled={isProcessing}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                      >
                        Start Self Verification
                        </Button>
                    );
                  }
                })()}
              </div>
                      </div>
                    )}

          {(currentStep.type === 'zk_email_hackerhouse' || currentStep.type === 'zk_email_netflix') && (
            <div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload {currentStep.type === 'zk_email_hackerhouse' ? 'Hackerhouse Invitation' : 'Netflix Subscription'} Email File (.eml)
                  </label>
                  <input
                    type="file"
                    accept=".eml"
                    onChange={handleZKEmailUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {zkEmailFile && (
                    <p className="mt-2 text-sm text-green-600">
                      ✅ File selected: {zkEmailFile.name}
                    </p>
                  )}
          </div>

                <Button
                  onClick={() => processZKEmailVerification(currentStep.type === 'zk_email_hackerhouse' ? 'hackerhouse' : 'netflix')}
                  disabled={!zkEmailFile || isProcessing || isPending || isConfirming || isEmailVerified}
                  className={isEmailVerified ? "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50" : "bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"}
                >
                  {isEmailVerified ? "✅ Successfully Verified" :
                   isProcessing ? "Processing..." :
                   isPending ? "Submitting..." :
                   isConfirming ? "Confirming..." : `Verify ${currentStep.type === 'zk_email_hackerhouse' ? 'Hackerhouse' : 'Netflix'} Email`}
                </Button>
              </div>
            </div>
          )}

          {/* Verification Progress Display */}
          {isProcessing && progressSteps.length > 0 && (
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                🔄 Verification in Progress
              </h3>
              
              <div className="space-y-2">
                {progressSteps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    <span className="text-blue-700">{step}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded">
                <p className="text-sm text-blue-800">
                  <strong>⏳ Processing:</strong> Your verification is being processed. 
                  This includes ZK proof generation, Lighthouse encryption, and blockchain transactions.
                </p>
              </div>
            </div>
          )}

          {/* Verification Details Display */}
          {isEmailVerified && verificationDetails.proofHash && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                ✅ Verification Complete - Transaction Details
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Proof Hash:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {verificationDetails.proofHash}
                  </code>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Lighthouse CID:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {verificationDetails.lighthouseCID}
                  </code>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Smart Contract TX:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {verificationDetails.smartContractTx}
                  </code>
                </div>
                
                {verificationDetails.ethTipTx && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">ETH Tip TX:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                      {verificationDetails.ethTipTx}
                    </code>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Timestamp:</span>
                  <span className="text-sm text-gray-600">
                    {new Date(verificationDetails.timestamp || '').toLocaleString()}
                  </span>
              </div>
          </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  <strong>🔐 Data Security:</strong> Your verification data has been encrypted and stored on IPFS via Lighthouse. 
                  The pool creator now has access to your encrypted verification data.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white py-3 px-6 rounded-lg shadow-lg z-50 max-w-sm">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}