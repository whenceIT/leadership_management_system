'use client';

import { useState, useEffect } from 'react';
import { fetchAboveThresholdRisk, AboveThresholdRiskData } from '@/services/AboveThresholdRiskService';

export function useAboveThresholdRisk(branchId: number) {
  const [data, setData] = useState<AboveThresholdRiskData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchAboveThresholdRisk(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch above threshold risk');
      } finally {
        setIsLoading(false);
      }
    };

    if (branchId > 0) {
      fetchData();
    }
  }, [branchId]);

  return {
    data,
    isLoading,
    error
  };
}
