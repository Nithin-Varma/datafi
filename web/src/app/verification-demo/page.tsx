"use client";

import React from 'react';
import EnhancedVerification from '@/components/EnhancedVerification';

/**
 * Demo page showing the complete verification flow with pool owner dashboard
 */
export default function VerificationDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-6 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎯 DataFi Verification Demo
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Complete ZK Email verification with automatic Lighthouse encryption and pool owner dashboard redirect.
            </p>
          </div>
        </div>

        {/* Main Component */}
        <EnhancedVerification
          poolAddress="0x5c97e0e7085c3fEA96Cfdf0F8FB545A641fdD067"
          poolOwnerAddress="0xAbE4ea6b679aE6e56B1cF5d7Efcc3f4be5fE0816"
        />

        {/* Features Overview */}
        <div className="max-w-4xl mx-auto px-6 mt-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">🚀 Demo Features</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-800">📧 ZK Email Verification</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✅ Registry circuit integration (2a750584...)</li>
                  <li>✅ Automatic email parsing and validation</li>
                  <li>✅ ZK proof generation and verification</li>
                  <li>✅ Lighthouse encryption and storage</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-800">👑 Pool Owner Dashboard</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✅ Automatic redirect after verification</li>
                  <li>✅ View all verification submissions</li>
                  <li>✅ Approve/reject verifications</li>
                  <li>✅ Access encrypted email data</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-800">🔐 Data Security</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✅ Lighthouse encrypted storage</li>
                  <li>✅ Access control for pool owners</li>
                  <li>✅ Wallet signature authentication</li>
                  <li>✅ Complete audit trail</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-orange-800">📊 Tracking & Analytics</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✅ Real-time verification tracking</li>
                  <li>✅ Detailed console logging</li>
                  <li>✅ Data access visibility</li>
                  <li>✅ Export capabilities</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">🎯 How the Demo Works:</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li><strong>1. Submit Verification:</strong> Upload .eml file and verify with ZK circuit</li>
                <li><strong>2. Lighthouse Storage:</strong> Data encrypted and stored automatically</li>
                <li><strong>3. Pool Owner Access:</strong> Verification shared with pool owner</li>
                <li><strong>4. Dashboard Redirect:</strong> Automatic redirect to pool dashboard</li>
                <li><strong>5. Review & Approve:</strong> Pool owner can review and approve submissions</li>
              </ol>
            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">✨ What You'll See:</h4>
              <div className="text-sm text-green-700 space-y-1">
                <div>• <strong>Detailed Console Logs:</strong> Every step of the verification process</div>
                <div>• <strong>Lighthouse CIDs:</strong> Unique identifiers for your encrypted data</div>
                <div>• <strong>Access Control:</strong> Who can view your verification data</div>
                <div>• <strong>Pool Dashboard:</strong> Professional interface for pool owners</div>
                <div>• <strong>Email Details:</strong> From/Subject extracted from your .eml file</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}