'use client';

import { useState, useEffect } from 'react';
import { fetchProvincialRollRateControl, RollRateControlData } from '@/services/RollRateControlService';

export function useProvincialRollRateControl(provinceId: number) {
  const [data, setData] = useState<RollRateControlData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialRollRateControl(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial roll rate control');
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
