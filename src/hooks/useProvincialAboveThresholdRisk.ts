'use client';

import { useState, useEffect } from 'react';
import { fetchProvincialAboveThresholdRisk, AboveThresholdRiskData } from '@/services/AboveThresholdRiskService';

export function useProvincialAboveThresholdRisk(provinceId: number) {
  const [data, setData] = useState<AboveThresholdRiskData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialAboveThresholdRisk(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial above threshold risk');
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
