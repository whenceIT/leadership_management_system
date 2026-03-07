'use client';

import { useState, useEffect } from 'react';
import { fetchProvincialRevenueAchievements, RevenueAchievementsData } from '@/services/RevenueAchievementsService';

export function useProvincialRevenueAchievements(provinceId: number) {
  const [data, setData] = useState<RevenueAchievementsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialRevenueAchievements(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial revenue achievements');
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
