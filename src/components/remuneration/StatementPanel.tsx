'use client';

import React from 'react';

import { formatZMW, formatPercent } from '@/lib/remuneration/format';
import type { RemunerationComputation } from '@/lib/remuneration/types';
import { FlagList, MoneyRow, SectionCard, TierBadge } from './ui';

function AllowanceMemo({ computation }: { computation: RemunerationComputation }) {
  const { travel, fuel, includedInGross } = computation.benefits;
  if (!includedInGross) return null;
  return (
    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
      Travel {formatZMW(travel)}
      {fuel ? ` and fuel ${formatZMW(fuel)}` : ''} are already inside gross pay and are
      not added again.
    </p>
  );
}

export function StatementPanel({
  computation,
  showReference = true,
}: {
  computation: RemunerationComputation;
  showReference?: boolean;
}) {
  const { deductions, benefits, employerCosts, housing, bonus, qualification, reference } =
    computation;

  const errors = computation.flags.filter((flag) => flag.severity === 'error').length;

  return (
    <div className="space-y-6">
      <SectionCard
        title="Monthly remuneration statement"
        description={`${computation.roleName} · ${computation.period}`}
        actions={
          <div className="flex items-center gap-2">
            <TierBadge
              tier={qualification.tier}
              label={qualification.label}
              proposed={qualification.status === 'proposed'}
            />
          </div>
        }
      >
        <div className="grid gap-8 lg:grid-cols-2">
          {/* ------------------------- Employee view ------------------------- */}
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
              What the manager receives
            </h3>
            <MoneyRow
              label="Approved tier gross"
              amount={formatZMW(computation.approvedGrossPay ?? computation.grossPay)}
              hint="The gross pay attached to the qualifying tier in the approved structure."
            />
            {housing.continuityApplied ? (
              <MoneyRow
                label="Less housing continuity"
                amount={`− ${formatZMW(housing.continuityAdjustment)}`}
                tone="deduction"
                hint={housing.note}
              />
            ) : null}
            <MoneyRow label="Gross pay" amount={formatZMW(computation.grossPay)} strong />
            <AllowanceMemo computation={computation} />
            <div className="mt-2 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-900/60">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Less employee deductions
              </p>
              <MoneyRow label="PAYE" amount={`− ${formatZMW(deductions.paye)}`} tone="deduction" />
              <MoneyRow label="NAPSA" amount={`− ${formatZMW(deductions.napsa)}`} tone="deduction" />
              <MoneyRow label="NHIMA" amount={`− ${formatZMW(deductions.nhima)}`} tone="deduction" />
              <MoneyRow label="Pension contribution" amount={`− ${formatZMW(deductions.pension)}`} tone="deduction" />
              <MoneyRow
                label="Total employee deductions"
                amount={`− ${formatZMW(deductions.total)}`}
                tone="deduction"
                strong
              />
            </div>
            <MoneyRow
              label="Net cash pay"
              amount={formatZMW(computation.netCashPay)}
              tone="positive"
              strong
              hint="Deposited to the manager's bank account."
            />
            <MoneyRow
              label="Housing paid to landlord"
              amount={formatZMW(benefits.housing)}
              hint={housing.note}
            />
            <MoneyRow
              label="Total direct value"
              amount={formatZMW(computation.totalDirectValue)}
              strong
              hint="Cash received plus the housing the company pays on the manager's behalf."
            />
          </div>

          {/* -------------------------- Company view ------------------------- */}
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
              What it costs the company
            </h3>
            <MoneyRow label="Gross pay" amount={formatZMW(computation.grossPay)} />
            <div className="mt-2 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-900/60">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Employer contributions
              </p>              <MoneyRow label="NAPSA (employer)" amount={formatZMW(employerCosts.napsa)} />
              <MoneyRow label="NHIMA (employer)" amount={formatZMW(employerCosts.nhima)} />
              <MoneyRow label="Pension (employer)" amount={formatZMW(employerCosts.pension)} />
              <MoneyRow
                label="Total employer contributions"
                amount={formatZMW(employerCosts.total)}
                strong
              />
            </div>
            <MoneyRow
              label="Housing paid to landlord"
              amount={formatZMW(benefits.housing)}
              hint="Non-taxable benefit in kind, paid directly to the landlord."
            />
            {benefits.lifeInsurance ? (
              <MoneyRow
                label="Life insurance"
                amount={formatZMW(benefits.lifeInsurance)}
                hint="Employer paid benefit, outside gross pay."
              />
            ) : null}
            {benefits.medical ? (
              <MoneyRow
                label="Medical scheme"
                amount={formatZMW(benefits.medical)}
                hint="Employer paid benefit, outside gross pay."
              />
            ) : null}
            <MoneyRow
              label="Total monthly cost to company"
              amount={formatZMW(computation.totalCompanyCost)}
              strong
            />

            {bonus.ruleCode ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  {bonus.label}
                </p>
                <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">{bonus.reason}</p>
                <ul className="mt-3 space-y-1">
                  {bonus.conditions.map((condition) => (
                    <li
                      key={condition.code}
                      className="flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-100"
                    >
                      <span>{condition.label}</span>
                      <span className="font-semibold tabular-nums">
                        {condition.value === null ? 'Not provided' : formatPercent(condition.value)}
                        {' · '}
                        {condition.met ? 'Met' : 'Outstanding'}
                      </span>
                    </li>
                  ))}
                </ul>
                {bonus.eligible ? (
                  <p className="mt-3 text-sm font-bold text-amber-900 dark:text-amber-100">
                    Accrued bonus {formatZMW(bonus.amount)}
                    {bonus.payableOn ? ` · ${bonus.payableOn}` : ''}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Validation"
        description={
          errors
            ? `${errors} item${errors > 1 ? 's' : ''} must be resolved before payroll.`
            : 'Clearance status for this statement.'
        }
      >
        <FlagList flags={computation.flags} />
      </SectionCard>

      {showReference ? (
        <SectionCard
          title="Reconciliation against the remuneration guide"
          description="The guide prints illustrative amounts. The engine applies the approved rules instead, so a variance is expected and is shown here."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Net cash pay
              </p>
              <p className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                {formatZMW(computation.netCashPay)}
              </p>
              {reference.netPay !== null ? (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Guide reference {formatZMW(reference.netPay)} · variance{' '}
                  {reference.netVariance !== null ? formatZMW(reference.netVariance) : '—'}
                  {reference.netVariancePct !== null
                    ? ` (${reference.netVariancePct > 0 ? '+' : ''}${formatPercent(reference.netVariancePct)})`
                    : ''}
                </p>
              ) : null}
            </div>
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Total company cost
              </p>
              <p className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                {formatZMW(computation.totalCompanyCost)}
              </p>
              {reference.totalCompanyCost !== null ? (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Guide reference {formatZMW(reference.totalCompanyCost)} · variance{' '}
                  {reference.costVariance !== null ? formatZMW(reference.costVariance) : '—'}
                  {reference.costVariancePct !== null
                    ? ` (${reference.costVariancePct > 0 ? '+' : ''}${formatPercent(reference.costVariancePct)})`
                    : ''}
                </p>
              ) : null}
            </div>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
