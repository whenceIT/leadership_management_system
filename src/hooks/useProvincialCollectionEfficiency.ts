'use client';

import { useState, useEffect } from 'react';
import { fetchProvincialCollectionEfficiency, CollectionEfficiencyData } from '@/services/CollectionEfficiencyService';

export function useProvincialCollectionEfficiency(provinceId: number) {
  const [data, setData] = useState<CollectionEfficiencyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialCollectionEfficiency(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial collection efficiency');
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
