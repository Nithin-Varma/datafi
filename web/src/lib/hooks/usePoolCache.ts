"use client";

import { useState, useEffect } from "react";
import { useAllPools } from "./usePools";

// Cache for pool data to avoid repeated contract calls
const poolCache = new Map<string, any>();
const CACHE_DURATION = 30000; // 30 seconds

interface CachedPoolData {
  data: any;
  timestamp: number;
}

export function usePoolCache() {
  const { allPools, isLoading: poolsLoading } = useAllPools();
  const [cachedPools, setCachedPools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (allPools && allPools.length > 0) {
      // Check cache first
      const now = Date.now();
      const validCachedPools: any[] = [];
      
      for (const poolAddress of allPools) {
        const cached = poolCache.get(poolAddress);
        if (cached && (now - cached.timestamp) < CACHE_DURATION) {
          validCachedPools.push(cached.data);
        }
      }

      if (validCachedPools.length === allPools.length) {
        // All pools are cached and valid
        setCachedPools(validCachedPools);
        setIsLoading(false);
      } else {
        // Some pools need to be fetched
        setCachedPools([]);
        setIsLoading(true);
      }
    }
  }, [allPools]);

  const updatePoolCache = (poolAddress: string, data: any) => {
    poolCache.set(poolAddress, {
      data,
      timestamp: Date.now(),
    });
  };

  const getCachedPool = (poolAddress: string) => {
    const cached = poolCache.get(poolAddress);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  };

  const clearCache = () => {
    poolCache.clear();
  };

  return {
    cachedPools,
    isLoading: isLoading || poolsLoading,
    updatePoolCache,
    getCachedPool,
    clearCache,
  };
}
