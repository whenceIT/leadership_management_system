/**
 * Performance resolution for the remuneration module.
 *
 * Retrieves the measured results a manager's tier depends on, from the live
 * source modules wherever the measure can be automated, and exposes the
 * supporting evidence for the measures that management verifies manually.
 */

import {
  fetchAggregateRevenue,
  fetchOfficeRevenue,
  fetchScopeScore,
  type ScopeResult,
} from './source';
import type {
  ManagerProfile,
  PerformanceInput,
  PerformanceMeasure,
  RoleDefinition,
} from './types';
import type { SourceOffice } from './source';

export interface ResolvedPerformance {
  input: PerformanceInput;
  revenue: ScopeResult | null;
  efficiency: ScopeResult | null;
  portfolioQuality: ScopeResult | null;
  officeIds: number[];
}

function measureFromScope(
  code: string,
  label: string,
  unit: string,
  result: ScopeResult
): PerformanceMeasure {
  return {
    code,
    label,
    unit,
    value: result.value,
    target: result.target,
    period: result.period ?? '',
    source: result.source,
    verified: result.available,
    note: result.message,
  };
}

function officesForScope(
  manager: ManagerProfile,
  offices: SourceOffice[]
): number[] {
  if (manager.scope.officeId) {
    const office = offices.find((o) => o.id === manager.scope.officeId);
    return office ? [office.id] : [];
  }
  if (manager.scope.districtId) {
    return offices
      .filter((o) => o.district_id === manager.scope.districtId)
      .map((o) => o.id);
  }
  if (manager.scope.provinceId) {
    return offices
      .filter((o) => o.province_id === manager.scope.provinceId)
      .map((o) => o.id);
  }
  return [];
}

function scopePath(
  manager: ManagerProfile,
  segment: 'efficiency-ratio' | 'portfolio-quality'
): string | null {
  if (manager.scope.officeId) return `/${segment}/${manager.scope.officeId}`;
  if (manager.scope.districtId) return `/${segment}/district/${manager.scope.districtId}`;
  if (manager.scope.provinceId) return `/${segment}/province/${manager.scope.provinceId}`;
  return null;
}

export async function resolvePerformance(
  manager: ManagerProfile,
  role: RoleDefinition,
  offices: SourceOffice[],
  period: string
): Promise<ResolvedPerformance> {
  const officeIds = officesForScope(manager, offices);
  const measures: PerformanceMeasure[] = [];

  let revenue: ScopeResult | null = null;
  if (role.measure.autoSource === 'revenue_achievement' && officeIds.length > 0) {
    if (manager.scope.officeId) {
      revenue = await fetchOfficeRevenue(manager.scope.officeId);
    } else {
      revenue = await fetchAggregateRevenue(officeIds);
    }
    measures.push(
      measureFromScope(
        'revenue',
        role.measure.label,
        role.measure.unit,
        revenue
      )
    );
  }

  let efficiency: ScopeResult | null = null;
  const efficiencyPath = scopePath(manager, 'efficiency-ratio');
  if (efficiencyPath) {
    efficiency = await fetchScopeScore(efficiencyPath);
    measures.push(
      measureFromScope('efficiency', 'Efficiency ratio', 'ratio', efficiency)
    );
  }

  let portfolioQuality: ScopeResult | null = null;
  const portfolioPath = scopePath(manager, 'portfolio-quality');
  if (portfolioPath) {
    portfolioQuality = await fetchScopeScore(portfolioPath);
    measures.push(
      measureFromScope(
        'portfolio_quality',
        'Portfolio quality (PDUA evidence)',
        'percent',
        portfolioQuality
      )
    );
  }

  const autoValue = revenue?.available ? revenue.value : null;

  return {
    input: {
      value: autoValue,
      period,
      source: autoValue === null ? 'manual' : revenue?.source ?? 'manual',
      measures,
      manualTier: null,
      overrideReason: null,
      efficiencyScore: null,
      pduaScore: null,
      branchCount: manager.scope.branchCount || null,
    },
    revenue,
    efficiency,
    portfolioQuality,
    officeIds,
  };
}
