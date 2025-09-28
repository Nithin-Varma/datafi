"use client";

import React from 'react';
import CIDDataAccess from '@/components/CIDDataAccess';

/**
 * Page to check access and redeem data from your specific CID
 */
export default function CIDAccessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-6 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🔐 Lighthouse CID Access Portal
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Check who has access to your verification data and redeem encrypted content from Lighthouse.
            </p>
          </div>
        </div>

        {/* Main Component with your specific CID */}
        <CIDDataAccess
          cid="Qmw8n38u0cbvipl95yudylf"
          initialProofHash="0x7b2266726f6d223a2261726d616e407a6b7665726966792e696f222c22737562"
        />

        {/* Information Section */}
        <div className="max-w-4xl mx-auto px-6 mt-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">ℹ️ Your Verification Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-800">📊 Transaction Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div><span className="font-medium">Status:</span> ✅ Verification Complete</div>
                  <div><span className="font-medium">Proof Hash:</span> <span className="font-mono text-xs">0x7b2266726f6d223a2261726d616e407a6b7665726966792e696f222c22737562</span></div>
                  <div><span className="font-medium">Lighthouse CID:</span> <span className="font-mono">Qmw8n38u0cbvipl95yudylf</span></div>
                  <div><span className="font-medium">Smart Contract TX:</span> ✅ Completed</div>
                  <div><span className="font-medium">ETH Tip TX:</span> ✅ Completed</div>
                  <div><span className="font-medium">Timestamp:</span> 9/28/2025, 11:50:58 AM</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-800">🔐 Data Access Rights</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div><span className="font-medium">Owner:</span> You (verification submitter)</div>
                  <div><span className="font-medium">Pool Owner:</span> Has review access</div>
                  <div><span className="font-medium">Encryption:</span> Lighthouse textUploadEncrypted</div>
                  <div><span className="font-medium">Circuit:</span> Registry 2a750584...</div>
                  <div><span className="font-medium">Sharing:</span> Automatic with pool owner</div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">🎯 What This Means:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Your data is encrypted</strong> and stored securely on Lighthouse</li>
                <li>• <strong>Only you and the pool owner</strong> can access this verification data</li>
                <li>• <strong>Pool owner can review</strong> your email verification for approval</li>
                <li>• <strong>Proof hash is on blockchain</strong> for permanent verification</li>
                <li>• <strong>CID provides direct access</strong> to your encrypted content</li>
              </ul>
            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">🔗 Access URLs for Your Data:</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Lighthouse Gateway:</span>
                  <div className="font-mono text-xs">
                    <a
                      href="https://gateway.lighthouse.storage/ipfs/Qmw8n38u0cbvipl95yudylf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      https://gateway.lighthouse.storage/ ipfs/Qmw8n38u0cbvipl95yudylf
                    </a>
                  </div>
                </div>
                <div>
                  <span className="font-medium">IPFS Gateway:</span>
                  <div className="font-mono text-xs">
                    <a
                      href="https://ipfs.io/ipfs/Qmw8n38u0cbvipl95yudylf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      https://ipfs.io/ipfs/Qmw8n38u0cbvipl95yudylf
                    </a>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Note: You'll need proper authentication to decrypt the content at these URLs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}