"use client";

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useDataTracker, DataRecord } from '@/lib/hooks/useDataTracker';

interface DataTrackerProps {
  poolAddress?: string;
}

/**
 * Component to display and track all data storage and sharing activities
 */
export default function DataTracker({ poolAddress }: DataTrackerProps) {
  const { address } = useAccount();
  const {
    dataRecords,
    getRecordsByPool,
    getRecordsByUser,
    getSharedWithUser,
    clearAllRecords,
    exportRecords,
    totalRecords,
    totalSharedFiles,
  } = useDataTracker();

  const [filter, setFilter] = useState<'all' | 'mine' | 'shared' | 'pool'>('all');
  const [selectedRecord, setSelectedRecord] = useState<DataRecord | null>(null);

  // Filter records based on current filter
  const getFilteredRecords = () => {
    switch (filter) {
      case 'mine':
        return address ? getRecordsByUser(address) : [];
      case 'shared':
        return address ? getSharedWithUser(address) : [];
      case 'pool':
        return poolAddress ? getRecordsByPool(poolAddress) : [];
      default:
        return dataRecords;
    }
  };

  const filteredRecords = getFilteredRecords();

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const getTypeIcon = (type: DataRecord['type']) => {
    switch (type) {
      case 'verification':
        return '📧';
      case 'data_submission':
        return '📤';
      case 'purchase':
        return '💰';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status: DataRecord['status']) => {
    switch (status) {
      case 'encrypted':
        return 'bg-blue-100 text-blue-800';
      case 'shared':
        return 'bg-green-100 text-green-800';
      case 'purchased':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">📊 Data Storage & Sharing Tracker</h2>
          <div className="flex space-x-2">
            <button
              onClick={exportRecords}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Export Records
            </button>
            <button
              onClick={clearAllRecords}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-800">{totalRecords}</div>
            <div className="text-sm text-blue-600">Total Records</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-800">{totalSharedFiles}</div>
            <div className="text-sm text-green-600">Shared Files</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-800">
              {dataRecords.filter(r => r.type === 'verification').length}
            </div>
            <div className="text-sm text-purple-600">Verifications</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-800">
              {dataRecords.filter(r => r.type === 'purchase').length}
            </div>
            <div className="text-sm text-orange-600">Purchases</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All Records' },
            { key: 'mine', label: 'My Data' },
            { key: 'shared', label: 'Shared with Me' },
            { key: 'pool', label: 'This Pool' },
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
              {label} ({key === 'all' ? dataRecords.length :
                       key === 'mine' ? (address ? getRecordsByUser(address).length : 0) :
                       key === 'shared' ? (address ? getSharedWithUser(address).length : 0) :
                       key === 'pool' ? (poolAddress ? getRecordsByPool(poolAddress).length : 0) : 0})
            </button>
          ))}
        </div>

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📭</div>
              <div>No records found for the selected filter.</div>
              <div className="text-sm mt-2">Try performing some verification or data submission actions.</div>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedRecord(record)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTypeIcon(record.type)}</span>
                    <div>
                      <div className="font-semibold capitalize">
                        {record.type.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTimestamp(record.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                    <div className="text-right text-sm">
                      <div className="font-mono text-xs text-gray-600">
                        {record.lighthouseCID.substring(0, 20)}...
                      </div>
                      <div className="text-xs text-gray-500">
                        Shared with {record.sharedWith.length} users
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">User:</span><br />
                    <span className="font-mono text-xs">{formatAddress(record.userAddress)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Pool:</span><br />
                    <span className="font-mono text-xs">{formatAddress(record.poolAddress)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Data Preview:</span><br />
                    <span className="text-gray-600">{record.dataPreview.substring(0, 50)}...</span>
                  </div>
                </div>

                {record.metadata.emailFrom && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Email:</span> {record.metadata.emailFrom}
                    {record.metadata.emailSubject && (
                      <span className="text-gray-600"> - {record.metadata.emailSubject}</span>
                    )}
                  </div>
                )}

                {record.sharedWith.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-medium mb-1">Shared with:</div>
                    <div className="flex flex-wrap gap-1">
                      {record.sharedWith.map((addr, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 rounded text-xs font-mono"
                        >
                          {formatAddress(addr)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detailed Record Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {getTypeIcon(selectedRecord.type)} Record Details
                </h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium">Type:</label>
                    <div className="capitalize">{selectedRecord.type.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <label className="font-medium">Status:</label>
                    <div className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(selectedRecord.status)}`}>
                      {selectedRecord.status}
                    </div>
                  </div>
                  <div>
                    <label className="font-medium">Timestamp:</label>
                    <div>{formatTimestamp(selectedRecord.timestamp)}</div>
                  </div>
                  <div>
                    <label className="font-medium">Data Size:</label>
                    <div>{selectedRecord.metadata.dataSize || 'Unknown'} bytes</div>
                  </div>
                </div>

                <div>
                  <label className="font-medium">Lighthouse CID:</label>
                  <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                    {selectedRecord.lighthouseCID}
                  </div>

                  {/* Storage Locations */}
                  <div className="mt-3">
                    <span className="font-medium text-sm">🌐 Storage Locations:</span>
                    <div className="mt-2 space-y-2">
                      <div className="p-2 bg-blue-50 rounded border">
                        <div className="text-xs font-medium text-blue-800">Lighthouse Gateway</div>
                        <a
                          href={`https://gateway.lighthouse.storage/ipfs/${selectedRecord.lighthouseCID}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs font-mono break-all"
                        >
                          🔗 https://gateway.lighthouse.storage/ipfs/{selectedRecord.lighthouseCID}
                        </a>
                      </div>
                      <div className="p-2 bg-gray-50 rounded border">
                        <div className="text-xs font-medium text-gray-800">IPFS Public Gateway</div>
                        <a
                          href={`https://ipfs.io/ipfs/${selectedRecord.lighthouseCID}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs font-mono break-all"
                        >
                          🔗 https://ipfs.io/ipfs/{selectedRecord.lighthouseCID}
                        </a>
                      </div>
                      <div className="p-2 bg-orange-50 rounded border">
                        <div className="text-xs font-medium text-orange-800">Cloudflare IPFS</div>
                        <a
                          href={`https://cloudflare-ipfs.com/ipfs/${selectedRecord.lighthouseCID}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs font-mono break-all"
                        >
                          🔗 https://cloudflare-ipfs.com/ipfs/{selectedRecord.lighthouseCID}
                        </a>
                      </div>
                      <div className="p-2 bg-purple-50 rounded border">
                        <div className="text-xs font-medium text-purple-800">Pinata Gateway</div>
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${selectedRecord.lighthouseCID}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs font-mono break-all"
                        >
                          🔗 https://gateway.pinata.cloud/ipfs/{selectedRecord.lighthouseCID}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div>
                  <label className="font-medium">👑 Ownership & Control:</label>
                  <div className="mt-2 p-3 bg-green-50 rounded border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium">Owner:</span>
                        <div className="font-mono text-xs">{selectedRecord.userAddress}</div>
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>
                        <div className="text-xs">{formatTimestamp(selectedRecord.timestamp)}</div>
                      </div>
                      <div>
                        <span className="font-medium">Controlled By:</span>
                        <div className="text-xs">Lighthouse Access Control</div>
                      </div>
                      <div>
                        <span className="font-medium">Encryption:</span>
                        <div className="text-xs">Wallet signature based</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-medium">User Address:</label>
                  <div className="font-mono text-sm">{selectedRecord.userAddress}</div>
                </div>

                <div>
                  <label className="font-medium">Pool Address:</label>
                  <div className="font-mono text-sm">{selectedRecord.poolAddress}</div>
                </div>

                {selectedRecord.proofHash && (
                  <div>
                    <label className="font-medium">Proof Hash:</label>
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {selectedRecord.proofHash}
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-medium">Data Preview:</label>
                  <div className="bg-gray-100 p-3 rounded text-sm max-h-40 overflow-y-auto">
                    {selectedRecord.dataPreview}
                  </div>
                </div>

                {selectedRecord.sharedWith.length > 0 && (
                  <div>
                    <label className="font-medium">Shared With ({selectedRecord.sharedWith.length}):</label>
                    <div className="space-y-1 mt-1">
                      {selectedRecord.sharedWith.map((addr, index) => (
                        <div key={index} className="font-mono text-sm bg-gray-100 p-2 rounded">
                          {addr}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-medium">Metadata:</label>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedRecord.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}