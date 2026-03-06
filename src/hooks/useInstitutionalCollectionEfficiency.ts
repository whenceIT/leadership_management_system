'use client';

import { useState, useEffect } from 'react';
import { fetchInstitutionalCollectionEfficiency, InstitutionalAPIResponse } from '@/services/InstitutionalAPIService';

export function useInstitutionalCollectionEfficiency() {
  const [data, setData] = useState<InstitutionalAPIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchInstitutionalCollectionEfficiency();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch institutional collection efficiency');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    data,
    isLoading,
    error
  };
}
