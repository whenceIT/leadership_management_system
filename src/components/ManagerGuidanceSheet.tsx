'use client';

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useManagerGuidance } from '@/hooks/useManagerGuidance';
import { useAutoManagerGuidanceInput } from '@/hooks/useAutoManagerGuidanceInput';
import { useLoading } from '@/context/LoadingContext';
import { ManagerGuidanceRecommendation, GuidanceSeverity, GuidanceEngineInput } from '@/types/managerGuidance';
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

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'improving') return <span className="text-green-600">↑ Improving</span>;
  if (trend === 'declining' || trend === 'rapidly_declining') return <span className="text-red-600">↓ Declining</span>;
  return <span className="text-gray-500">→ Stable</span>;
}

export default function ManagerGuidanceSheet({ input }: { input?: GuidanceEngineInput }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const autoOpenedRef = useRef<string[]>(getAutoOpenedIds());
  const { isLoading: isGlobalLoading } = useLoading();
  const autoInput = useAutoManagerGuidanceInput(isOpen && !isGlobalLoading);
  const effectiveInput = input ?? autoInput;
  const { recommendations, isLoading, error, hasCritical, activeCount, criticalCount } = useManagerGuidance(effectiveInput ?? undefined);

  const handleOpen = useCallback(() => {
    setIsClosing(false);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  }, []);

  const handleMinimize = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  }, []);

  useEffect(() => {
    if (!isOpen && recommendations.length > 0) {
      const newIds = recommendations.filter((r: ManagerGuidanceRecommendation) => !autoOpenedRef.current.includes(r.id)).map((r: ManagerGuidanceRecommendation) => r.id);
      if (newIds.length > 0) {
        autoOpenedRef.current = [...autoOpenedRef.current, ...newIds];
        setAutoOpenedIds(autoOpenedRef.current);
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

  const renderContent = () => {
    if (isLoading || !autoInput) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Analyzing your performance...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-200 font-medium mb-1">Manager Guidance temporarily unavailable</p>
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
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">All Good</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
            No significant KPI performance issues currently require your attention.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {recommendations.length} area{recommendations.length !== 1 ? 's' : ''} require{recommendations.length === 1 ? 's' : ''} your attention
        </p>
        {recommendations.map((rec: ManagerGuidanceRecommendation) => {
          const config = severityConfig[rec.severity];
          const isExpanded = expandedId === rec.id;

          return (
            <div
              key={rec.id}
              className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden transition-all duration-200`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
                      {config.label}
                    </span>
                    <Badge color={rec.severity === 'critical' ? 'error' : rec.severity === 'high' ? 'warning' : 'info'} size="sm">
                      {rec.kpi}
                    </Badge>
                  </div>
                </div>

                <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{rec.whatNeedsAttention}</h4>

                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {[rec.province?.name, rec.district?.name, rec.office?.name].filter(Boolean).join(' → ') || rec.level}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Current</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{rec.currentValue}{typeof rec.currentValue === 'number' && rec.kpiCode !== 'portfolio_load_balance' ? '%' : ''}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Target</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{rec.target}{typeof rec.target === 'number' && rec.kpiCode !== 'portfolio_load_balance' ? '%' : ''}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Benchmark</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{rec.benchmark}{typeof rec.benchmark === 'number' && rec.kpiCode !== 'portfolio_load_balance' ? '%' : ''}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Variance</p>
                    <p className="text-sm font-semibold text-red-600">{rec.variance}{typeof rec.variance === 'number' && rec.kpiCode !== 'portfolio_load_balance' ? '%' : ''}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trend</p>
                  <TrendIcon trend={rec.trend} />
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Why?</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{rec.whyAttentionIsNeeded}</p>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Recommended Action</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{rec.recommendedAction}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="primary" onClick={() => navigateToRoute(rec.route)}>
                    Review {rec.kpi} →
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
                      <div><span className="text-gray-500">Current:</span> <span className="font-medium">{rec.currentValue}</span></div>
                      <div><span className="text-gray-500">Target:</span> <span className="font-medium">{rec.target}</span></div>
                      <div><span className="text-gray-500">Benchmark:</span> <span className="font-medium">{rec.benchmark}</span></div>
                      <div><span className="text-gray-500">Variance:</span> <span className="font-medium text-red-600">{rec.variance}</span></div>
                      <div><span className="text-gray-500">Trend:</span> <span className="font-medium">{rec.trend}</span></div>
                      <div><span className="text-gray-500">Level:</span> <span className="font-medium capitalize">{rec.level}</span></div>
                    </div>
                    {rec.office && <p className="text-xs text-gray-500 mt-2">Contributing Area: {rec.office.name}</p>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
            className={`relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-lg shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
              isClosing ? 'translate-y-full sm:translate-y-10 sm:opacity-0' : 'translate-y-0'
            }`}
            style={{ maxHeight: '85vh' }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Manager Guidance</h3>
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
