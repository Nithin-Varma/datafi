"use client";

import { useState, useEffect } from 'react';

export interface DataRecord {
  id: string;
  type: 'verification' | 'data_submission' | 'purchase';
  timestamp: string;
  userAddress: string;
  poolAddress: string;
  lighthouseCID: string;
  proofHash?: string;
  sharedWith: string[];
  dataPreview: string;
  status: 'encrypted' | 'shared' | 'purchased';
  metadata: {
    verificationType?: string;
    emailFrom?: string;
    emailSubject?: string;
    dataSize?: number;
    circuitId?: string;
  };
}

/**
 * Hook to track and display data storage and sharing activities
 */
export function useDataTracker() {
  const [dataRecords, setDataRecords] = useState<DataRecord[]>([]);

  // Load records from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('datafi_data_tracker');
    if (stored) {
      try {
        setDataRecords(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading data tracker:', error);
      }
    }
  }, []);

  // Save records to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('datafi_data_tracker', JSON.stringify(dataRecords));
  }, [dataRecords]);

  const addRecord = (record: Omit<DataRecord, 'id' | 'timestamp'>) => {
    const newRecord: DataRecord = {
      ...record,
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
    };

    setDataRecords(prev => [newRecord, ...prev]);

    // Log to console for debugging
    console.log("📊 Data Tracker - New Record Added:");
    console.log("  Type:", newRecord.type);
    console.log("  Lighthouse CID:", newRecord.lighthouseCID);
    console.log("  Shared with:", newRecord.sharedWith);
    console.log("  Data preview:", newRecord.dataPreview.substring(0, 100) + "...");
    console.log("  Full record:", newRecord);

    return newRecord;
  };

  const updateRecord = (id: string, updates: Partial<DataRecord>) => {
    setDataRecords(prev =>
      prev.map(record =>
        record.id === id
          ? { ...record, ...updates, timestamp: new Date().toISOString() }
          : record
      )
    );

    console.log("📊 Data Tracker - Record Updated:");
    console.log("  ID:", id);
    console.log("  Updates:", updates);
  };

  const getRecordsByType = (type: DataRecord['type']) => {
    return dataRecords.filter(record => record.type === type);
  };

  const getRecordsByPool = (poolAddress: string) => {
    return dataRecords.filter(record => record.poolAddress === poolAddress);
  };

  const getRecordsByUser = (userAddress: string) => {
    return dataRecords.filter(record => record.userAddress === userAddress);
  };

  const getSharedWithUser = (userAddress: string) => {
    return dataRecords.filter(record =>
      record.sharedWith.includes(userAddress.toLowerCase())
    );
  };

  const clearAllRecords = () => {
    setDataRecords([]);
    localStorage.removeItem('datafi_data_tracker');
    console.log("📊 Data Tracker - All records cleared");
  };

  const exportRecords = () => {
    const dataStr = JSON.stringify(dataRecords, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `datafi-records-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return {
    dataRecords,
    addRecord,
    updateRecord,
    getRecordsByType,
    getRecordsByPool,
    getRecordsByUser,
    getSharedWithUser,
    clearAllRecords,
    exportRecords,
    totalRecords: dataRecords.length,
    totalSharedFiles: dataRecords.filter(r => r.sharedWith.length > 0).length,
  };
}

export default useDataTracker;