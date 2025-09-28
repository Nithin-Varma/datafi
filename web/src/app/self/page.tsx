"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
  countries,
  getUniversalLink,
} from "@selfxyz/qrcode";
import { useAccount } from "wagmi";



export default function Home() {
  const router = useRouter();
  const [linkCopied, setLinkCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'mobile_connected' | 'verifying' | 'verified'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  // Use useMemo to cache the array to avoid creating a new array on each render
  const excludedCountries = useMemo(() => [countries.UNITED_STATES], []);

  // Listen for WebSocket events by intercepting console logs
  useEffect(() => {
    const originalLog = console.log;

    console.log = function(...args) {
      // Check for WebSocket status messages
      const message = args.join(' ');

      if (message.includes('[WebSocket] Mobile device connected')) {
        setVerificationStatus('mobile_connected');
        setIsLoading(true);
        displayToast("📱 Mobile device connected!");
        // Start verification process
        setTimeout(() => {
          setVerificationStatus('verifying');
          displayToast("🔍 Verifying your identity...");
        }, 1000);
      } else if (message.includes('[WebSocket] Received mobile status: proof_verified')) {
        setIsLoading(false);
        setVerificationStatus('verified');
        displayToast("✅ Verification successful!");
      }

      // Call original console.log
      originalLog.apply(console, args);
    };

    return () => {
      // Restore original console.log
      console.log = originalLog;
    };
  }, []);

  // Use useEffect to ensure code only executes on the client side
  useEffect(() => {
    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "DataFi",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "datafi_ScopeSeed",
        endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT,
        logoBase64:
          "https://i.postimg.cc/mrmVf9hm/self.png", // url of a png image, base64 is accepted but not recommended
        userId: address as string,
        chainID: 42220,
        endpointType: "staging_celo",
        userIdType: "hex", // use 'hex' for ethereum address or 'uuid' for uuidv4
        userDefinedData: "Your are about to verify your identity with DataFi, dont worry you are in safe hands.",
        disclosures: {
        // what you want to verify from users' identity
          minimumAge: 18,
          // ofac: true,
          excludedCountries: excludedCountries,
          // what you want users to reveal
        //   name: false,
          issuing_state: true,
          nationality: true,
          date_of_birth: true,
          // passport_number: false,
          // gender: true,
          // expiry_date: false,
        }
      }).build();

      console.log("App:", app);

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
      console.log("Universal link:", getUniversalLink(app));
      console.log("Self app:", app);
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
    }
  }, [excludedCountries, address as string]);

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const copyToClipboard = () => {
    if (!universalLink) return;

    navigator.clipboard
      .writeText(universalLink)
      .then(() => {
        setLinkCopied(true);
        displayToast("Universal link copied to clipboard!");
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        displayToast("Failed to copy link");
      });
  };

  const openSelfApp = () => {
    if (!universalLink) return;

    window.open(universalLink, "_blank");
    displayToast("Opening Self App...");
  };

  const handleMobileConnected = () => {
    setVerificationStatus('mobile_connected');
    setIsLoading(true);
    displayToast("📱 Mobile device connected!");
    // Start verification process
    setTimeout(() => {
      setVerificationStatus('verifying');
      displayToast("🔍 Verifying your identity...");
    }, 1000);
  };

  const handleVerifying = () => {
    setVerificationStatus('verifying');
    setIsLoading(true);
    displayToast("🔍 Verifying your identity...");
  };

  const handleSuccessfulVerification = async () => {
    setIsLoading(false);
    setVerificationStatus('verified');
    displayToast("✅ Verification successful!");

    try {
      // Get Self verification data (you'll need to extract this from the verification process)
      const selfVerificationData = {
        userId: address,
        sessionId: Date.now().toString(),
        disclosures: {
          minimumAge: 18,
          nationality: true,
          date_of_birth: true,
          issuing_state: true
        },
        timestamp: new Date().toISOString(),
        type: 'self_verification'
      };

      displayToast("💾 Saving Self verification data locally...");

      // Store the verification result in localStorage for later use (don't encrypt yet)
      const result = {
        success: true,
        type: 'self_verification',
        data: selfVerificationData,
        proofHash: '0x' + Buffer.from(JSON.stringify(selfVerificationData)).toString('hex').substring(0, 64),
        completedAt: new Date().toISOString()
      };

      localStorage.setItem('selfVerificationResult', JSON.stringify(result));

      displayToast("✅ Self verification completed! Continue with next verification step.");

      // Check for redirect URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');
      const targetUrl = redirectUrl ? decodeURIComponent(redirectUrl) : "/dashboard";

      setTimeout(() => {
        router.push(targetUrl);
      }, 1500);

    } catch (error) {
      console.error("Verification processing error:", error);
      displayToast("❌ Error processing verification");

      // Still redirect after a delay
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');
      const targetUrl = redirectUrl ? decodeURIComponent(redirectUrl) : "/dashboard";

      setTimeout(() => {
        router.push(targetUrl);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative">
      {/* Loading Overlay with Blur */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-2xl text-center max-w-sm mx-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {verificationStatus === 'mobile_connected' ? 'Processing Connection...' : 'Verifying Identity...'}
            </h3>
            <p className="text-gray-600">
              {verificationStatus === 'mobile_connected'
                ? 'Setting up secure connection with your mobile device'
                : 'Please wait while we verify your identity using Self Protocol'}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`w-full ${isLoading ? 'pointer-events-none' : ''}`}>
        {/* Header */}
        <div className="mb-6 md:mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
          {process.env.NEXT_PUBLIC_SELF_APP_NAME || "Self Workshop"}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 px-2">
          Scan QR code with Self Protocol App to verify your identity
        </p>
        {verificationStatus !== 'idle' && (
          <div className="mt-2 text-sm">
            {verificationStatus === 'mobile_connected' && (
              <span className="text-blue-600">📱 Mobile connected</span>
            )}
            {verificationStatus === 'verifying' && (
              <span className="text-yellow-600">🔍 Verifying...</span>
            )}
            {verificationStatus === 'verified' && (
              <span className="text-green-600">✅ Verified!</span>
            )}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
        <div className="flex justify-center mb-4 sm:mb-6">
          {selfApp ? (
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={handleSuccessfulVerification}
              onError={() => {
                displayToast("Error: Failed to verify identity");
              }}
            />
          ) : (
            <div className="w-[256px] h-[256px] bg-gray-200 animate-pulse flex items-center justify-center">
              <p className="text-gray-500 text-sm">Loading QR Code...</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mb-4 sm:mb-6">
          <button
            type="button"
            onClick={copyToClipboard}
            disabled={!universalLink}
            className="flex-1 bg-gray-800 hover:bg-gray-700 transition-colors text-white p-2 rounded-md text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {linkCopied ? "Copied!" : "Copy Universal Link"}
          </button>

          <button
            type="button"
            onClick={openSelfApp}
            disabled={!universalLink}
            className="flex-1 bg-blue-600 hover:bg-blue-500 transition-colors text-white p-2 rounded-md text-sm sm:text-base mt-2 sm:mt-0 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            Open Self App
          </button>


        </div>
        <div className="flex flex-col items-center gap-2 mt-2">
          <span className="text-gray-500 text-xs uppercase tracking-wide">User Address</span>
          <div className="bg-gray-100 rounded-md px-3 py-2 w-full text-center break-all text-sm font-mono text-gray-800 border border-gray-200">
            {address ? address : <span className="text-gray-400">Not connected</span>}
          </div>
        </div>

        {/* Toast notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white py-2 px-4 rounded shadow-lg animate-fade-in text-sm">
            {toastMessage}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
