'use client';

import { useState, useEffect } from 'react';
import { 
  fetchVolumeAchievement, 
  fetchProvincialVolumeAchievement, 
  VolumeAchievementData 
} from '@/services/VolumeAchievementService';

export function useVolumeAchievement(branchId: number) {
  const [data, setData] = useState<VolumeAchievementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchVolumeAchievement(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch volume achievement');
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

export function useProvincialVolumeAchievement(provinceId: number) {
  const [data, setData] = useState<VolumeAchievementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialVolumeAchievement(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial volume achievement');
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
