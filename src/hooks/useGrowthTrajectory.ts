'use client';

import { useState, useEffect } from 'react';
import { fetchGrowthTrajectory, GrowthTrajectoryData } from '@/services/GrowthTrajectoryService';

export function useGrowthTrajectory(branchId: number) {
  const [data, setData] = useState<GrowthTrajectoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchGrowthTrajectory(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch growth trajectory');
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
