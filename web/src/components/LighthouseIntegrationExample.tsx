"use client";

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { usePoolManagement } from '@/lib/hooks/usePoolManagement';
import { useSignMessage } from '@/lib/hooks/useSignMessage';
import { parseEther } from 'viem';

interface LighthouseIntegrationExampleProps {
  poolAddress: string;
  userContractAddress?: string;
  poolOwnerAddress?: string;
}

/**
 * Example component demonstrating the integrated Lighthouse + ZK Email flow
 */
export default function LighthouseIntegrationExample({
  poolAddress,
  userContractAddress,
  poolOwnerAddress
}: LighthouseIntegrationExampleProps) {
  const { address } = useAccount();
  const { getSignedMessage } = useSignMessage();

  const poolManagement = usePoolManagement(poolAddress, userContractAddress);

  // State for different flows
  const [verificationData, setVerificationData] = useState('');
  const [emlContent, setEmlContent] = useState('');
  const [dataToSubmit, setDataToSubmit] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Handler for ZK Email Registry verification (Your Blueprint)
  const handleRegistryVerification = async () => {
    if (!address || !emlContent) return;

    setIsProcessing(true);
    try {
      const signedMessage = await getSignedMessage();

      await poolManagement.submitZKEmailProof(
        "registry_verification",
        emlContent,
        'registry', // Uses your registry circuit: 2a750584-9226-4a64-a257-d72c19cbfc09
        address,
        signedMessage,
        poolOwnerAddress
      );

      console.log("✅ ZK Email Registry verification completed with Lighthouse encryption!");
      console.log("🔗 Circuit ID: 2a750584-9226-4a64-a257-d72c19cbfc09");
    } catch (error) {
      console.error("❌ ZK Email Registry verification failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for ZK Email verification (Hackerhouse - Legacy)
  const handleHackerhouseVerification = async () => {
    if (!address || !emlContent) return;

    setIsProcessing(true);
    try {
      const signedMessage = await getSignedMessage();

      await poolManagement.submitZKEmailProof(
        "hackerhouse_verification",
        emlContent,
        'hackerhouse',
        address,
        signedMessage,
        poolOwnerAddress
      );

      console.log("✅ Hackerhouse verification completed with Lighthouse encryption!");
    } catch (error) {
      console.error("❌ Hackerhouse verification failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for ZK Email verification (Netflix - Legacy)
  const handleNetflixVerification = async () => {
    if (!address || !emlContent) return;

    setIsProcessing(true);
    try {
      const signedMessage = await getSignedMessage();

      await poolManagement.submitZKEmailProof(
        "netflix_verification",
        emlContent,
        'netflix',
        address,
        signedMessage,
        poolOwnerAddress
      );

      console.log("✅ Netflix verification completed with Lighthouse encryption!");
    } catch (error) {
      console.error("❌ Netflix verification failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for Self verification
  const handleSelfVerification = async () => {
    if (!address || !verificationData) return;

    setIsProcessing(true);
    try {
      const signedMessage = await getSignedMessage();

      const selfVerificationData = {
        userId: address,
        disclosures: JSON.parse(verificationData),
        sessionId: Date.now().toString()
      };

      await poolManagement.submitSelfProof(
        "self_verification",
        selfVerificationData,
        address,
        signedMessage,
        poolOwnerAddress
      );

      console.log("✅ Self verification completed with Lighthouse encryption!");
    } catch (error) {
      console.error("❌ Self verification failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for submitting data with encryption
  const handleDataSubmission = async () => {
    if (!address || !dataToSubmit) return;

    setIsProcessing(true);
    try {
      const signedMessage = await getSignedMessage();

      const data = {
        content: dataToSubmit,
        timestamp: new Date().toISOString(),
        submitter: address
      };

      await poolManagement.submitData(
        data,
        address,
        signedMessage,
        poolOwnerAddress
      );

      console.log("✅ Data submitted with Lighthouse encryption!");
    } catch (error) {
      console.error("❌ Data submission failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for purchasing data with automatic access transfer
  const handlePurchaseData = async (sellerAddress: string, encryptedCID: string) => {
    if (!address) return;

    setIsProcessing(true);
    try {
      const signedMessage = await getSignedMessage();
      const pricePerData = poolManagement.poolInfo?.pricePerData || parseEther("0.1");

      await poolManagement.purchaseData(
        pricePerData,
        sellerAddress,
        encryptedCID,
        address,
        signedMessage
      );

      console.log("✅ Data purchased and access transferred via Lighthouse!");
    } catch (error) {
      console.error("❌ Data purchase failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = poolManagement.isLoading ||
                   poolManagement.isSubmittingSelfProof ||
                   poolManagement.isSubmittingZKEmailProof ||
                   poolManagement.isSubmitting ||
                   poolManagement.isPurchasing ||
                   isProcessing;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Lighthouse + ZK Email Integration</h2>

        {/* Pool Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Pool Information</h3>
          <p><span className="font-medium">Address:</span> {poolAddress}</p>
          <p><span className="font-medium">Total Budget:</span> {poolManagement.poolInfo?.totalBudget?.toString() || 'Loading...'}</p>
          <p><span className="font-medium">Price per Data:</span> {poolManagement.poolInfo?.pricePerData?.toString() || 'Loading...'}</p>
          <p><span className="font-medium">Verified Sellers:</span> {poolManagement.verifiedSellersCount}</p>
        </div>

        {/* ZK Email Verification Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">ZK Email Verification</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">EML File Content</label>
              <textarea
                value={emlContent}
                onChange={(e) => setEmlContent(e.target.value)}
                placeholder="Paste your .eml file content here..."
                className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-3">
              {/* Primary Registry Circuit Button */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-blue-900">🎯 Your ZK Email Registry Circuit</h4>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">ID: 2a750584...</span>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  This uses your registered ZK Email circuit from the registry for email verification.
                </p>
                <button
                  onClick={handleRegistryVerification}
                  disabled={isLoading || !emlContent || !address}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {poolManagement.isSubmittingZKEmailProof ? 'Processing with Registry Circuit...' : '🚀 Verify with Registry Circuit'}
                </button>
              </div>

              {/* Legacy Options */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleHackerhouseVerification}
                  disabled={isLoading || !emlContent || !address}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {poolManagement.isSubmittingZKEmailProof ? 'Processing...' : 'Legacy: Hackerhouse'}
                </button>

                <button
                  onClick={handleNetflixVerification}
                  disabled={isLoading || !emlContent || !address}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {poolManagement.isSubmittingZKEmailProof ? 'Processing...' : 'Legacy: Netflix'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Self Verification Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Self Verification</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Verification Data (JSON)</label>
              <textarea
                value={verificationData}
                onChange={(e) => setVerificationData(e.target.value)}
                placeholder='{"name": "John Doe", "age": 25, "verified": true}'
                className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none"
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleSelfVerification}
              disabled={isLoading || !verificationData || !address}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {poolManagement.isSubmittingSelfProof ? 'Processing...' : 'Submit Self Verification'}
            </button>
          </div>
        </div>

        {/* Data Submission Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Submit Data (with Encryption)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data Content</label>
              <textarea
                value={dataToSubmit}
                onChange={(e) => setDataToSubmit(e.target.value)}
                placeholder="Enter your data here. It will be automatically encrypted and stored on Lighthouse..."
                className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none"
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleDataSubmission}
              disabled={isLoading || !dataToSubmit || !address}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {poolManagement.isSubmitting ? 'Encrypting & Submitting...' : 'Submit Data with Encryption'}
            </button>
          </div>
        </div>

        {/* Data Purchase Example */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Purchase Data (with Access Transfer)</h3>
          <p className="text-sm text-gray-600 mb-4">
            Example: Purchase data from a seller and automatically get Lighthouse access
          </p>

          <button
            onClick={() => handlePurchaseData("0x1234...example", "Qm...exampleCID")}
            disabled={isLoading || !address}
            className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {poolManagement.isPurchasing ? 'Purchasing & Transferring Access...' : 'Purchase Example Data'}
          </button>
        </div>

        {/* Status Messages */}
        {poolManagement.hasZKEmailProofSubmitted && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            ✅ ZK Email proof submitted successfully with Lighthouse encryption!
          </div>
        )}

        {poolManagement.hasSelfProofSubmitted && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            ✅ Self verification completed successfully with Lighthouse encryption!
          </div>
        )}

        {poolManagement.hasSubmitted && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            ✅ Data submitted successfully with Lighthouse encryption!
          </div>
        )}

        {poolManagement.hasPurchased && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            ✅ Data purchased successfully and Lighthouse access transferred!
          </div>
        )}

        {/* Connection Status */}
        {!address && (
          <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
            ⚠️ Please connect your wallet to use these features.
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">🚀 How it works:</h3>

        {/* Registry Circuit Highlight */}
        <div className="mb-4 p-3 bg-white rounded border-l-4 border-blue-500">
          <p className="text-sm font-bold text-blue-800 mb-1">🎯 Your ZK Email Registry Circuit</p>
          <p className="text-xs text-gray-700 mb-2">
            Circuit ID: <code className="bg-gray-100 px-1 rounded">2a750584-9226-4a64-a257-d72c19cbfc09</code>
          </p>
          <p className="text-xs text-gray-600">
            This is your registered ZK Email circuit that can verify email authenticity.
            Upload any .eml file and it will be verified using your circuit!
          </p>
        </div>

        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li><strong>Registry ZK Email:</strong> Upload .eml file → Your registry circuit verification → Lighthouse encryption → Pool submission</li>
          <li><strong>Self Verification:</strong> Provide verification data → Lighthouse encryption → Pool submission</li>
          <li><strong>Data Submission:</strong> Upload data → Automatic Lighthouse encryption → Share with pool owner → Smart contract storage</li>
          <li><strong>Data Purchase:</strong> Pay for data → Automatic Lighthouse access transfer → Buyer can decrypt</li>
        </ol>

        <div className="mt-4 p-3 bg-white rounded border">
          <p className="text-sm font-medium">🔐 <strong>Lighthouse Integration:</strong></p>
          <p className="text-xs text-gray-600">
            All data is automatically encrypted using your wallet signature and stored securely on Lighthouse.
            Access is granted only to authorized parties (pool owners for verification, buyers after purchase).
          </p>
        </div>

        <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
          <p className="text-sm font-medium text-green-800">✨ <strong>Ready to Use:</strong></p>
          <p className="text-xs text-green-700">
            Your ZK Email registry circuit is configured and ready! Just upload your .eml file and click "🚀 Verify with Registry Circuit" to use it.
          </p>
        </div>
      </div>
    </div>
  );
}