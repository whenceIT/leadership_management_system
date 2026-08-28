'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useUserPosition } from '@/hooks/useUserPosition';
import { ManagerGuidanceRecommendation, GuidanceStatus, ManagerContext } from '@/types/managerGuidance';
import { managerGuidanceService } from '@/services/managerGuidanceService';
import { GuidanceEngineInput } from '@/types/managerGuidance';

const STORAGE_KEY = 'manager_guidance_state';

interface StoredState {
  recommendations: ManagerGuidanceRecommendation[];
  autoOpenedFor: string[];
}

function loadStoredState(): StoredState {
  if (typeof window === 'undefined') return { recommendations: [], autoOpenedFor: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { recommendations: [], autoOpenedFor: [] };
    return JSON.parse(raw) as StoredState;
  } catch {
    return { recommendations: [], autoOpenedFor: [] };
  }
}

function saveStoredState(state: StoredState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

export interface UseManagerGuidanceResult {
  recommendations: ManagerGuidanceRecommendation[];
  activeCount: number;
  criticalCount: number;
  hasCritical: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  updateStatus: (id: string, status: GuidanceStatus) => void;
  dismissAll: () => void;
  snoozeAll: () => void;
}

export function useManagerGuidance(input?: GuidanceEngineInput): UseManagerGuidanceResult {
  const { positionId, positionName, userTier, isLoading: isPositionLoading } = useUserPosition();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<ManagerGuidanceRecommendation[]>([]);
  const initializedRef = useRef(false);
  const autoOpenRef = useRef<string[]>([]);
  const inputVersionRef = useRef(0);

  const tier = useMemo(() => {
    if (!userTier) return 'branch';
    const t = userTier.toLowerCase();
    if (t.includes('executive') || t.includes('chairperson') || t.includes('institution')) return 'institution';
    if (t.includes('province') || t.includes('regional')) return 'province';
    if (t.includes('district')) return 'district';
    return 'branch';
  }, [userTier]);

  const context: ManagerContext = useMemo(() => ({
    userId: 0,
    officeId: 0,
    provinceId: 0,
    positionId: positionId || 5,
    positionName: positionName || 'Branch Manager',
    userTier: tier,
  }), [positionId, positionName, tier]);

  const compute = useCallback(() => {
    if (!input) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = managerGuidanceService.generateRecommendations({
        ...input,
        managerContext: { ...context, ...input.managerContext },
      });
      setRecommendations(result);
      initializedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate guidance');
    } finally {
      setIsLoading(false);
    }
  }, [context, input]);

  useEffect(() => {
    inputVersionRef.current += 1;
  }, [input]);

  useEffect(() => {
    if (isPositionLoading) return;
    if (!input) return;

    const stored = loadStoredState();
    autoOpenRef.current = stored.autoOpenedFor ?? [];

    const timeout = setTimeout(() => {
      compute();
    }, 300);

    return () => clearTimeout(timeout);
  }, [isPositionLoading, compute, input]);

  useEffect(() => {
    if (!initializedRef.current || recommendations.length === 0) return;
    const hasGenerated = recommendations.some((r) => r.status === 'generated');
    if (!hasGenerated) return;
    const stored = loadStoredState();
    const updated = managerGuidanceService.markAllViewed(recommendations);
    const changed = updated.some((r, i) => r.status !== recommendations[i].status);
    if (!changed) return;
    setRecommendations(updated);
    saveStoredState({
      recommendations: updated,
      autoOpenedFor: stored.autoOpenedFor,
    });
  }, [recommendations]);

  const refresh = useCallback(() => {
    initializedRef.current = false;
    compute();
  }, [compute]);

  const updateStatus = useCallback((id: string, status: GuidanceStatus) => {
    setRecommendations((prev) => {
      const updated = managerGuidanceService.updateStatus(prev, id, status);
      saveStoredState({
        recommendations: updated,
        autoOpenedFor: autoOpenRef.current,
      });
      return updated;
    });
  }, []);

  const dismissAll = useCallback(() => {
    setRecommendations((prev) => {
      const updated = prev.map((r) => ({ ...r, status: 'dismissed' as GuidanceStatus }));
      saveStoredState({
        recommendations: updated,
        autoOpenedFor: autoOpenRef.current,
      });
      return updated;
    });
  }, []);

  const snoozeAll = useCallback(() => {
    setRecommendations((prev) => {
      const updated = prev.map((r) => ({ ...r, status: 'snoozed' as GuidanceStatus }));
      saveStoredState({
        recommendations: updated,
        autoOpenedFor: autoOpenRef.current,
      });
      return updated;
    });
  }, []);

  const activeRecommendations = useMemo(
    () => recommendations.filter((r) => !['resolved', 'dismissed', 'snoozed'].includes(r.status)),
    [recommendations]
  );

  const criticalCount = useMemo(
    () => activeRecommendations.filter((r) => r.severity === 'critical').length,
    [activeRecommendations]
  );

  const hasCritical = criticalCount > 0;

  return {
    recommendations: activeRecommendations,
    isLoading: isLoading || isPositionLoading,
    error,
    refresh,
    updateStatus,
    dismissAll,
    snoozeAll,
    activeCount: activeRecommendations.length,
    criticalCount,
    hasCritical,
  };
}
