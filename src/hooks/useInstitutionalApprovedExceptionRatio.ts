'use client';

import { useState, useEffect } from 'react';
import { fetchInstitutionalApprovedExceptionRatio } from '@/services/ApprovedExceptionRatioService';

import { ApprovedExceptionRatioData } from '@/services/ApprovedExceptionRatioService';

export function useInstitutionalApprovedExceptionRatio() {
  const [data, setData] = useState<ApprovedExceptionRatioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchInstitutionalApprovedExceptionRatio();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch institutional approved exception ratio');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    data,
    isLoading,
    error
  };
}
