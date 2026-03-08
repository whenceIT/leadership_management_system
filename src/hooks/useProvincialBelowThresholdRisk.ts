'use client';

import { useState, useEffect } from 'react';
import { fetchProvincialBelowThresholdRisk, BelowThresholdRiskData } from '@/services/BelowThresholdRiskService';

export function useProvincialBelowThresholdRisk(provinceId: number) {
  const [data, setData] = useState<BelowThresholdRiskData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialBelowThresholdRisk(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial below threshold risk');
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
