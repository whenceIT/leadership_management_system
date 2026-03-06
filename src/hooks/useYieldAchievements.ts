'use client';

import { useState, useEffect } from 'react';
import { fetchYieldAchievements, YieldAchievementsData } from '@/services/YieldAchievementsService';

export function useYieldAchievements(branchId: number) {
  const [data, setData] = useState<YieldAchievementsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchYieldAchievements(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch yield achievements');
      } finally {
        setIsLoading(false);
      }
    };

    if (branchId > 0) {
      fetchData();
    }
  }, [branchId]);

  return {
    data,
    isLoading,
    error
  };
}
