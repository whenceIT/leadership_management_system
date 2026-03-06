'use client';

import { useState, useEffect } from 'react';
import { fetchProvincialYieldAchievements, YieldAchievementsData } from '@/services/YieldAchievementsService';

export function useProvincialYieldAchievements(provinceId: number) {
  const [data, setData] = useState<YieldAchievementsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialYieldAchievements(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial yield achievements');
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
