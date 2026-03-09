'use client';

import { useState, useEffect } from 'react';
import { fetchInstitutionalCashPosition, CashPositionData } from '@/services/CashPositionService';

export function useInstitutionalCashPosition() {
  const [data, setData] = useState<CashPositionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchInstitutionalCashPosition();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch institutional cash position');
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
