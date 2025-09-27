"use client";

import { useState } from "react";
import VerificationModal from "./verification-modal";
import { Button } from "./ui/button";

interface ProofRequirement {
  name: string;
  description: string;
  proofType: number;
  isRequired: boolean;
}

export default function FlowDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Demo pool with age, nationality, and email verification requirements
  const demoProofRequirements: ProofRequirement[] = [
    {
      name: "Age Verification",
      description: "Prove you are 18 years or older",
      proofType: 0, // SELF_AGE_VERIFICATION
      isRequired: true
    },
    {
      name: "Nationality Verification",
      description: "Prove you are an Indian citizen",
      proofType: 1, // SELF_NATIONALITY
      isRequired: true
    },
    {
      name: "ZK-Verify Hackerhouse Acceptance",
      description: "Upload your ZK-Verify hackerhouse acceptance email",
      proofType: 2, // EMAIL_VERIFICATION
      isRequired: true
    }
  ];

  const demoPoolAddress = "0x1234567890123456789012345678901234567890";

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🚀 Complete DataFi Verification Flow Demo
        </h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            📋 Demo Flow Requirements:
          </h3>
          <ol className="text-blue-800 space-y-2 text-sm">
            <li>1. ✅ <strong>Age Verification</strong> - Self Protocol (18+ years)</li>
            <li>2. 🌍 <strong>Nationality Verification</strong> - Self Protocol (Indian citizen)</li>
            <li>3. 📧 <strong>ZK-Email Verification</strong> - ZK-Verify hackerhouse acceptance email</li>
          </ol>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-900 mb-3">
            🔄 What Happens After Verification:
          </h3>
          <ul className="text-green-800 space-y-1 text-sm">
            <li>• Email is extracted from .eml file</li>
            <li>• ZK-Email proof validates hackerhouse acceptance</li>
            <li>• Email is encrypted and stored in Lighthouse</li>
            <li>• Buyer gets access to encrypted data (CID)</li>
            <li>• Payment is automatically transferred to seller</li>
            <li>• Data is available for buyer to decrypt and view</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2">
            ⚠️ Setup Required:
          </h3>
          <ul className="text-yellow-800 space-y-1 text-sm">
            <li>• Add your Lighthouse API key to .env.local</li>
            <li>• Deploy updated contracts with new payment logic</li>
            <li>• Have a .eml file with "zk-verify" and "hackerhouse" keywords</li>
          </ul>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
        >
          🚀 Start Complete Verification Flow
        </Button>

        {/* Demo Verification Modal */}
        <VerificationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          poolAddress={demoPoolAddress}
          proofRequirements={demoProofRequirements}
        />
      </div>
    </div>
  );
}