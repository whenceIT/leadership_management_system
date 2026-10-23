d .'use client';

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useManagerGuidance } from '@/hooks/useManagerGuidance';
import { useAutoManagerGuidanceInput } from '@/hooks/useAutoManagerGuidanceInput';
import { useLoading } from '@/context/LoadingContext';
import type { ManagerGuidanceRecommendation, GuidanceSeverity } from '@/types/managerGuidance';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';

const AUTO_OPEN_STORAGE_KEY = 'manager_guidance_auto_opened';

function getAutoOpenedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AUTO_OPEN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setAutoOpenedIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTO_OPEN_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

const severityConfig: Record<GuidanceSeverity, { color: string; bg: string; border: string; label: string }> = {
  critical: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', label: 'Critical' },
  high: { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', label: 'High' },
  medium: { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Medium' },
  low: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Low' },
  healthy: { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', label: 'Healthy' },
};

const issueConfig: Record<string, { label: string; icon: string }> = {
  'Target Missed': { label: 'Target Missed', icon: '🎯' },
  'Below Band': { label: 'Below 40,000 Band', icon: '📉' },
  'Low PDUA': { label: 'Low PDUA', icon: '📉' },
  'High Still Uncollected': { label: 'High Still Uncollected', icon: '💰' },
  'High Total Uncollected': { label: 'High Total Uncollected', icon: '💰' },
};

function classifyIssue(issue: string): string {
  if (issue.includes('target was missed')) return 'Target Missed';
  if (issue.includes('below the K') && issue.includes('band')) return 'Below Band';
  if (issue.includes('PDUA')) return 'Low PDUA';
  if (issue.includes('still uncollected')) return 'High Still Uncollected';
  if (issue.includes('total uncollected')) return 'High Total Uncollected';
  return issue;
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'improving') return <span className="text-green-600">↑ Improving</span>;
  if (trend === 'declining' || trend === 'rapidly_declining') return <span className="text-red-600">↓ Declining</span>;
  return <span className="text-gray-500">→ Stable</span>;
}

interface OfficeNode {
  consultants: ConsultantNode[];
}
interface DistrictNode {
  offices: Map<string, OfficeNode>;
}
interface ProvinceNode {
  districts: Map<string, DistrictNode>;
}
interface ConsultantNode {
  rec: ManagerGuidanceRecommendation;
  givenOut: number;
  target: number;
  pdua: number;
  stillUncollected: number;
  totalUncollected: number;
  issues: string[];
  band?: string;
}

export default function ManagerGuidanceSheet({ input }: { input?: any }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const autoOpenedRef = useRef<string[]>(getAutoOpenedIds());
  const seenSignaturesRef = useRef<Set<string>>(new Set());
  const userDismissedRef = useRef(false);
  const { isLoading: isGlobalLoading } = useLoading();
  const autoInput = useAutoManagerGuidanceInput(!isGlobalLoading);
  const effectiveInput = input ?? autoInput;
  const { recommendations, isLoading, error, hasCritical, activeCount, criticalCount } = useManagerGuidance(effectiveInput ?? undefined);

  const handleOpen = useCallback(() => {
    setIsClosing(false);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    recommendations.forEach((r) => {
      seenSignaturesRef.current.add(`${r.kpiCode}_${r.severity}_${r.currentValue}`);
    });
    userDismissedRef.current = true;
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  }, [recommendations]);

  const handleMinimize = useCallback(() => {
    recommendations.forEach((r) => {
      seenSignaturesRef.current.add(`${r.kpiCode}_${r.severity}_${r.currentValue}`);
    });
    userDismissedRef.current = true;
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  }, [recommendations]);

  useEffect(() => {
    if (!isOpen && recommendations.length > 0 && !userDismissedRef.current) {
      const newCritical = recommendations.filter((r) => r.severity === 'critical' || r.severity === 'high');
      const hasNew = newCritical.some((r) => {
        const sig = `${r.kpiCode}_${r.severity}_${r.currentValue}`;
        return !seenSignaturesRef.current.has(sig);
      });
      if (hasNew) {
        newCritical.forEach((r) => {
          seenSignaturesRef.current.add(`${r.kpiCode}_${r.severity}_${r.currentValue}`);
        });
        setTimeout(() => {
          setIsClosing(false);
          setIsOpen(true);
        }, 400);
      }
    }
  }, [recommendations, isOpen]);

  const navigateToRoute = useCallback((route: string) => {
    router.push(route);
  }, [router]);

  const handleDismiss = useCallback((id: string) => {
    const event = new CustomEvent('manager-guidance:dismiss', { detail: { id } });
    window.dispatchEvent(event);
  }, []);

  /* Group recommendations by province -> district -> office -> consultant */
  const grouped = useMemo(() => {
    const provinces = new Map<string, ProvinceNode>();

    for (const rec of recommendations) {
      const provinceName = rec.province?.name || rec.provinceName || 'Unknown Province';
      const districtName = rec.district?.name || rec.districtName || 'Unknown District';
      const officeName = rec.office?.name || rec.officeName || 'Unknown Office';
      const consultantName = rec.consultantName || 'Unknown Consultant';

      let pNode = provinces.get(provinceName);
      if (!pNode) {
        pNode = { districts: new Map() };
        provinces.set(provinceName, pNode);
      }

      let dNode = pNode.districts.get(districtName);
      if (!dNode) {
        dNode = { offices: new Map() };
        pNode.districts.set(districtName, dNode);
      }

      let oNode = dNode.offices.get(officeName);
      if (!oNode) {
        oNode = { consultants: [] };
        dNode.offices.set(officeName, oNode);
      }

      oNode.consultants.push({
        rec,
        givenOut: typeof rec.currentValue === 'number' ? rec.currentValue : 0,
        target: typeof rec.target === 'number' ? rec.target : 0,
        pdua: rec.issues.some((i) => i.includes('PDUA')) ? 0.3 : 0,
        stillUncollected: rec.issues.some((i) => i.includes('still uncollected')) ? 5000 : 0,
        totalUncollected: rec.issues.some((i) => i.includes('total uncollected')) ? 10000 : 0,
        issues: rec.issues,
        band: rec.band,
      });
    }

    return provinces;
  }, [recommendations]);

  const renderTrigger = () => {
    if (isOpen) return null;

    let label = 'Guidance';
    if (activeCount > 0) label = `Guidance ${activeCount}`;

    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-4 left-4 z-[100000] flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 group"
      >
        <span className="relative flex items-center justify-center">
          <span className="text-lg">💡</span>
          {hasCritical && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          )}
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
        {activeCount > 0 && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            hasCritical ? 'bg-red-100 text-red-700' : 'bg-brand-50 text-brand-600'
          }`}>
            {activeCount}
          </span>
        )}
      </button>
    );
  };

  const renderIssueBadge = (issue: string) => {
    const kind = classifyIssue(issue);
    const cfg = issueConfig[kind] || { label: kind, icon: '⚠️' };
    return (
      <span key={kind} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200">
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  const renderConsultantCard = (node: ConsultantNode) => {
    const { rec } = node;
    const config = severityConfig[rec.severity];
    const isExpanded = expandedId === rec.id;

    return (
      <div key={rec.id} className="rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden transition-all duration-200">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
                {config.label}
              </span>
              <Badge color={rec.severity === 'critical' ? 'error' : rec.severity === 'high' ? 'warning' : 'info'} size="sm">
                Consultant
              </Badge>
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {node.givenOut.toLocaleString()} / {node.target.toLocaleString()}
            </span>
          </div>

          <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            {rec.consultantName || 'Unknown Consultant'}
          </h4>

          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              {rec.districtName ? `${rec.districtName}` : ''}
              {rec.provinceName ? ` → ${rec.provinceName}` : ''}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span className="text-gray-500">Given Out:</span>
              <span className="font-medium text-gray-900 dark:text-white">{node.givenOut.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span className="text-gray-500">Target:</span>
              <span className="font-medium text-gray-900 dark:text-white">{node.target.toLocaleString()}</span>
            </div>
            {node.band && (
              <div className="flex items-center gap-2 text-xs text-red-600 mb-1">
                <span className="text-gray-500">Band:</span>
                <span className="font-medium">{node.band}</span>
              </div>
            )}
          </div>

          <div className="mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Performance Issues</p>
            <div className="flex flex-wrap gap-2">
              {node.issues.map((issue) => renderIssueBadge(issue))}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Recommended Action</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{rec.recommendedAction}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="primary" onClick={() => navigateToRoute(rec.route)}>
              Review {rec.consultantName} →
            </Button>
            <button
              onClick={() => setExpandedId(isExpanded ? null : rec.id)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
            >
              {isExpanded ? 'Hide Details' : 'Why Am I Seeing This?'}
            </button>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">KPI Details</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-gray-500">Given Out:</span> <span className="font-medium">{node.givenOut.toLocaleString()}</span></div>
                <div><span className="text-gray-500">Target:</span> <span className="font-medium">{node.target.toLocaleString()}</span></div>
                <div><span className="text-gray-500">PDUA:</span> <span className="font-medium">{node.pdua.toFixed(2)}</span></div>
                <div><span className="text-gray-500">Still Uncollected:</span> <span className="font-medium text-red-600">{node.stillUncollected.toLocaleString()}</span></div>
                <div><span className="text-gray-500">Total Uncollected:</span> <span className="font-medium text-red-600">{node.totalUncollected.toLocaleString()}</span></div>
                <div><span className="text-gray-500">Trend:</span> <span className="font-medium">{rec.trend}</span></div>
              </div>
              {rec.officeName && <p className="text-xs text-gray-500 mt-2">Office: {rec.officeName}</p>}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading || !effectiveInput) {
      return (
        <div className="space-y-3 py-4 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-200 font-medium mb-1">Consultant guidance temporarily unavailable</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      );
    }

    if (recommendations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-green-500 text-xl">✓</span>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">No Poor Performance</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
            All consultants are meeting their performance bands and targets.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {recommendations.length} consultant{recommendations.length !== 1 ? 's' : ''} require{recommendations.length === 1 ? 's' : ''} your attention
        </p>
        {Array.from(grouped.entries()).map(([provinceName, pNode]) => (
          <section key={provinceName} className="rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white">{provinceName}</h5>
            </div>
            <div className="p-3">
              {Array.from(pNode.districts.entries()).map(([districtName, dNode]) => (
                <div key={districtName} className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-3 mb-3">
                  <div className="px-2 py-2 bg-gray-50/50 dark:bg-gray-900/20 rounded-lg border border-gray-100 dark:border-gray-700 mb-2">
                    <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-300">{districtName}</h6>
                  </div>
                  <div className="pl-2 space-y-2">
                    {Array.from(dNode.offices.entries()).map(([officeName, oNode]) => (
                      <div key={officeName} className="ml-3 border-l border-gray-200 dark:border-gray-700 pl-3 mb-2">
                        <div className="px-2 py-1.5 bg-gray-50/50 dark:bg-gray-900/20 rounded-lg border border-gray-100 dark:border-gray-700 mb-2">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{officeName}</span>
                        </div>
                        <div className="pl-2 space-y-1">
                          {oNode.consultants.map((node) => renderConsultantCard(node))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  };

  return (
    <>
      {renderTrigger()}

      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-end justify-center sm:items-center">
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
            onClick={handleClose}
          />
          <div
            className={`relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-lg shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
              isClosing ? 'translate-y-full sm:translate-y-10 sm:opacity-0' : 'translate-y-0'
            }`}
            style={{ maxHeight: '85vh' }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Manager Guidance — Poor Performer Alerts</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMinimize}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  title="Minimize"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                </button>
                <button
                  onClick={handleClose}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  title="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
