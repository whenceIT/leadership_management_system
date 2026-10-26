'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUserPosition } from '@/hooks/useUserPosition';
import { getOfficeId, getProvinceId } from '@/utils/userContext';
import { fetchConsultantPerformanceByOffice } from '@/services/ConsultantPerformanceService';
import { GuidanceEngineInput, ManagerContext } from '@/types/managerGuidance';

function tierFromUserTier(userTier: string | null | undefined): ManagerContext['userTier'] {
  if (!userTier) return 'branch';
  const t = userTier.toLowerCase();
  if (t.includes('executive') || t.includes('chairperson') || t.includes('institution')) return 'institution';
  if (t.includes('province') || t.includes('regional')) return 'province';
  if (t.includes('district')) return 'district';
  return 'branch';
}

export function useAutoManagerGuidanceInput(enabled: boolean): GuidanceEngineInput | null {
  const { userTier, positionId, positionName } = useUserPosition();

  const officeId = useMemo(() => getOfficeId(), []);
  const provinceId = useMemo(() => getProvinceId(), []);
  const tier = tierFromUserTier(userTier);

  const managerContext: ManagerContext = useMemo(() => ({
    userId: 0,
    officeId: officeId || 0,
    provinceId: provinceId || 0,
    positionId: positionId || 0,
    positionName: positionName || '',
    userTier: tier,
  }), [officeId, provinceId, positionId, positionName, tier]);

  const [fetchedData, setFetchedData] = useState<ConsultantData | null>(null);
  const [error, setError] = useState<string | null>(null);

  interface ConsultantData {
    consultants: import('@/types/managerGuidance').ConsultantPerformance[];
  }

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        // Branch managers see only their own office; higher tiers see every office.
        const fetchAllOffices = tier !== 'branch';
        const targetOfficeId = fetchAllOffices ? undefined : officeId;

        const consultants = await fetchConsultantPerformanceByOffice(
          targetOfficeId,
          new Date().toISOString().slice(0, 7) + '-01',
          new Date().toISOString().slice(0, 10)
        );
        if (!cancelled && enabled) {
          setFetchedData({ consultants });
          setError(null);
        }
      } catch (err) {
        if (!cancelled && enabled) {
          setError(err instanceof Error ? err.message : 'Failed to load consultant performance');
          setFetchedData(null);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [enabled, officeId, tier]);

  return useMemo(() => {
    if (!enabled) return null;
    return {
      managerContext,
      consultants: fetchedData?.consultants ?? [],
      maxRecommendations: 1000,
    };
  }, [enabled, managerContext, fetchedData?.consultants]);
}
