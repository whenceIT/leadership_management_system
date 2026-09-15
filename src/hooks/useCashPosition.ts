'use client';

import { useState, useEffect } from 'react';
import { fetchCashPosition, CashPositionData } from '@/services/CashPositionService';
import { CashHealthBranchData, fetchCashHealthOffice } from '@/services/CashPositionService';

export function useCashPosition(branchId: number) {
  const [data, setData] = useState<CashPositionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchCashPosition(branchId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cash position');
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

export function useCashHealthPosition(officeId: number) {
  const [data, setData] = useState<CashHealthBranchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchCashHealthOffice(officeId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cash health');
      } finally {
        setIsLoading(false);
      }
    };

    if (officeId > 0) {
      fetchData();
    }
  }, [officeId]);

  return {
    data,
    isLoading,
    error
  };
}
