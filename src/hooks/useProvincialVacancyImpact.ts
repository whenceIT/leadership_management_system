'use client';

import { useState, useEffect } from 'react';
import { fetchProvincialVacancyImpact, VacancyImpactData } from '@/services/VacancyImpactService';

export function useProvincialVacancyImpact(provinceId: number) {
  const [data, setData] = useState<VacancyImpactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialVacancyImpact(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial vacancy impact');
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
