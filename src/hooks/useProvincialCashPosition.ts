'use client';

import { useState, useEffect } from 'react';
import { fetchProvincialCashPosition, CashPositionData } from '@/services/CashPositionService';
import { useOffice } from '@/hooks/useOffice';

export function useProvincialCashPosition(provinceId: number) {
  const { offices } = useOffice();
  const [data, setData] = useState<CashPositionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialCashPosition(provinceId, offices);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial cash position');
      } finally {
        setIsLoading(false);
      }
    };

    if (provinceId > 0 && offices.length > 0) {
      fetchData();
    }
  }, [provinceId, offices]);

  return {
    data,
    isLoading,
    error
  };
}
