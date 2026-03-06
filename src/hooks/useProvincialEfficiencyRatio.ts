'use client';

import { useState, useEffect } from 'react';
import { fetchProvincialEfficiencyRatio, EfficiencyRatioData } from '@/services/EfficiencyRatioService';

export function useProvincialEfficiencyRatio(provinceId: number) {
  const [data, setData] = useState<EfficiencyRatioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialEfficiencyRatio(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial efficiency ratio');
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
