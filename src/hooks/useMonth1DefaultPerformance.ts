'use client';

import { useState, useEffect } from 'react';
import { 
  fetchMonth1DefaultPerformance, 
  fetchProvincialMonth1DefaultPerformance, 
  Month1DefaultPerformanceData 
} from '@/services/Month1DefaultPerformanceService';

export function useMonth1DefaultPerformance(branchId: number) {
  const [data, setData] = useState<Month1DefaultPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchMonth1DefaultPerformance(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch month 1 default performance');
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

export function useProvincialMonth1DefaultPerformance(provinceId: number) {
  const [data, setData] = useState<Month1DefaultPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialMonth1DefaultPerformance(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial month 1 default performance');
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
