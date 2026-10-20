'use client';

import React from 'react';

import type {
  StatementStatus,
  ValidationFlag,
  ValidationSeverity,
} from '@/lib/remuneration/types';

/* -------------------------------------------------------------------------- */
/* Page header                                                                 */
/* -------------------------------------------------------------------------- */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-500">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Metric card                                                                 */
/* -------------------------------------------------------------------------- */

export function MetricCard({
  label,
  value,
  hint,
  tone = 'default',
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'brand' | 'positive' | 'warning';
  icon?: React.ReactNode;
}) {
  const toneClasses = {
    default: 'text-gray-900 dark:text-white',
    brand: 'text-brand-500',
    positive: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
  } as const;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </p>
        {icon ? <span className="text-gray-300 dark:text-gray-600">{icon}</span> : null}
      </div>
      <p className={`mt-3 text-2xl font-bold ${toneClasses[tone]}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Badges                                                                      */
/* -------------------------------------------------------------------------- */

const TIER_CLASSES: Record<number, string> = {
  1: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  2: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  3: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  4: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200',
  5: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200',
  6: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200',
};

export function TierBadge({
  tier,
  label,
  proposed,
}: {
  tier: number | null;
  label?: string;
  proposed?: boolean;
}) {
  const text = label ?? (tier ? `Tier ${tier}` : 'Not qualified');
  const classes =
    tier && TIER_CLASSES[tier]
      ? TIER_CLASSES[tier]
      : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${classes}`}
      >
        {text}
      </span>
      {proposed ? (
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
          Proposed
        </span>
      ) : null}
    </span>
  );
}

const STATUS_CLASSES: Record<StatementStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300',
  pending_approval: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  approved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  finalised: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
};

export function StatusBadge({ status }: { status: StatementStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        STATUS_CLASSES[status] ?? STATUS_CLASSES.draft
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Section                                                                     */
/* -------------------------------------------------------------------------- */

export function SectionCard({
  title,
  description,
  actions,
  children,
  className = '',
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Money rows                                                                  */
/* -------------------------------------------------------------------------- */

export function MoneyRow({
  label,
  amount,
  tone = 'default',
  hint,
  strong,
}: {
  label: string;
  amount: string;
  tone?: 'default' | 'deduction' | 'total' | 'positive';
  hint?: string;
  strong?: boolean;
}) {
  const tones = {
    default: 'text-gray-700 dark:text-gray-300',
    deduction: 'text-red-600 dark:text-red-400',
    total: 'text-gray-900 dark:text-white',
    positive: 'text-emerald-600 dark:text-emerald-400',
  } as const;

  return (
    <div
      className={`flex items-start justify-between gap-6 py-2.5 ${
        strong ? 'border-t border-gray-200 dark:border-gray-700' : ''
      }`}
    >
      <div className="min-w-0">
        <p
          className={`text-sm ${strong ? 'font-semibold' : 'font-medium'} ${
            strong ? tones.total : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          {label}
        </p>
        {hint ? <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{hint}</p> : null}
      </div>
      <p
        className={`shrink-0 text-sm tabular-nums ${strong ? 'font-bold text-base' : 'font-medium'} ${
          tones[tone]
        }`}
      >
        {amount}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Validation flags                                                            */
/* -------------------------------------------------------------------------- */

const SEVERITY_CLASSES: Record<ValidationSeverity, string> = {
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200',
  warning:
    'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
  info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200',
};

const SEVERITY_LABELS: Record<ValidationSeverity, string> = {
  error: 'Must fix',
  warning: 'Review',
  info: 'Note',
};

export function FlagList({ flags }: { flags: ValidationFlag[] }) {
  if (!flags.length) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
        <CheckCircleIcon />
        No validation issues. This statement is ready for approval.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {flags.map((flag, index) => (
        <li
          key={`${flag.code}-${index}`}
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${SEVERITY_CLASSES[flag.severity]}`}
        >
          <span className="mt-0.5 shrink-0">
            {flag.severity === 'error' ? (
              <AlertIcon />
            ) : flag.severity === 'warning' ? (
              <WarningIcon />
            ) : (
              <InfoIcon />
            )}
          </span>
          <span className="min-w-0">
            <span className="mr-2 rounded bg-white/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide dark:bg-black/20">
              {SEVERITY_LABELS[flag.severity]}
            </span>
            {flag.message}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/* Icons                                                                       */
/* -------------------------------------------------------------------------- */

export function CheckCircleIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export function AlertIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  );
}

export function WarningIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export function InfoIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* States                                                                      */
/* -------------------------------------------------------------------------- */

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-gray-500 dark:text-gray-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center dark:border-red-500/30 dark:bg-red-500/10">
      <p className="text-sm font-medium text-red-800 dark:text-red-200">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center dark:border-gray-700">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Form controls                                                               */
/* -------------------------------------------------------------------------- */

export const inputClass =
  'w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white';

export const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-gray-400 dark:text-gray-500">{hint}</span> : null}
    </label>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  type = 'button',
  disabled,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 ${className}`}
    >
      {children}
    </button>
  );
}
