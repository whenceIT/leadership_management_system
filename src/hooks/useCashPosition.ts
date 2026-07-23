'use client';

import { useState, useEffect } from 'react';
import { fetchCashPosition, CashPositionData } from '@/services/CashPositionService';
import { useOffice } from '@/hooks/useOffice';

export function useCashPosition(branchId: number) {
  const { offices } = useOffice();
  const [data, setData] = useState<CashPositionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchCashPosition(branchId, offices);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cash position');
      } finally {
        setIsLoading(false);
      }
    };

    if (branchId > 0) {
      fetchData();
    }
  }, [branchId, offices]);

  return {
    data,
    isLoading,
    error
  };
}
