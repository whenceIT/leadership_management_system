'use client';

import { useState, useEffect } from 'react';
import { fetchCollectionEfficiency, CollectionEfficiencyData } from '@/services/CollectionEfficiencyService';

export function useCollectionEfficiency(branchId: number) {
  const [data, setData] = useState<CollectionEfficiencyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchCollectionEfficiency(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch collection efficiency');
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
