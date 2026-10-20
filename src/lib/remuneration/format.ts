/**
 * Shared display helpers for the remuneration module.
 */

export function formatZMW(value: number | null | undefined, options?: { decimals?: boolean }): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const decimals = options?.decimals ?? false;
  return `K ${value.toLocaleString('en-ZM', {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  })}`;
}

export function formatCompactZMW(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `K ${(value / 1_000_000).toFixed(2)}m`;
  if (abs >= 1_000) return `K ${(value / 1_000).toFixed(1)}k`;
  return `K ${value.toLocaleString('en-ZM', { maximumFractionDigits: 0 })}`;
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${value.toFixed(decimals)}%`;
}

export function formatMonth(period: string | null | undefined): string {
  if (!period) return '—';
  const [year, month] = period.split('-');
  const index = Number(month) - 1;
  if (Number.isNaN(index) || index < 0 || index > 11) return period;
  const date = new Date(Number(year), index, 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function periodList(count = 12): string[] {
  const periods: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }
  return periods;
}

export function tierTone(tier: number | null): 'primary' | 'success' | 'warning' | 'error' | 'light' {
  switch (tier) {
    case 1:
      return 'primary';
    case 2:
      return 'success';
    case 3:
      return 'warning';
    case 4:
    case 5:
    case 6:
      return 'light';
    default:
      return 'error';
  }
}

export function severityTone(
  severity: 'error' | 'warning' | 'info'
): 'error' | 'warning' | 'info' {
  return severity;
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
