'use client';

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useManagerGuidance } from '@/hooks/useManagerGuidance';
import { useAutoManagerGuidanceInput } from '@/hooks/useAutoManagerGuidanceInput';
import { useLoading } from '@/context/LoadingContext';
import type { ManagerGuidanceRecommendation, GuidanceSeverity } from '@/types/managerGuidance';

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTO_OPEN_STORAGE_KEY = 'manager_guidance_auto_opened';

function getAutoOpenedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(AUTO_OPEN_STORAGE_KEY) || '[]'); }
  catch { return []; }
}

// ─── Severity config ──────────────────────────────────────────────────────────

const SEV: Record<GuidanceSeverity, {
  dot: string; ring: string; label: string;
  pillBg: string; pillText: string;
  cardBorder: string; cardAccent: string;
  icon: string;
}> = {
  critical: {
    dot: 'bg-red-500', ring: 'ring-red-200 dark:ring-red-900',
    label: 'CRITICAL', pillBg: 'bg-red-100 dark:bg-red-900/40',
    pillText: 'text-red-700 dark:text-red-300',
    cardBorder: 'border-red-200 dark:border-red-800/60',
    cardAccent: 'bg-red-500', icon: '🔴',
  },
  high: {
    dot: 'bg-orange-500', ring: 'ring-orange-200 dark:ring-orange-900',
    label: 'HIGH', pillBg: 'bg-orange-100 dark:bg-orange-900/40',
    pillText: 'text-orange-700 dark:text-orange-300',
    cardBorder: 'border-orange-200 dark:border-orange-800/60',
    cardAccent: 'bg-orange-500', icon: '🟠',
  },
  medium: {
    dot: 'bg-yellow-500', ring: 'ring-yellow-200 dark:ring-yellow-900',
    label: 'MEDIUM', pillBg: 'bg-yellow-100 dark:bg-yellow-900/40',
    pillText: 'text-yellow-700 dark:text-yellow-300',
    cardBorder: 'border-yellow-200 dark:border-yellow-800/60',
    cardAccent: 'bg-yellow-500', icon: '🟡',
  },
  low: {
    dot: 'bg-blue-500', ring: 'ring-blue-200 dark:ring-blue-900',
    label: 'LOW', pillBg: 'bg-blue-100 dark:bg-blue-900/40',
    pillText: 'text-blue-700 dark:text-blue-300',
    cardBorder: 'border-blue-200 dark:border-blue-800/60',
    cardAccent: 'bg-blue-500', icon: '🔵',
  },
  healthy: {
    dot: 'bg-emerald-500', ring: 'ring-emerald-200 dark:ring-emerald-900',
    label: 'HEALTHY', pillBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    pillText: 'text-emerald-700 dark:text-emerald-300',
    cardBorder: 'border-emerald-200 dark:border-emerald-800/60',
    cardAccent: 'bg-emerald-500', icon: '🟢',
  },
};

// ─── Issue classifiers ────────────────────────────────────────────────────────

