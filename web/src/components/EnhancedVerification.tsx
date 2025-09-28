"use client";

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useSignMessage } from '@/lib/hooks/useSignMessage';
import { useDataTracker } from '@/lib/hooks/useDataTracker';
import { verificationService } from '@/lib/verification-service';
import PoolOwnerDashboard from './PoolOwnerDashboard';

interface EnhancedVerificationProps {
  poolAddress?: string;
  poolOwnerAddress?: string;
}

/**
 * Enhanced verification component with automatic redirect to pool owner dashboard
 */
export default function EnhancedVerification({
  poolAddress = "0x5c97e0e7085c3fEA96Cfdf0F8FB545A641fdD067",
  poolOwnerAddress = "0xAbE4ea6b679aE6e56B1cF5d7Efcc3f4be5fE0816"
}: EnhancedVerificationProps) {
  const { address } = useAccount();
  const { getSignedMessage } = useSignMessage();
  const { addRecord } = useDataTracker();

  const [currentView, setCurrentView] = useState<'verification' | 'dashboard'>('verification');
  const [emlContent, setEmlContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  // Helper function to parse EML content
  const parseEMLContent = (emlContent: string) => {
    const lines = emlContent.split('\n');
    let from = '';
    let to = '';
    let subject = '';
    let date = '';

    for (const line of lines) {
      if (line.startsWith('From:')) {
        from = line.substring(5).trim();
      } else if (line.startsWith('To:')) {
        to = line.substring(3).trim();
      } else if (line.startsWith('Subject:')) {
        subject = line.substring(8).trim();
      } else if (line.startsWith('Date:')) {
        date = line.substring(5).trim();
      }
    }

    return { from, to, subject, date };
  };

  // Handle ZK Email verification with automatic redirect
  const handleVerification = async () => {
    if (!address || !emlContent) return;

    setIsProcessing(true);
    setError('');
    setVerificationResult(null);

    try {
      console.log("🚀 Starting verification with automatic dashboard redirect...");

      // Get signed message
      const signedMessage = await getSignedMessage();

      // Process verification
      const result = await verificationService.processZKEmailVerification(
        poolAddress,
        address,
        emlContent,
        'registry', // Use registry circuit
        poolOwnerAddress
      );

      console.log("📊 Verification result:", result);
      setVerificationResult(result);

      if (result.success) {
        console.log("✅ Verification successful! Adding to tracker and redirecting...");

        // Add to data tracker
        const parsedEML = parseEMLContent(emlContent);
        const newRecord = addRecord({
          type: 'verification',
          userAddress: address,
          poolAddress,
          lighthouseCID: result.lighthouseCID || 'mock-cid',
          proofHash: result.proofHash,
          sharedWith: poolOwnerAddress ? [poolOwnerAddress.toLowerCase()] : [],
          dataPreview: `Email verification: ${parsedEML.from} - ${parsedEML.subject}`,
          status: poolOwnerAddress ? 'shared' : 'encrypted',
          metadata: {
            verificationType: 'registry',
            emailFrom: parsedEML.from,
            emailSubject: parsedEML.subject,
            circuitId: '2a750584-9226-4a64-a257-d72c19cbfc09',
            dataSize: emlContent.length
          }
        });

        console.log("📊 New record added to tracker:", newRecord.id);

        // Show success message briefly, then redirect
        setTimeout(() => {
          console.log("🎯 Redirecting to Pool Owner Dashboard...");
          setCurrentView('dashboard');
        }, 2000);

      } else {
        console.log("❌ Verification failed:", result.error);
        setError(result.error || "Verification failed");
      }

    } catch (err: any) {
      console.error("❌ Verification error:", err);
      setError(err.message || "Unknown error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const sampleEML = `Delivered-To: user@example.com
Received: by 2002:a05:6402:3513:b0:52e:7d86:ba08 with SMTP id ay19csp123456
Return-Path: <sender@example.com>
From: sender@example.com
To: user@example.com
Subject: ETH Delhi Hackerhouse Invitation - You're Selected!
Date: Wed, 28 Sep 2025 10:30:00 +0000
Message-ID: <test123@example.com>

Congratulations! You have been selected for the ETH Delhi Hackerhouse program.

Your ZK Email verification has been processed with:
Circuit ID: 2a750584-9226-4a64-a257-d72c19cbfc09

Please confirm your attendance by replying to this email.

Best regards,
ETH Delhi Team`;

  // Render based on current view
  if (currentView === 'dashboard') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <button
            onClick={() => setCurrentView('verification')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            ← Back to Verification
          </button>
        </div>
        <PoolOwnerDashboard
          poolAddress={poolAddress}
          poolOwnerAddress={poolOwnerAddress}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">📧 ZK Email Verification</h2>

        {/* Pool Information */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Pool Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Pool Address:</span>
              <div className="font-mono">{poolAddress}</div>
            </div>
            <div>
              <span className="font-medium">Pool Owner:</span>
              <div className="font-mono">{poolOwnerAddress}</div>
            </div>
            <div>
              <span className="font-medium">Your Address:</span>
              <div className="font-mono">{address || 'Not connected'}</div>
            </div>
            <div>
              <span className="font-medium">Circuit ID:</span>
              <div className="font-mono text-xs">2a750584-9226-4a64-a257-d72c19cbfc09</div>
            </div>
          </div>
        </div>

        {/* Verification Form */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">EML File Content</label>
              <button
                onClick={() => setEmlContent(sampleEML)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Use Sample EML
              </button>
            </div>
            <textarea
              value={emlContent}
              onChange={(e) => setEmlContent(e.target.value)}
              placeholder="Paste your .eml file content here..."
              className="w-full h-40 p-3 border border-gray-300 rounded-md resize-vertical"
              disabled={isProcessing}
            />
          </div>

          {/* Registry Circuit Highlight */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-blue-900">🎯 Your ZK Email Registry Circuit</h4>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">ID: 2a750584...</span>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              This uses your registered ZK Email circuit for verification. After successful verification,
              you'll be redirected to the Pool Owner Dashboard to see your submission.
            </p>
          </div>

          {/* Verification Button */}
          <button
            onClick={handleVerification}
            disabled={isProcessing || !emlContent || !address}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isProcessing ? '🔄 Processing Verification...' : '🚀 Verify Email & Submit to Pool'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Success Display */}
        {verificationResult && verificationResult.success && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">✅</span>
              <strong>Verification Successful!</strong>
            </div>
            <div className="space-y-2 text-sm">
              <div><strong>Lighthouse CID:</strong> <span className="font-mono">{verificationResult.lighthouseCID}</span></div>
              <div><strong>Proof Hash:</strong> <span className="font-mono">{verificationResult.proofHash}</span></div>
              <div><strong>Pool Owner Access:</strong> ✅ Granted</div>
              <div className="text-blue-700 font-medium">🎯 Redirecting to Pool Owner Dashboard in 2 seconds...</div>
            </div>
          </div>
        )}

        {/* Connection Status */}
        {!address && (
          <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
            ⚠️ Please connect your wallet to verify your email.
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">📋 What Happens Next:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Your email will be verified using the ZK registry circuit</li>
            <li>2. Verification data will be encrypted and stored on Lighthouse</li>
            <li>3. Pool owner will automatically get access to review your submission</li>
            <li>4. You'll be redirected to the Pool Owner Dashboard to see your submission</li>
            <li>5. Pool owner can approve/reject your verification</li>
          </ol>
        </div>
      </div>
    </div>
  );
}