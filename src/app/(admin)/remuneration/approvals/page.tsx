'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { StatementPanel } from '@/components/remuneration/StatementPanel';
import {
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SectionCard,
  StatusBadge,
  TierBadge,
  inputClass,
} from '@/components/remuneration/ui';
import { currentPeriod, formatMonth, formatZMW, initialsOf, periodList } from '@/lib/remuneration/format';
import type { AuditEntry, RemunerationStatement, StatementStatus } from '@/lib/remuneration/types';
import {
  fetchStatementDetail,
  fetchStatements,
  updateStatementStatus,
  type ServiceAssessment,
} from '@/services/RemunerationService';

const FILTERS: { key: StatementStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending_approval', label: 'Pending approval' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'finalised', label: 'Finalised' },
  { key: 'draft', label: 'Drafts' },
];

export default function RemunerationApprovalsPage() {
  const [statements, setStatements] = useState<RemunerationStatement[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
    finalised: 0,
  });
  const [period, setPeriod] = useState(currentPeriod());
  const [filter, setFilter] = useState<StatementStatus | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [assessments, setAssessments] = useState<ServiceAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(
    async (activePeriod: string, activeFilter: StatementStatus | 'all') => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchStatements({
          period: activePeriod || undefined,
          status: activeFilter === 'all' ? undefined : activeFilter,
        });
        setStatements(response.statements);
        setCounts(response.counts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load the approval queue.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    load(period, filter);
  }, [load, period, filter]);

  const selected = useMemo(
    () => statements.find((statement) => statement.id === selectedId) ?? null,
    [statements, selectedId]
  );

  useEffect(() => {
    if (!selectedId) {
      setAudit([]);
      setAssessments([]);
      return;
    }
    let active = true;
    setDetailLoading(true);
    fetchStatementDetail(selectedId)
      .then((response) => {
        if (active) {
          setAudit(response.audit);
          setAssessments(response.assessments ?? []);
        }
      })
      .catch(() => {
        if (active) {
          setAudit([]);
          setAssessments([]);
        }
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedId, statements]);

  const act = async (status: StatementStatus) => {
    if (!selectedId) return;
    setWorking(true);
    setError(null);
    try {
      await updateStatementStatus(selectedId, {
        status,
        reason: rejectReason || undefined,
        actor: 'Administrator',
      });
      setNotice(
        status === 'approved'
          ? 'Statement approved and recorded in the audit trail.'
          : status === 'rejected'
          ? 'Statement rejected. The reason is recorded for audit.'
          : 'Statement finalised for payroll.'
      );
      setRejectReason('');
      await load(period, filter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update the statement.');
    } finally {
      setWorking(false);
    }
  };

  /* An unresolved error blocks the approval: the statement has to be
   * recalculated on a confirmed tier or a verified result first. */
  const blockingErrors = useMemo(
    () => (selected?.flags ?? []).filter((flag) => flag.severity === 'error'),
    [selected]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Managerial remuneration"
        title="Approval workflow"
        description="Verify the calculation, approve the figures and finalise them for payroll. Every action is written to the audit trail with the actor and the time."
        actions={
          <>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="">All periods</option>
              {periodList(18).map((item) => (
                <option key={item} value={item}>
                  {formatMonth(item)}
                </option>
              ))}
            </select>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as StatementStatus | 'all')}
              className="rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            >
              {FILTERS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </>
        }
      />

      {notice ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {notice}
        </div>
      ) : null}

      {error ? <ErrorState message={error} onRetry={() => load(period, filter)} /> : null}

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside>
          <SectionCard
            title="Queue"
            description={`${counts.pendingApproval} awaiting approval · ${counts.approved} approved · ${counts.finalised} finalised`}
          >
            {loading ? (
              <LoadingState label="Loading statements…" />
            ) : statements.length === 0 ? (
              <EmptyState
                title="Nothing to review"
                description="Statements submitted from the calculator appear here for approval."
              />
            ) : (
              <ul className="max-h-[600px] space-y-2 overflow-y-auto pr-1">
                {statements.map((statement) => (
                  <li key={statement.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(statement.id);
                        setNotice(null);
                      }}
                      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        selectedId === statement.id
                          ? 'border-brand-300 bg-brand-50/60 dark:border-brand-500/40 dark:bg-brand-500/10'
                          : 'border-gray-200 hover:border-brand-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40'
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                        {initialsOf(statement.managerName)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {statement.managerName}
                          </span>
                          <StatusBadge status={statement.status} />
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
                          {statement.roleName} · {statement.scopeLabel}
                        </span>
                        <span className="mt-1.5 flex items-center gap-2">
                          <TierBadge
                            tier={statement.qualification.tier}
                            label={statement.qualification.label}
                            proposed={statement.qualification.status === 'proposed'}
                          />
                          <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">
                            Net {formatZMW(statement.netCashPay)}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </aside>

        <div className="min-w-0 space-y-6">
          {selected ? (
            <>
              <SectionCard
                title={`${selected.managerName} — ${selected.roleName}`}
                description={`${selected.scopeLabel} · ${formatMonth(selected.period)} · prepared by ${selected.createdBy}`}
                actions={
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={selected.status} />
                    <TierBadge
                      tier={selected.qualification.tier}
                      label={selected.qualification.label}
                      proposed={selected.qualification.status === 'proposed'}
                    />
                  </div>
                }
              >
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Qualification
                    </dt>
                    <dd className="mt-1 text-sm text-gray-800 dark:text-gray-100">
                      {selected.qualification.reason}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Net cash pay
                    </dt>
                    <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                      {formatZMW(selected.netCashPay)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Company cost
                    </dt>
                    <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                      {formatZMW(selected.totalCompanyCost)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Last updated
                    </dt>
                    <dd className="mt-1 text-sm text-gray-800 dark:text-gray-100">
                      {new Date(selected.updatedAt).toLocaleString('en-GB')}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-wrap items-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-700">
                  {blockingErrors.length > 0 ? (
                    <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                      <p className="font-semibold">
                        This statement cannot be approved or finalised while{' '}
                        {blockingErrors.length > 1
                          ? `${blockingErrors.length} validation errors stand`
                          : 'a validation error stands'}
                        .
                      </p>
                      <ul className="mt-1 list-disc space-y-0.5 pl-5">
                        {blockingErrors.map((flag) => (
                          <li key={flag.code}>{flag.message}</li>
                        ))}
                      </ul>
                      <p className="mt-1">
                        Correct the underlying result and recalculate the statement before it goes
                        to payroll.
                      </p>
                    </div>
                  ) : null}
                  {selected.status !== 'finalised' ? (
                    <div className="min-w-[260px] flex-1">
                      <Field
                        label="Rejection reason"
                        hint="Required when rejecting. Recorded against the statement."
                      >
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(event) => setRejectReason(event.target.value)}
                          placeholder="e.g. Performance result not verified by internal audit"
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-3">
                    {selected.status === 'pending_approval' ? (
                      <>
                        <SecondaryButton onClick={() => act('rejected')} disabled={working}>
                          Reject
                        </SecondaryButton>
                        <PrimaryButton
                          onClick={() => act('approved')}
                          disabled={working || blockingErrors.length > 0}
                        >
                          Approve
                        </PrimaryButton>
                      </>
                    ) : null}
                    {selected.status === 'approved' ? (
                      <PrimaryButton
                        onClick={() => act('finalised')}
                        disabled={working || blockingErrors.length > 0}
                      >
                        Finalise for payroll
                      </PrimaryButton>
                    ) : null}
                    {selected.status === 'rejected' ? (
                      <PrimaryButton onClick={() => act('pending_approval')} disabled={working}>
                        Return for review
                      </PrimaryButton>
                    ) : null}
                    {selected.status === 'draft' ? (
                      <PrimaryButton onClick={() => act('pending_approval')} disabled={working}>
                        Submit for approval
                      </PrimaryButton>
                    ) : null}
                  </div>
                </div>
              </SectionCard>

              <StatementPanel computation={selected} />

              <SectionCard
                title="Remuneration service assessment"
                description="The monthly assessment recorded in the remuneration service for this manager's assignment."
              >
                {detailLoading ? (
                  <LoadingState label="Loading the service assessment…" />
                ) : assessments.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No assessment recorded in the remuneration service yet. Approving the
                    statement records the decision there.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {assessments.map((assessment) => (
                      <li
                        key={assessment.id}
                        className="rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {assessment.assessment_period}
                          </p>
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700 dark:bg-white/10 dark:text-gray-300">
                            {assessment.assessment_status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {assessment.achievement_percentage !== null
                            ? `Achievement ${assessment.achievement_percentage}%`
                            : 'Achievement not recorded'}
                          {assessment.decision ? ` · Decision: ${assessment.decision}` : ''}
                        </p>
                        {assessment.decision_notes ? (
                          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                            {assessment.decision_notes}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>

              <SectionCard
                title="Audit trail"
                description="Who changed a rule, who verified the performance, who approved the calculation and when."
              >
                {detailLoading ? (
                  <LoadingState label="Loading the audit trail…" />
                ) : audit.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No audit entries recorded for this statement yet.
                  </p>
                ) : (
                  <ol className="space-y-3">
                    {audit.map((entry) => (
                      <li key={entry.id} className="flex gap-3">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-400" />
                        <div>
                          <p className="text-sm text-gray-800 dark:text-gray-100">{entry.detail}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {entry.actor} · {entry.action} ·{' '}
                            {new Date(entry.at).toLocaleString('en-GB')}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </SectionCard>
            </>
          ) : (
            <SectionCard title="Statement" description="Select a statement from the queue to review it.">
              <EmptyState
                title="No statement selected"
                description="Choose a statement from the queue to review the calculation, approve the figures and finalise them for payroll."
              />
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