function classifyIssue(issue: string): { label: string; icon: string; color: string } {
  if (issue.includes('target was missed'))
    return { label: 'Target Missed', icon: '🎯', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' };
  if (issue.includes('below the K') && issue.includes('band'))
    return { label: 'Below Band', icon: '📉', color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800' };
  if (issue.includes('PDUA'))
    return { label: 'Low PDUA', icon: '💧', color: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800' };
  if (issue.includes('still uncollected'))
    return { label: 'Still Uncollected', icon: '⏳', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' };
  if (issue.includes('total uncollected'))
    return { label: 'Total Uncollected', icon: '💰', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' };
  return { label: issue.slice(0, 32), icon: '⚠️', color: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' };
}

// ─── Mini components ──────────────────────────────────────────────────────────

function TrendPill({ trend }: { trend?: string }) {
  if (!trend) return null;
  if (trend === 'improving') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
      <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor"><path d="M1 7L5 3l4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
      Improving
    </span>
  );
  if (trend === 'declining' || trend === 'rapidly_declining') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
      <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor"><path d="M1 3L5 7l4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
      {trend === 'rapidly_declining' ? 'Rapid Decline' : 'Declining'}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
      → Stable
    </span>
  );
}

function ProgressBar({ value, target }: { value: number; target: number }) {
  const pct = target > 0 ? Math.min(100, Math.max(0, (value / target) * 100)) : 0;
  const color = pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-yellow-500' : pct >= 50 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function Breadcrumb({ parts }: { parts: (string | undefined)[] }) {
  const filtered = parts.filter(Boolean) as string[];
  if (!filtered.length) return null;
  return (
    <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 flex-wrap">
      {filtered.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="opacity-40">›</span>}
          <span>{part}</span>
        </React.Fragment>
      ))}
    </p>
  );
}

// ─── Data shape for grouped tree ──────────────────────────────────────────────

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
interface OfficeNode { consultants: ConsultantNode[]; worstSeverity: GuidanceSeverity }
interface DistrictNode { offices: Map<string, OfficeNode>; worstSeverity: GuidanceSeverity }
interface ProvinceNode { districts: Map<string, DistrictNode>; worstSeverity: GuidanceSeverity }

const SEV_ORDER: GuidanceSeverity[] = ['critical', 'high', 'medium', 'low', 'healthy'];
function worstOf(a: GuidanceSeverity, b: GuidanceSeverity): GuidanceSeverity {
  return SEV_ORDER.indexOf(a) <= SEV_ORDER.indexOf(b) ? a : b;
}

// ─── Individual Consultant Card ───────────────────────────────────────────────

function ConsultantCard({
  node, onNavigate,
}: { node: ConsultantNode; onNavigate: (route: string) => void }) {
  const { rec } = node;
  const sev = SEV[rec.severity];
  const [expanded, setExpanded] = useState(false);
  const pct = rec.target && typeof rec.target === 'number' && rec.currentValue && typeof rec.currentValue === 'number'
    ? Math.round((rec.currentValue / rec.target) * 100) : null;

  return (
    <div className={`relative rounded-xl border overflow-hidden transition-all duration-200 ${sev.cardBorder} bg-white dark:bg-slate-900 group hover:shadow-md`}>
      {/* left accent stripe */}
      <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${sev.cardAccent}`} />

      <div className="pl-4 pr-4 pt-3 pb-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[10px] font-bold tracking-widest uppercase ${sev.pillText}`}>
                {sev.icon} {sev.label}
              </span>
              <TrendPill trend={rec.trend} />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight truncate">
              {rec.consultantName || 'Consultant'}
            </h4>
            <Breadcrumb parts={[rec.officeName, rec.districtName, rec.provinceName]} />
          </div>

          {/* Score bubble */}
          {pct !== null && (
            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold ring-2 ${sev.ring} ${
              pct >= 90 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : pct >= 70 ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
              : pct >= 50 ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {pct}%
            </div>
          )}
        </div>

        {/* Progress bar */}
        {typeof rec.currentValue === 'number' && typeof rec.target === 'number' && (
          <div className="mb-2.5">
            <ProgressBar value={rec.currentValue} target={rec.target} />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-slate-400">
                {typeof rec.currentValue === 'number' ? `K${rec.currentValue.toLocaleString()}` : rec.currentValue} given out
              </span>
              <span className="text-[10px] text-slate-400">
                Target: {typeof rec.target === 'number' ? `K${rec.target.toLocaleString()}` : rec.target}
              </span>
            </div>
          </div>
        )}

        {/* Issue tags */}
        {node.issues.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {node.issues.slice(0, 3).map((issue, i) => {
              const c = classifyIssue(issue);
              return (
                <span key={i} className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.color}`}>
                  {c.icon} {c.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Recommended action */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2 mb-3">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Recommended Action</p>
          <p className="text-[12px] text-slate-700 dark:text-slate-300 leading-snug">{rec.recommendedAction}</p>
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => onNavigate(rec.route)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 ${sev.pillBg} ${sev.pillText} hover:opacity-80 active:scale-95`}
          >
            Review {rec.consultantName?.split(' ')[0] || 'Consultant'}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {expanded ? 'Less' : 'Why?'}
          </button>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-fade-in">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KPI Breakdown</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
              {[
                ['Given Out', typeof rec.currentValue === 'number' ? `K${rec.currentValue.toLocaleString()}` : rec.currentValue],
                ['Target', typeof rec.target === 'number' ? `K${rec.target.toLocaleString()}` : rec.target],
                ['PDUA', node.pdua ? `${(node.pdua * 100).toFixed(1)}%` : '—'],
                ['Still Uncollected', node.stillUncollected ? `K${node.stillUncollected.toLocaleString()}` : '—'],
                ['Total Uncollected', node.totalUncollected ? `K${node.totalUncollected.toLocaleString()}` : '—'],
                ['Band', node.band ?? '—'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between gap-1">
                  <span className="text-slate-400 truncate">{label}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{val}</span>
                </div>
              ))}
            </div>
            {rec.whatNeedsAttention && (
              <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-snug">{rec.whatNeedsAttention}</p>
              </div>
            )}
            {rec.whyAttentionIsNeeded && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{rec.whyAttentionIsNeeded}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Collapsible tree rows ────────────────────────────────────────────────────

function SeverityDot({ sev }: { sev: GuidanceSeverity }) {
  return <span className={`w-2 h-2 rounded-full ${SEV[sev].dot} shrink-0`} />;
}

function TreeRow({
  label, count, sev, depth, open, onToggle, children,
}: {
  label: string; count: number; sev: GuidanceSeverity;
  depth: 0 | 1 | 2; open: boolean; onToggle: () => void;
  children?: React.ReactNode;
}) {
  const depthStyles = {
    0: 'bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 mb-2',
    1: 'ml-4 border-l-2 border-slate-200 dark:border-slate-700 pl-3 mb-2',
    2: 'ml-4 border-l border-slate-200 dark:border-slate-700 pl-3 mb-2',
  }[depth];

  const buttonStyles = {
    0: 'w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors',
    1: 'w-full flex items-center gap-2 px-3 py-2 text-left bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
    2: 'w-full flex items-center gap-2 px-3 py-1.5 text-left bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors',
  }[depth];

  const labelSize = depth === 0 ? 'text-[13px] font-semibold text-slate-900 dark:text-white'
    : depth === 1 ? 'text-[12px] font-semibold text-slate-700 dark:text-slate-200'
    : 'text-[11px] font-medium text-slate-600 dark:text-slate-300';

  return (
    <div className={depthStyles}>
      <button type="button" onClick={onToggle} className={buttonStyles}>
        <SeverityDot sev={sev} />
        <span className={`flex-1 ${labelSize}`}>{label}</span>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${SEV[sev].pillBg} ${SEV[sev].pillText}`}>
          {count}
        </span>
        <Chevron open={open} />
      </button>
      {open && <div className={depth === 0 ? 'px-3 pb-3' : 'pt-1.5'}>{children}</div>}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-3 py-2 animate-pulse">
      {[0.85].map((w, i) => (
        <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700" style={{ width: `${w * 40}%` }} />
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 w-full" />
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700" style={{ width: `${w * 60}%` }} />
          <div className="h-8 rounded-lg bg-slate-200 dark:bg-slate-700 w-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({ criticalCount, activeCount }: { criticalCount: number; activeCount: number }) {
  return (
    <div className="flex items-center gap-3 px-1 py-2 mb-1">
      {criticalCount > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="relative flex">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-[11px] font-bold text-red-600 dark:text-red-400">{criticalCount} critical</span>
        </div>
      )}
      <span className="text-[11px] text-slate-400 dark:text-slate-500">
        {activeCount} consultant{activeCount !== 1 ? 's' : ''} flagged
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ManagerGuidanceSheet({ input }: { input?: any }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [tab, setTab] = useState<'all' | 'critical' | 'high'>('all');

  const [expandedProvinces, setExpandedProvinces] = useState<Set<string>>(new Set());
  const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(new Set());
  const [expandedOffices, setExpandedOffices] = useState<Set<string>>(new Set());

  const seenSignaturesRef = useRef<Set<string>>(new Set());
  const userDismissedRef = useRef(false);

  const { isLoading: isGlobalLoading } = useLoading();
  const autoInput = useAutoManagerGuidanceInput(!isGlobalLoading);
  const effectiveInput = input ?? autoInput;
  const { recommendations, isLoading, error, hasCritical, activeCount, criticalCount } = useManagerGuidance(effectiveInput ?? undefined);

  // ── navigation helpers ──

  const handleOpen = useCallback(() => {
    setIsClosing(false);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    recommendations.forEach((r) =>
      seenSignaturesRef.current.add(`${r.kpiCode}_${r.severity}_${r.currentValue}`)
    );
    userDismissedRef.current = true;
    setIsClosing(true);
    setTimeout(() => { setIsOpen(false); setIsClosing(false); }, 300);
  }, [recommendations]);

  const navigateToRoute = useCallback((route: string) => {
    router.push(route);
  }, [router]);

  // ── auto-open for new critical/high ──

  useEffect(() => {
    if (!isOpen && recommendations.length > 0 && !userDismissedRef.current) {
      const newCritical = recommendations.filter((r) => r.severity === 'critical' || r.severity === 'high');
      const hasNew = newCritical.some((r) => !seenSignaturesRef.current.has(`${r.kpiCode}_${r.severity}_${r.currentValue}`));
      if (hasNew) {
        newCritical.forEach((r) => seenSignaturesRef.current.add(`${r.kpiCode}_${r.severity}_${r.currentValue}`));
        setTimeout(() => { setIsClosing(false); setIsOpen(true); }, 400);
      }
    }
  }, [recommendations, isOpen]);

  // ── tree toggle helpers ──

  const toggleProvince = useCallback((name: string) => {
    setExpandedProvinces((p) => { const n = new Set(p); n.has(name) ? n.delete(name) : n.add(name); return n; });
  }, []);
  const toggleDistrict = useCallback((key: string) => {
    setExpandedDistricts((p) => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }, []);
  const toggleOffice = useCallback((key: string) => {
    setExpandedOffices((p) => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }, []);

  // ── group recs into province→district→office tree ──

  const grouped = useMemo(() => {
    const provinces = new Map<string, ProvinceNode>();
    const filtered = tab === 'all' ? recommendations
      : recommendations.filter((r) => r.severity === tab);

    for (const rec of filtered) {
      const pName = rec.province?.name || rec.provinceName || 'Unknown Province';
      const dName = rec.district?.name || rec.districtName || 'Unknown District';
      const oName = rec.office?.name || rec.officeName || 'Unknown Office';

      let pNode = provinces.get(pName);
      if (!pNode) { pNode = { districts: new Map(), worstSeverity: 'healthy' }; provinces.set(pName, pNode); }
      pNode.worstSeverity = worstOf(pNode.worstSeverity, rec.severity);

      let dNode = pNode.districts.get(dName);
      if (!dNode) { dNode = { offices: new Map(), worstSeverity: 'healthy' }; pNode.districts.set(dName, dNode); }
      dNode.worstSeverity = worstOf(dNode.worstSeverity, rec.severity);

      let oNode = dNode.offices.get(oName);
      if (!oNode) { oNode = { consultants: [], worstSeverity: 'healthy' }; dNode.offices.set(oName, oNode); }
      oNode.worstSeverity = worstOf(oNode.worstSeverity, rec.severity);

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
  }, [recommendations, tab]);

  const criticalRecs = recommendations.filter((r) => r.severity === 'critical' || r.severity === 'high');

  // ── trigger button (bottom-left) ──────────────────────────────────────────

  const renderTrigger = () => {
    if (isOpen) return null;
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-5 left-5 z-[99999] group"
        aria-label="Open Manager Guidance"
      >
        <div className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-lg border transition-all duration-200
          bg-white dark:bg-slate-900
          border-slate-200 dark:border-slate-700
          hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0
          ${hasCritical ? 'ring-1 ring-red-400 dark:ring-red-500' : ''}`}
        >
          {/* icon */}
          <span className="relative flex items-center justify-center w-7 h-7">
            <span className="text-base">💡</span>
            {hasCritical && (
              <>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping opacity-75" />
              </>
            )}
          </span>

          {/* label */}
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-none">
            Guidance
          </span>

          {/* count badge */}
          {activeCount > 0 && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full leading-none ${
              hasCritical
                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              {activeCount}
            </span>
          )}
        </div>
      </button>
    );
  };

  // ── sheet content ─────────────────────────────────────────────────────────

  const renderContent = () => {
    if (isLoading || !effectiveInput) return <Skeleton />;

    if (error) return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4 text-2xl">⚠️</div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Guidance temporarily unavailable</p>
        <p className="text-xs text-slate-400 max-w-xs">{error}</p>
      </div>
    );

    if (recommendations.length === 0) return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <img src="/preloader/modal-preloader.gif" alt="Loading" className="w-12 h-12" />
      </div>
    );

    const filtered = tab === 'all' ? recommendations
      : recommendations.filter((r) => r.severity === tab);

    if (filtered.length === 0) return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-sm text-slate-400">No {tab} priority issues.</p>
      </div>
    );

    return (
      <div className="space-y-1">
        <StatsBar criticalCount={criticalCount} activeCount={activeCount} />
        {Array.from(grouped.entries()).map(([provinceName, pNode]) => {
          const pOpen = expandedProvinces.has(provinceName);
          const pCount = Array.from(pNode.districts.values())
            .reduce((a, d) => a + Array.from(d.offices.values()).reduce((b, o) => b + o.consultants.length, 0), 0);

          return (
            <TreeRow
              key={provinceName} label={provinceName} count={pCount}
              sev={pNode.worstSeverity} depth={0} open={pOpen}
              onToggle={() => toggleProvince(provinceName)}
            >
              {Array.from(pNode.districts.entries()).map(([districtName, dNode]) => {
                const dKey = `${provinceName}::${districtName}`;
                const dOpen = expandedDistricts.has(dKey);
                const dCount = Array.from(dNode.offices.values()).reduce((a, o) => a + o.consultants.length, 0);

                return (
                  <TreeRow
                    key={districtName} label={districtName} count={dCount}
                    sev={dNode.worstSeverity} depth={1} open={dOpen}
                    onToggle={() => toggleDistrict(dKey)}
                  >
                    {Array.from(dNode.offices.entries()).map(([officeName, oNode]) => {
                      const oKey = `${dKey}::${officeName}`;
                      const oOpen = expandedOffices.has(oKey);

                      return (
                        <TreeRow
                          key={officeName} label={officeName} count={oNode.consultants.length}
                          sev={oNode.worstSeverity} depth={2} open={oOpen}
                          onToggle={() => toggleOffice(oKey)}
                        >
                          <div className="space-y-2 pt-1">
                            {oNode.consultants.map((node) => (
                              <ConsultantCard key={node.rec.id} node={node} onNavigate={navigateToRoute} />
                            ))}
                          </div>
                        </TreeRow>
                      );
                    })}
                  </TreeRow>
                );
              })}
            </TreeRow>
          );
        })}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      {renderTrigger()}

      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-end sm:items-end justify-center">

          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
            onClick={handleClose}
          />

          {/* Sheet */}
          <div
            className={`
              relative w-full sm:max-w-lg
              bg-white dark:bg-slate-950
              rounded-t-3xl sm:rounded-3xl
              shadow-[0_-8px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_-8px_40px_rgba(0,0,0,0.5)]
              border border-slate-200/80 dark:border-slate-800
              flex flex-col
              transform transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
              sm:mb-4 sm:mx-4
              ${isClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
            `}
            style={{ maxHeight: '88vh' }}
          >

            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Header */}
            <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex-shrink-0">
              <div className="flex items-start justify-between gap-3">
                {/* Title */}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm ${
                    hasCritical ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                  }`}>
                    {hasCritical ? '🚨' : '💡'}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">
                      Manager Guidance
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                      {activeCount > 0
                        ? `${activeCount} consultant${activeCount !== 1 ? 's' : ''} require${activeCount === 1 ? 's' : ''} attention`
                        : 'All consultants performing well'}
                    </p>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tab bar */}
              {recommendations.length > 0 && (
                <div className="flex items-center gap-1 mt-3 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
                  {([
                    ['all', `All (${recommendations.length})`],
                    ['critical', `🔴 Critical (${criticalRecs.filter(r => r.severity === 'critical').length})`],
                    ['high', `🟠 High (${criticalRecs.filter(r => r.severity === 'high').length})`],
                  ] as const).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setTab(key)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all duration-150 ${
                        tab === key
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-1"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
            >
              {renderContent()}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 flex-shrink-0 flex items-center justify-between">
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Auto-refreshes with KPI data
              </p>
              <button
                onClick={handleClose}
                className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
