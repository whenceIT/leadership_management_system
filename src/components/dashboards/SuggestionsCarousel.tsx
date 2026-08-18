'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Suggestion } from '@/lib/kpiThresholds';

interface SuggestionsCarouselProps {
  suggestions: Suggestion[];
  autoSlideInterval?: number;
  isLoading?: boolean;
}

export default function SuggestionsCarousel({ suggestions, autoSlideInterval = 4000, isLoading = false }: SuggestionsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const visibleSuggestions = suggestions.filter(
    (s) => s.severity === 'critical' || s.severity === 'warning' || s.severity === 'info'
  );

  const goTo = useCallback((index: number) => {
    setCurrentIndex((index + visibleSuggestions.length) % visibleSuggestions.length);
  }, [visibleSuggestions.length]);

  const goNext = useCallback(() => {
    goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  const goPrev = useCallback(() => {
    goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  useEffect(() => {
    if (visibleSuggestions.length <= 1 || isPaused) return;
    const timer = setInterval(goNext, autoSlideInterval);
    return () => clearInterval(timer);
  }, [visibleSuggestions.length, isPaused, autoSlideInterval, goNext]);

  if (visibleSuggestions.length === 0 && !isLoading) return null;

  const current = visibleSuggestions[currentIndex];

  const severityStyles: Record<string, string> = {
    critical: 'border-red-500 bg-red-50 dark:bg-red-900/10',
    warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
    info: 'border-blue-500 bg-blue-50 dark:bg-blue-900/10',
  };

  const severityIcons: Record<string, string> = {
    critical: '🔴',
    warning: '🟠',
    info: '🔵',
  };

  if (isLoading) {
    return (
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-purple-200 dark:border-purple-800"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-400">
            🎯 KPI THRESHOLD SUGGESTIONS
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">calc..</span>
          </div>
        </div>
        <div className="p-3 rounded-lg border-l-4 border-gray-200 dark:border-gray-700">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-purple-200 dark:border-purple-800"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-400">
          🎯 KPI THRESHOLD SUGGESTIONS
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {currentIndex + 1} / {visibleSuggestions.length}
          </span>
          <button
            onClick={goPrev}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            title="Previous"
          >
            ◀
          </button>
          <button
            onClick={goNext}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            title="Next"
          >
            ▶
          </button>
        </div>
      </div>

      <div className={`p-3 rounded-lg border-l-4 ${severityStyles[current.severity] || severityStyles.info}`}>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {severityIcons[current.severity] || '🟢'} {current.metric}
              <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                {current.actual} vs target {current.target}
              </span>
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{current.finding}</p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
              <span className="font-medium">Recommendation:</span> {current.recommendation}
            </p>
            {current.details && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{current.details}</p>
            )}
            {current.location && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                📍 {current.location.provinceName ? `${current.location.provinceName} Province` : ''}
                {current.location.districtName ? ` > ${current.location.districtName}` : ''}
                {current.location.branchName ? ` > ${current.location.branchName}` : ''}
              </p>
            )}
          </div>
          {current.severity !== 'info' && (
            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {current.severity}
            </span>
          )}
        </div>

        {current.consultantAttribution && current.consultantAttribution.length > 0 && (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-xs text-gray-600 dark:text-gray-400">
              <thead>
                <tr>
                  <th className="text-left px-2 py-1">Consultant</th>
                  <th className="text-left px-2 py-1">Issue</th>
                </tr>
              </thead>
              <tbody>
                {current.consultantAttribution.map((a, i) => (
                  <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-2 py-1">{a.consultantName || `Consultant ${a.consultantId}`}</td>
                    <td className="px-2 py-1">{a.issue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {visibleSuggestions.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          {visibleSuggestions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-purple-600 dark:bg-purple-400 w-4'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              title={`Suggestion ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
