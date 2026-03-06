'use client';

import { useState, useEffect } from 'react';
import { fetchEfficiencyRatio, EfficiencyRatioData } from '@/services/EfficiencyRatioService';

export function useEfficiencyRatio(branchId: number) {
  const [data, setData] = useState<EfficiencyRatioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchEfficiencyRatio(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch efficiency ratio');
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
