"use client";

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { zkEmailService } from '@/lib/zk-email';
import { verificationService } from '@/lib/verification-service';
import { useSignMessage } from '@/lib/hooks/useSignMessage';
import { useDataTracker } from '@/lib/hooks/useDataTracker';
import DataTracker from './DataTracker';

interface DebugZKVerificationProps {
  poolAddress?: string;
  poolOwnerAddress?: string;
}

/**
 * Debug component to test ZK Email verification flow
 */
export default function DebugZKVerification({
  poolAddress = "0x5c97e0e7085c3fEA96Cfdf0F8FB545A641fdD067",
  poolOwnerAddress = "0xAbE4ea6b679aE6e56B1cF5d7Efcc3f4be5fE0816"
}: DebugZKVerificationProps) {
  const { address } = useAccount();
  const { getSignedMessage } = useSignMessage();
  const { addRecord } = useDataTracker();

  const [emlContent, setEmlContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [showTracker, setShowTracker] = useState(false);

  // Test the registry circuit verification
  const testRegistryVerification = async () => {
    if (!address || !emlContent) return;

    setIsProcessing(true);
    setError('');
    setResults(null);

    try {
      console.log("🧪 Starting debug verification test...");

      // Get signed message
      const signedMessage = await getSignedMessage();
      console.log("✅ Got signed message");

      // Test the verification service
      const result = await verificationService.processZKEmailVerification(
        poolAddress,
        address,
        emlContent,
        'registry', // Use your registry circuit
        poolOwnerAddress
      );

      console.log("🧪 Verification result:", result);
      setResults(result);

      if (result.success) {
        console.log("✅ Debug verification completed successfully!");

        // Add to data tracker
        const parsedEML = parseEMLContent(emlContent);
        addRecord({
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
            circuitId: '2a750584-9226-4a64-a257-d72c19cbfc09'
          }
        });

      } else {
        console.log("❌ Debug verification failed:", result.error);
        setError(result.error || "Verification failed");
      }

    } catch (err: any) {
      console.error("❌ Debug verification error:", err);
      setError(err.message || "Unknown error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  // Test just the ZK Email service
  const testZKEmailOnly = async () => {
    if (!address || !emlContent) return;

    setIsProcessing(true);
    setError('');
    setResults(null);

    try {
      console.log("🧪 Testing ZK Email service only...");

      // Get signed message
      const signedMessage = await getSignedMessage();

      // Test direct ZK Email verification
      const result = await zkEmailService.verifyEmail(
        emlContent,
        'registry',
        address,
        signedMessage,
        poolOwnerAddress
      );

      console.log("🧪 ZK Email result:", result);
      setResults(result);

      if (result.isValid) {
        console.log("✅ ZK Email verification successful!");
      } else {
        console.log("❌ ZK Email verification failed");
        setError("ZK Email verification failed");
      }

    } catch (err: any) {
      console.error("❌ ZK Email test error:", err);
      setError(err.message || "ZK Email test failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const sampleEML = `Delivered-To: user@example.com
Received: by 2002:a05:6402:3513:b0:52e:7d86:ba08 with SMTP id ay19csp123456
Return-Path: <sender@example.com>
From: sender@example.com
To: user@example.com
Subject: Test Email for ZK Verification
Date: Wed, 28 Sep 2025 10:30:00 +0000
Message-ID: <test123@example.com>

This is a test email for ZK Email verification.
Circuit ID: 2a750584-9226-4a64-a257-d72c19cbfc09

Best regards,
Test Sender`;

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

  return (
    <div className="space-y-6">
      {/* Toggle Tracker Button */}
      <div className="text-center">
        <button
          onClick={() => setShowTracker(!showTracker)}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          {showTracker ? '🧪 Show Debug Panel' : '📊 Show Data Tracker'}
        </button>
      </div>

      {showTracker ? (
        <DataTracker poolAddress={poolAddress} />
      ) : (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">🧪 Debug ZK Email Verification</h2>

        {/* Connection Status */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p><strong>Wallet:</strong> {address || 'Not connected'}</p>
          <p><strong>Pool:</strong> {poolAddress}</p>
          <p><strong>Pool Owner:</strong> {poolOwnerAddress}</p>
          <p><strong>Registry Circuit:</strong> 2a750584-9226-4a64-a257-d72c19cbfc09</p>
        </div>

        {/* EML Input */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">EML Content</label>
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

        {/* Test Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={testRegistryVerification}
            disabled={isProcessing || !emlContent || !address}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isProcessing ? '🔄 Testing Full Verification Flow...' : '🧪 Test Full Verification + Lighthouse'}
          </button>

          <button
            onClick={testZKEmailOnly}
            disabled={isProcessing || !emlContent || !address}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isProcessing ? '🔄 Testing ZK Email Only...' : '🧪 Test ZK Email Service Only'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            <h3 className="font-bold mb-2">✅ Test Results:</h3>
            <pre className="text-xs bg-white p-2 rounded overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Debug Instructions:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Connect your wallet</li>
            <li>2. Paste EML content or use sample</li>
            <li>3. Click "Test Full Verification" to test the complete flow</li>
            <li>4. Check browser console for detailed logs</li>
            <li>5. If errors occur, try "Test ZK Email Only" to isolate issues</li>
          </ol>

          <div className="mt-3 p-2 bg-white rounded border">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> This uses mock Lighthouse encryption for development to avoid API errors.
              The ZK verification flow and circuit loading are fully functional.
            </p>
          </div>
        </div>

        {!address && (
          <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
            ⚠️ Please connect your wallet to test ZK Email verification.
          </div>
        )}
      </div>
    </div>
      )}
    </div>
  );
}