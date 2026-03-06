'use client';

import { useState, useEffect } from 'react';
import { fetchProductDiversification, ProductDiversificationData } from '@/services/ProductDiversificationService';

export function useProductDiversification(branchId: number) {
  const [data, setData] = useState<ProductDiversificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProductDiversification(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product diversification');
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
