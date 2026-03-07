'use client';

import { useState, useEffect } from 'react';
import { fetchProvincialProductDiversification, ProductDiversificationData } from '@/services/ProductDiversificationService';

export function useProvincialProductDiversification(provinceId: number) {
  const [data, setData] = useState<ProductDiversificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialProductDiversification(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial product diversification');
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
