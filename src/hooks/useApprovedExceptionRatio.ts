'use client';

import { useState, useEffect } from 'react';
import { ApprovedExceptionRatioData } from '@/services/ApprovedExceptionRatioService';

export function useApprovedExceptionRatio(branchId: number) {
  const [data, setData] = useState<ApprovedExceptionRatioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Return mock data instead of calling API
        const mockData: ApprovedExceptionRatioData = {
          office_id: branchId.toString(),
          period: '2024-07',
          approved_exception_ratio: '0.85',
          score: '95',
          average_score: 95,
          weight: '10',
          percentage_point: '1.5'
        };
        setData(mockData);
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
