'use client';

import { useState, useEffect } from 'react';
import { CachedAPI } from '@/lib/apiCache';

export interface CashPositionData {
  score: number;
  average_score: number;
  percentage_point: number;
  totalCashBalance: number;
  totalIncome: number;
  totalAdvances: number;
  totalAdvancesPaid: number;
  totalExpenses: number;
  totalFullPayments: number;
  totalReloanedAmount: number;
  totalPartPayment: number;
  totalNewLoans: number;
  startDate: string;
  endDate: string;
}

export interface CashPositionFilters {
  office_id?: number;
  province_id?: number;
  district_id?: number;
  start_date?: string;
  end_date?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smartbackend.whencefinancesystem.com';
const CASH_POSITION_CACHE_TTL = 5 * 60 * 1000;

const cashPositionCache = new CachedAPI<CashPositionData>(CASH_POSITION_CACHE_TTL);

function buildCacheKey(filters?: CashPositionFilters): string {
  if (!filters) return 'cash-position:default';
  return `cash-position:${filters.office_id ?? 'all'}:${filters.province_id ?? 'all'}:${filters.district_id ?? 'all'}:${filters.start_date ?? ''}:${filters.end_date ?? ''}`;
}

function computeScore(totalCashBalance: number): number {
  if (totalCashBalance >= 20000 && totalCashBalance <= 30000) {
    return 100;
  } else if (totalCashBalance > 30000 && totalCashBalance <= 50000) {
    const excess = totalCashBalance - 30000;
    const penalty = (excess / 20000) * 40;
    return Math.max(100 - penalty, 60);
  } else if (totalCashBalance < 20000 && totalCashBalance >= 10000) {
    const shortfall = 20000 - totalCashBalance;
    const penalty = (shortfall / 10000) * 50;
    return Math.max(100 - penalty, 50);
  } else {
    return 0;
  }
}

async function fetchCashPosition(filters?: CashPositionFilters): Promise<CashPositionData> {
  const queryParams = new URLSearchParams();
  if (filters?.office_id) queryParams.append('office_id', filters.office_id.toString());
  if (filters?.province_id) queryParams.append('province_id', filters.province_id.toString());
  if (filters?.district_id) queryParams.append('district_id', filters.district_id.toString());
  if (filters?.start_date) queryParams.append('start_date', filters.start_date);
  if (filters?.end_date) queryParams.append('end_date', filters.end_date);

  const url = `${API_BASE_URL}/api/kpi-scores/summary${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Network response was not ok');

  const result = await response.json();
  if (!result.success) throw new Error('API returned success false');

  const apiData = result.data;
  const totalCashBalance = apiData.totalCashBalance;

  const score = computeScore(totalCashBalance);

  return {
    score,
    average_score: score,
    percentage_point: score,
    ...apiData,
  };
}

export function useInstitutionalCashPosition(filters?: CashPositionFilters) {
  const officeId = filters?.office_id;
  const provinceId = filters?.province_id;
  const districtId = filters?.district_id;
  const startDate = filters?.start_date;
  const endDate = filters?.end_date;
  const cacheKey = buildCacheKey(filters);

  const [data, setData] = useState<CashPositionData | null>(() => cashPositionCache.peek(cacheKey));
  const [isLoading, setIsLoading] = useState(() => cashPositionCache.peek(cacheKey) === null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fresh = await cashPositionCache.get(cacheKey, () =>
          fetchCashPosition({ office_id: officeId, province_id: provinceId, district_id: districtId, start_date: startDate, end_date: endDate })
        );
        if (cancelled) return;
        if (fresh) {
          setData(fresh);
        } else {
          setError('No data returned for the selected criteria');
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch institutional cash position');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, officeId, provinceId, districtId, startDate, endDate, refreshKey]);

  const refresh = () => {
    cashPositionCache.clear(cacheKey);
    setRefreshKey((k) => k + 1);
  };

  return {
    data,
    isLoading,
    error,
    refresh,
  };
}
