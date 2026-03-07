'use client';

import { useState, useEffect } from 'react';
import { fetchInstitutionalMonth1DefaultRate, InstitutionalAPIResponse } from '@/services/InstitutionalAPIService';

export function useInstitutionalMonth1DefaultRate() {
  const [data, setData] = useState<InstitutionalAPIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchInstitutionalMonth1DefaultRate();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch institutional month-1 default rate');
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
