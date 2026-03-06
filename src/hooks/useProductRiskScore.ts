'use client';

import { useState, useEffect } from 'react';
import { fetchProductRiskScore, ProductRiskScoreData } from '@/services/ProductRiskScoreService';

export function useProductRiskScore(branchId: number) {
  const [data, setData] = useState<ProductRiskScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProductRiskScore(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product risk score');
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
