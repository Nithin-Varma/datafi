"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export default function ZKEmailVerification() {
  const router = useRouter();
  const { address } = useAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'processing' | 'verified' | 'failed'>('idle');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [emailPreview, setEmailPreview] = useState<any>(null);

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.name.endsWith('.eml') || file.type === 'message/rfc822') {
      setFile(file);
      previewEmail(file);
    } else {
      displayToast("❌ Please upload a valid .eml file");
    }
  };

  const previewEmail = async (file: File) => {
    try {
      const content = await file.text();
      const lines = content.split('\n');
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
        } else if (line.trim() === '') {
          break; // End of headers
        }
      }

      setEmailPreview({ from, to, subject, date });
    } catch (error) {
      console.error("Error previewing email:", error);
      displayToast("❌ Error reading email file");
    }
  };

  const processVerification = async () => {
    if (!file || !address) {
      displayToast("❌ Please connect wallet and upload email file");
      return;
    }

    setIsProcessing(true);
    setVerificationStatus('processing');
    displayToast("🔍 Processing ZK Email verification...");

    try {
      const emlContent = await file.text();

      // Import the verification service
      const { verificationService } = await import('@/lib/verification-service');

      // Process ZK Email verification with Lighthouse encryption
      const result = await verificationService.processZKEmailVerification(
        process.env.NEXT_PUBLIC_POOL_ADDRESS || "0x1234567890123456789012345678901234567890",
        address,
        emlContent
      );

      if (result.success) {
        setVerificationStatus('verified');
        displayToast("🎉 ZK Email verification successful!");

        console.log("Encrypted CID:", result.encryptedCID);
        console.log("Proof Hash:", result.proofHash);

        // Store the verification result
        localStorage.setItem('zkEmailVerificationResult', JSON.stringify(result));

        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setVerificationStatus('failed');
        displayToast("❌ Verification failed: " + result.error);
      }

    } catch (error) {
      console.error("ZK Email verification error:", error);
      setVerificationStatus('failed');
      displayToast("❌ Verification failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setEmailPreview(null);
    setVerificationStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
          ZK Email Verification
        </h1>
        <p className="text-sm sm:text-base text-gray-600 px-2">
          Upload your hackerhouse invitation email (.eml file) for verification
        </p>
        {verificationStatus !== 'idle' && (
          <div className="mt-2 text-sm">
            {verificationStatus === 'processing' && (
              <span className="text-blue-600">🔍 Processing...</span>
            )}
            {verificationStatus === 'verified' && (
              <span className="text-green-600">✅ Verified!</span>
            )}
            {verificationStatus === 'failed' && (
              <span className="text-red-600">❌ Failed</span>
            )}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-2xl mx-auto">

        {/* File Upload Area */}
        {!file && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="text-6xl">📧</div>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Drop your .eml file here
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse files
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-md transition-colors"
              >
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".eml"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Email Preview */}
        {file && emailPreview && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-3 text-gray-800">Email Preview</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">From:</span>
                  <span className="ml-2 text-gray-800">{emailPreview.from}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">To:</span>
                  <span className="ml-2 text-gray-800">{emailPreview.to}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Subject:</span>
                  <span className="ml-2 text-gray-800">{emailPreview.subject}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Date:</span>
                  <span className="ml-2 text-gray-800">{emailPreview.date}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={processVerification}
                disabled={isProcessing || !address}
                className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-400 text-white py-3 rounded-md transition-colors font-medium"
              >
                {isProcessing ? "Processing..." : "Verify Email"}
              </button>
              <button
                onClick={resetUpload}
                disabled={isProcessing}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-md transition-colors"
              >
                Reset
              </button>
            </div>

            {!address && (
              <p className="text-red-600 text-sm text-center">
                Please connect your wallet to proceed
              </p>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">How to get your .eml file:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Open your email client (Gmail, Outlook, etc.)</li>
            <li>Find your hackerhouse invitation email</li>
            <li>Download/save the email as .eml format</li>
            <li>Upload the .eml file here for verification</li>
          </ol>
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white py-2 px-4 rounded shadow-lg animate-fade-in text-sm">
          {toastMessage}
        </div>
      )}
    </div>
  );
}