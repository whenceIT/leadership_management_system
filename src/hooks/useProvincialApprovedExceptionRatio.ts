'use client';

import { useState, useEffect } from 'react';
import { ApprovedExceptionRatioData } from '@/services/ApprovedExceptionRatioService';

export function useProvincialApprovedExceptionRatio(provinceId: number) {
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
          province_id: provinceId.toString(),
          offices_count: 5,
          period: '2024-07',
          approved_exception_ratio: '0.82',
          score: '92',
          average_score: 92,
          weight: '10',
          percentage_point: '1.2'
        };
        setData(mockData);
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
