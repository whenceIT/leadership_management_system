'use client';

import { useState, useEffect } from 'react';
import { 
  fetchProductivityAchievement, 
  fetchProvincialProductivityAchievement, 
  ProductivityAchievementData 
} from '@/services/ProductivityAchievementService';

export function useProductivityAchievement(branchId: number) {
  const [data, setData] = useState<ProductivityAchievementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProductivityAchievement(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch productivity achievement');
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

export function useProvincialProductivityAchievement(provinceId: number) {
  const [data, setData] = useState<ProductivityAchievementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialProductivityAchievement(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial productivity achievement');
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
