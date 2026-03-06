'use client';

import { useState, useEffect } from 'react';
import { fetchMonth3RecoveryAchievements, Month3RecoveryAchievementsData } from '@/services/Month3RecoveryAchievementsService';

export function useMonth3RecoveryAchievements(branchId: number) {
  const [data, setData] = useState<Month3RecoveryAchievementsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchMonth3RecoveryAchievements(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch month 3 recovery achievements');
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
