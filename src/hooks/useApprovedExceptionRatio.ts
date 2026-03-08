'use client';

import { useState, useEffect } from 'react';
import { fetchApprovedExceptionRatio, ApprovedExceptionRatioData } from '@/services/ApprovedExceptionRatioService';

export function useApprovedExceptionRatio(branchId: number) {
  const [data, setData] = useState<ApprovedExceptionRatioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchApprovedExceptionRatio(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch approved exception ratio');
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
