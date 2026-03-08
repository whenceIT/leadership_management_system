'use client';

import { useState, useEffect } from 'react';
import { fetchBelowThresholdRisk, BelowThresholdRiskData } from '@/services/BelowThresholdRiskService';

export function useBelowThresholdRisk(branchId: number) {
  const [data, setData] = useState<BelowThresholdRiskData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchBelowThresholdRisk(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch below threshold risk');
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
