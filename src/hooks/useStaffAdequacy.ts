'use client';

import { useState, useEffect } from 'react';
import { 
  fetchStaffAdequacyPerformance, 
  fetchProvincialStaffAdequacyPerformance, 
  StaffAdequacyData 
} from '@/services/StaffAdequacyService';

export function useStaffAdequacy(branchId: number) {
  const [data, setData] = useState<StaffAdequacyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchStaffAdequacyPerformance(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch staff adequacy performance');
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

export function useProvincialStaffAdequacy(provinceId: number) {
  const [data, setData] = useState<StaffAdequacyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchProvincialStaffAdequacyPerformance(provinceId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provincial staff adequacy performance');
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