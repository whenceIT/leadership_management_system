'use client';

import { useState, useEffect } from 'react';
import { fetchProvincialProductRiskScore, ProductRiskScoreData } from '@/services/ProductRiskScoreService';

export function useProvincialProductRiskScore(provinceId: number) {
  const [data, setData] = useState<ProductRiskScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialProductRiskScore(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial product risk score');
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
