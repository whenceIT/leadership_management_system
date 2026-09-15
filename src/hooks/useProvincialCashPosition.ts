'use client';

import { useState, useEffect } from 'react';
import { fetchCashHealthProvince, CashHealthProvinceData } from '@/services/CashPositionService';
import { useOffice } from '@/hooks/useOffice';

export function useProvincialCashPosition(provinceId: number) {
  const { offices } = useOffice();
  const [data, setData] = useState<CashHealthProvinceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchCashHealthProvince(provinceId);
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
