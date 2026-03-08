'use client';

import { useState, useEffect } from 'react';
import { fetchProvincialCashPosition, CashPositionData } from '@/services/CashPositionService';

export function useProvincialCashPosition(provinceId: number) {
  const [data, setData] = useState<CashPositionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialCashPosition(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial cash position');
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
