'use client';

import { useState, useEffect } from 'react';
import { fetchProvincialGrowthTrajectory, GrowthTrajectoryData } from '@/services/GrowthTrajectoryService';

export function useProvincialGrowthTrajectory(provinceId: number) {
  const [data, setData] = useState<GrowthTrajectoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialGrowthTrajectory(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial growth trajectory');
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
