"use client";

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useDataTracker, DataRecord } from '@/lib/hooks/useDataTracker';

interface PoolOwnerDashboardProps {
  poolAddress: string;
  poolOwnerAddress: string;
}

interface VerificationSubmission {
  id: string;
  submitterAddress: string;
  verificationType: string;
  emailFrom?: string;
  emailSubject?: string;
  timestamp: string;
  lighthouseCID: string;
  proofHash?: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  dataPreview: string;
  accessUrl: string;
  circuitId?: string;
}

/**
 * Pool Owner Dashboard to review verification submissions
 */
export default function PoolOwnerDashboard({
  poolAddress,
  poolOwnerAddress
}: PoolOwnerDashboardProps) {
  const { address } = useAccount();
  const { getRecordsByPool, updateRecord } = useDataTracker();

  const [submissions, setSubmissions] = useState<VerificationSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<VerificationSubmission | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('all');

  const isPoolOwner = address?.toLowerCase() === poolOwnerAddress.toLowerCase();

  // Load submissions from data tracker
  useEffect(() => {
    const poolRecords = getRecordsByPool(poolAddress);
    const verificationRecords = poolRecords.filter(record => record.type === 'verification');

    const formattedSubmissions: VerificationSubmission[] = verificationRecords.map(record => ({
      id: record.id,
      submitterAddress: record.userAddress,
      verificationType: record.metadata.verificationType || 'unknown',
      emailFrom: record.metadata.emailFrom,
      emailSubject: record.metadata.emailSubject,
      timestamp: record.timestamp,
      lighthouseCID: record.lighthouseCID,
      proofHash: record.proofHash,
      status: 'pending', // Default status
      dataPreview: record.dataPreview,
      accessUrl: `https://gateway.lighthouse.storage/ipfs/${record.lighthouseCID}`,
      circuitId: record.metadata.circuitId
    }));

    setSubmissions(formattedSubmissions);
  }, [poolAddress, getRecordsByPool]);

  const getFilteredSubmissions = () => {
    switch (filter) {
      case 'pending':
        return submissions.filter(s => s.status === 'pending');
      case 'reviewed':
        return submissions.filter(s => s.status !== 'pending');
      default:
        return submissions;
    }
  };

  const updateSubmissionStatus = (submissionId: string, status: VerificationSubmission['status']) => {
    setSubmissions(prev =>
      prev.map(sub =>
        sub.id === submissionId ? { ...sub, status } : sub
      )
    );

    // Update in data tracker
    updateRecord(submissionId, { status: status === 'approved' ? 'shared' : 'encrypted' });
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'registry':
        return '🎯';
      case 'hackerhouse':
        return '🏠';
      case 'netflix':
        return '📺';
      default:
        return '📧';
    }
  };

  if (!isPoolOwner) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">Only the pool owner can access this dashboard.</p>
          <div className="mt-4 text-sm text-gray-600">
            <p>Pool Owner: <span className="font-mono">{poolOwnerAddress}</span></p>
            <p>Your Address: <span className="font-mono">{address || 'Not connected'}</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">👑 Pool Owner Dashboard</h1>
            <p className="text-gray-600">Review verification submissions for your pool</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Pool Address</div>
            <div className="font-mono text-sm">{formatAddress(poolAddress)}</div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-800">{submissions.length}</div>
            <div className="text-sm text-blue-600">Total Submissions</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-800">
              {submissions.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-sm text-yellow-600">Pending Review</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-800">
              {submissions.filter(s => s.status === 'approved').length}
            </div>
            <div className="text-sm text-green-600">Approved</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-800">
              {submissions.filter(s => s.verificationType === 'registry').length}
            </div>
            <div className="text-sm text-purple-600">Registry Verifications</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex space-x-2 mb-4">
          {[
            { key: 'all', label: 'All Submissions' },
            { key: 'pending', label: 'Pending Review' },
            { key: 'reviewed', label: 'Reviewed' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-md text-sm ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {getFilteredSubmissions().length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📭</div>
              <div>No verification submissions found.</div>
              <div className="text-sm mt-2">Users will appear here after they complete verification.</div>
            </div>
          ) : (
            getFilteredSubmissions().map((submission) => (
              <div
                key={submission.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getTypeIcon(submission.verificationType)}</span>
                    <div>
                      <div className="font-semibold text-lg">
                        {submission.verificationType.charAt(0).toUpperCase() + submission.verificationType.slice(1)} Verification
                      </div>
                      <div className="text-sm text-gray-500">
                        Submitted by {formatAddress(submission.submitterAddress)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatTimestamp(submission.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </div>
                </div>

                {/* Email Details */}
                {submission.emailFrom && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium mb-2">📧 Email Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">From:</span>
                        <div className="font-mono">{submission.emailFrom}</div>
                      </div>
                      {submission.emailSubject && (
                        <div>
                          <span className="font-medium">Subject:</span>
                          <div>{submission.emailSubject}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Verification Data */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium mb-2">🔐 Verification Data</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Lighthouse CID:</span>
                      <div className="font-mono text-xs">{submission.lighthouseCID}</div>
                    </div>
                    {submission.proofHash && (
                      <div>
                        <span className="font-medium">Proof Hash:</span>
                        <div className="font-mono text-xs">{submission.proofHash}</div>
                      </div>
                    )}
                    {submission.circuitId && (
                      <div>
                        <span className="font-medium">Circuit ID:</span>
                        <div className="font-mono text-xs">{submission.circuitId}</div>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Access URL:</span>
                      <a
                        href={submission.accessUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs break-all"
                      >
                        {submission.accessUrl}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    📋 View Full Details
                  </button>

                  {submission.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateSubmissionStatus(submission.id, 'approved')}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => updateSubmissionStatus(submission.id, 'rejected')}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detailed Submission Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {getTypeIcon(selectedSubmission.verificationType)} Verification Details
                </h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Submitter Info */}
                <div>
                  <h4 className="font-semibold mb-2">👤 Submitter Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Address:</span>
                        <div className="font-mono text-sm">{selectedSubmission.submitterAddress}</div>
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>
                        <div className="text-sm">{formatTimestamp(selectedSubmission.timestamp)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Data */}
                {selectedSubmission.emailFrom && (
                  <div>
                    <h4 className="font-semibold mb-2">📧 Email Verification</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">From:</span> {selectedSubmission.emailFrom}
                        </div>
                        {selectedSubmission.emailSubject && (
                          <div>
                            <span className="font-medium">Subject:</span> {selectedSubmission.emailSubject}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Verification Type:</span> {selectedSubmission.verificationType}
                        </div>
                        {selectedSubmission.circuitId && (
                          <div>
                            <span className="font-medium">ZK Circuit ID:</span>
                            <div className="font-mono text-sm">{selectedSubmission.circuitId}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Technical Details */}
                <div>
                  <h4 className="font-semibold mb-2">🔐 Technical Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <span className="font-medium">Lighthouse CID:</span>
                      <div className="font-mono text-sm bg-white p-2 rounded border">
                        {selectedSubmission.lighthouseCID}
                      </div>
                    </div>
                    {selectedSubmission.proofHash && (
                      <div>
                        <span className="font-medium">Proof Hash:</span>
                        <div className="font-mono text-sm bg-white p-2 rounded border">
                          {selectedSubmission.proofHash}
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Access URL:</span>
                      <div className="text-sm">
                        <a
                          href={selectedSubmission.accessUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 break-all"
                        >
                          {selectedSubmission.accessUrl}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Preview */}
                <div>
                  <h4 className="font-semibold mb-2">📄 Data Preview</h4>
                  <div className="bg-gray-100 p-4 rounded-lg max-h-40 overflow-y-auto">
                    <pre className="text-xs">{selectedSubmission.dataPreview}</pre>
                  </div>
                </div>

                {/* Actions */}
                {selectedSubmission.status === 'pending' && (
                  <div className="flex justify-center space-x-4 pt-4 border-t">
                    <button
                      onClick={() => {
                        updateSubmissionStatus(selectedSubmission.id, 'approved');
                        setSelectedSubmission(null);
                      }}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      ✅ Approve Verification
                    </button>
                    <button
                      onClick={() => {
                        updateSubmissionStatus(selectedSubmission.id, 'rejected');
                        setSelectedSubmission(null);
                      }}
                      className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      ❌ Reject Verification
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}