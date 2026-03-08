'use client';

import { useState, useEffect } from 'react';
import { fetchProvincialApprovedExceptionRatio, ApprovedExceptionRatioData } from '@/services/ApprovedExceptionRatioService';

export function useProvincialApprovedExceptionRatio(provinceId: number) {
  const [data, setData] = useState<ApprovedExceptionRatioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialApprovedExceptionRatio(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial approved exception ratio');
      } finally {
        setIsLoading(false);
      }
    };

    if (provinceId > 0) {
      fetchData();
    }
  }, [provinceId]);

  return {
    data,
    isLoading,
    error
  };
}
