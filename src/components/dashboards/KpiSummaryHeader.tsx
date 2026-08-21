import { getKpiSummary } from '@/lib/kpiSummaries';

export function KpiSummaryHeader({
  kpi,
  onInfoClick,
  showInfo,
}: {
  kpi: string | null;
  onInfoClick?: () => void;
  showInfo?: boolean;
}) {
  const info = getKpiSummary(kpi);

  const directionBadge =
    info.direction === 'higher'
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';

  const directionText =
    info.direction === 'higher' ? '↑ Higher is better' : '↓ Lower is better';

  return (
    <div className="mt-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3 py-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
          <span className="font-semibold text-gray-700 dark:text-gray-200">{info.label}:</span>{' '}
          {info.summary}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${directionBadge}`}
          >
            {directionText}
          </span>
          <span className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
            Target: {info.target}
          </span>
          {onInfoClick && (
            <button
              onClick={onInfoClick}
              title="KPI Information"
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 transition-all duration-200 ${
                showInfo
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.5 11.5a3.5 3.5 0 1 1 3.163-5H14L15.5 8 14 9.5l-1-1-1 1-1-1-1 1-1-1-1 1-1-1-1 1H6.663a3.5 3.5 0 0 1-3.163 2M2.5 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
              </svg>
              <span className="text-xs font-medium">Key</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
