'use client';

import { useState, useEffect } from 'react';
import { fetchInstitutionalMonth3RecoveryAchievements, InstitutionalAPIResponse } from '@/services/InstitutionalAPIService';

export function useInstitutionalMonth3RecoveryAchievements() {
  const [data, setData] = useState<InstitutionalAPIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchInstitutionalMonth3RecoveryAchievements();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch institutional 3-month recovery achievements');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    data,
    isLoading,
    error
  };
}
