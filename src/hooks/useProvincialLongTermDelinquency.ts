'use client';

import { useState, useEffect } from 'react';
import { fetchProvincialLongTermDelinquency, LongTermDelinquencyData } from '@/services/LongTermDelinquencyService';

export function useProvincialLongTermDelinquency(provinceId: number) {
  const [data, setData] = useState<LongTermDelinquencyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialLongTermDelinquency(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial long term delinquency');
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
