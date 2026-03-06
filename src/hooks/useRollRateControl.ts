'use client';

import { useState, useEffect } from 'react';
import { fetchRollRateControl, RollRateControlData } from '@/services/RollRateControlService';

export function useRollRateControl(branchId: number) {
  const [data, setData] = useState<RollRateControlData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchRollRateControl(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch roll rate control');
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
