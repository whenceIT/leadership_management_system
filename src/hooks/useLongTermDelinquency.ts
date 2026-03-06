'use client';

import { useState, useEffect } from 'react';
import { fetchLongTermDelinquency, LongTermDelinquencyData } from '@/services/LongTermDelinquencyService';

export function useLongTermDelinquency(branchId: number) {
  const [data, setData] = useState<LongTermDelinquencyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchLongTermDelinquency(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch long term delinquency');
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
