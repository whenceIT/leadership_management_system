'use client';

import React, { useState } from 'react';

interface Constituent {
  name: string;
  score: number;       // 0-100 (or higher if overachieving)
  weight: number;      // percentage weight (e.g., 25 for 25%)
  actual: string;      // display value (e.g., "30%", "K45k")
  target: string;      // target value
  instAvg?: string;    // institutional average
  onClick?: () => void;
}

interface HeadlineParameterCardProps {
  title: string;
  shortTitle: string;
  indexScore: number;       // 0-100
  instAvg: number;          // institutional average score
  target: number;           // target score
  trend: '↑' | '↓' | '→';
  trendValue: string;       // e.g., "+2.3% from last month"
  constituents: Constituent[];
  colorScheme: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  onDrillDown?: () => void;
}

function getStatusColor(score: number, target: number) {
  const ratio = score / target;
  if (ratio >= 0.9) return { bg: 'bg-green-500', text: 'text-green-600', badge: 'bg-green-100 text-green-800', label: 'GOOD' };
  if (ratio >= 0.7) return { bg: 'bg-yellow-500', text: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-800', label: 'WARNING' };
  if (ratio >= 0.5) return { bg: 'bg-orange-500', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-800', label: 'ALERT' };
  return { bg: 'bg-red-500', text: 'text-red-600', badge: 'bg-red-100 text-red-800', label: 'CRITICAL' };
}

const colorSchemes = {
  blue: {
    header: 'from-blue-600 to-blue-800',
    accent: 'text-blue-400',
    bar: 'bg-blue-500',
    barBg: 'bg-blue-900/30',
    border: 'border-blue-500/30',
    card: 'bg-blue-950/20 dark:bg-blue-900/10',
    icon: '🏢'
  },
  green: {
    header: 'from-emerald-600 to-emerald-800',
    accent: 'text-emerald-400',
    bar: 'bg-emerald-500',
    barBg: 'bg-emerald-900/30',
    border: 'border-emerald-500/30',
    card: 'bg-emerald-950/20 dark:bg-emerald-900/10',
    icon: '👤'
  },
  yellow: {
    header: 'from-amber-600 to-amber-800',
    accent: 'text-amber-400',
    bar: 'bg-amber-500',
    barBg: 'bg-amber-900/30',
    border: 'border-amber-500/30',
    card: 'bg-amber-950/20 dark:bg-amber-900/10',
    icon: '📦'
  },
  red: {
    header: 'from-rose-600 to-rose-800',
    accent: 'text-rose-400',
    bar: 'bg-rose-500',
    barBg: 'bg-rose-900/30',
    border: 'border-rose-500/30',
    card: 'bg-rose-950/20 dark:bg-rose-900/10',
    icon: '⚠️'
  },
  purple: {
    header: 'from-violet-600 to-violet-800',
    accent: 'text-violet-400',
    bar: 'bg-violet-500',
    barBg: 'bg-violet-900/30',
    border: 'border-violet-500/30',
    card: 'bg-violet-950/20 dark:bg-violet-900/10',
    icon: '💰'
  }
};

export function HeadlineParameterCard({
  title,
  shortTitle,
  indexScore,
  instAvg,
  target,
  trend,
  trendValue,
  constituents,
  colorScheme,
  onDrillDown
}: HeadlineParameterCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = colorSchemes[colorScheme];
  const status = getStatusColor(indexScore, target);
  const gap = target - indexScore;

  return (
    <div className={`rounded-xl overflow-hidden border ${colors.border} shadow-lg`}>
      {/* Header */}
      <div className={`bg-gradient-to-br ${colors.header} p-4 text-white`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="text-xs font-medium text-white/70 uppercase tracking-wider">{shortTitle}</p>
            <p className="text-sm font-bold text-white leading-tight mt-0.5">{title}</p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${status.badge} ml-2 flex-shrink-0`}>
            {status.label}
          </span>
        </div>

        {/* Score Display */}
        <div className="flex items-end gap-3 mt-3">
          <div>
            <span className="text-4xl font-black text-white">{indexScore}%</span>
            <span className={`ml-2 text-sm font-medium ${trend === '↑' ? 'text-green-300' : trend === '↓' ? 'text-red-300' : 'text-white/70'}`}>
              {trend} {trendValue}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>0%</span>
            <span>Inst Avg: {instAvg}%</span>
            <span>Target: {target}%</span>
          </div>
          <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
            {/* Institutional avg marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white/50 z-10"
              style={{ left: `${Math.min(instAvg, 100)}%` }}
            />
            {/* Score bar */}
            <div
              className={`h-full ${status.bg} rounded-full transition-all duration-700`}
              style={{ width: `${Math.min(indexScore, 100)}%` }}
            />
          </div>
          {gap > 0 && (
            <p className="text-xs text-red-300 mt-1">↓{gap.toFixed(0)}pp below target</p>
          )}
        </div>
      </div>

      {/* Constituents */}
      <div className={`${colors.card} p-3`}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Constituents</p>
          <div className="flex gap-1">
            {onDrillDown && (
              <button
                onClick={onDrillDown}
                className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Drill ↓
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {expanded ? 'Less' : 'More'}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {constituents.map((c, i) => {
            const ppContribution = (c.score / 100) * c.weight;
            const maxPP = c.weight;
            const isOverachieving = ppContribution > maxPP;
            const barWidth = Math.min((ppContribution / maxPP) * 100, 150);

            return (
              <div key={i} className="group">
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <button
                    onClick={c.onClick}
                    className={`font-medium text-left ${c.onClick ? 'text-blue-600 dark:text-blue-400 hover:underline cursor-pointer' : 'text-gray-700 dark:text-gray-300 cursor-default'}`}
                  >
                    {c.name}
                  </button>
                  <span className={`font-bold ${isOverachieving ? 'text-green-600' : c.score >= 70 ? 'text-green-600' : c.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {ppContribution.toFixed(1)}pp/{maxPP}pp
                  </span>
                </div>

                {/* Mini progress bar */}
                <div className={`h-1.5 ${colors.barBg} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isOverachieving ? 'bg-green-500' : c.score >= 70 ? colors.bar : c.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(barWidth, 100)}%` }}
                  />
                </div>

                {expanded && (
                  <div className="mt-1 flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>Score: <strong className="text-gray-700 dark:text-gray-200">{c.score}%</strong></span>
                    <span>Actual: <strong className="text-gray-700 dark:text-gray-200">{c.actual}</strong></span>
                    <span>Target: <strong className="text-gray-700 dark:text-gray-200">{c.target}</strong></span>
                    {c.instAvg && <span>Inst: <strong className="text-gray-700 dark:text-gray-200">{c.instAvg}</strong></span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison row */}
        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-1 text-center">
          <div>
            <p className="text-xs text-gray-400">Current</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{indexScore}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Inst Avg</p>
            <p className={`text-sm font-bold ${indexScore >= instAvg ? 'text-green-600' : 'text-red-600'}`}>{instAvg}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Target</p>
            <p className="text-sm font-bold text-gray-500">{target}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
