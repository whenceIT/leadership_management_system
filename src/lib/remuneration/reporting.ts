/**
 * Reporting helpers for the remuneration module.
 */

import type { RemunerationStatement } from './types';

export interface CostSummary {
  statements: number;
  managers: number;
  grossPay: number;
  employeeDeductions: number;
  netCashPay: number;
  housing: number;
  benefits: number;
  bonus: number;
  employerCosts: number;
  totalCompanyCost: number;
  totalDirectValue: number;
}

export interface GroupSummary {
  key: string;
  label: string;
  count: number;
  grossPay: number;
  netCashPay: number;
  totalCompanyCost: number;
}

export function summarise(statements: RemunerationStatement[]): CostSummary {
  const round = (value: number) => Math.round(value * 100) / 100;
  const sum = (pick: (s: RemunerationStatement) => number) =>
    round(statements.reduce((total, statement) => total + pick(statement), 0));

  return {
    statements: statements.length,
    managers: new Set(statements.map((s) => s.managerId)).size,
    grossPay: sum((s) => s.grossPay),
    employeeDeductions: sum((s) => s.deductions.total),
    netCashPay: sum((s) => s.netCashPay),
    housing: sum((s) => s.benefits.housing),
    benefits: sum((s) => s.benefits.total),
    bonus: sum((s) => s.bonus.amount),
    employerCosts: sum((s) => s.employerCosts.total),
    totalCompanyCost: sum((s) => s.totalCompanyCost),
    totalDirectValue: sum((s) => s.totalDirectValue),
  };
}

export function groupByRole(statements: RemunerationStatement[]): GroupSummary[] {
  const map = new Map<string, GroupSummary>();
  for (const statement of statements) {
    const key = statement.roleId;
    const existing = map.get(key) ?? {
      key,
      label: statement.roleName,
      count: 0,
      grossPay: 0,
      netCashPay: 0,
      totalCompanyCost: 0,
    };
    existing.count += 1;
    existing.grossPay += statement.grossPay;
    existing.netCashPay += statement.netCashPay;
    existing.totalCompanyCost += statement.totalCompanyCost;
    map.set(key, existing);
  }
  return Array.from(map.values())
    .map((entry) => ({
      ...entry,
      grossPay: Math.round(entry.grossPay),
      netCashPay: Math.round(entry.netCashPay),
      totalCompanyCost: Math.round(entry.totalCompanyCost),
    }))
    .sort((a, b) => b.totalCompanyCost - a.totalCompanyCost);
}

export function groupByTier(statements: RemunerationStatement[]): GroupSummary[] {
  const map = new Map<number, GroupSummary>();
  for (const statement of statements) {
    const tier = statement.qualification.tier ?? 0;
    const existing = map.get(tier) ?? {
      key: `tier-${tier}`,
      label: statement.qualification.label,
      count: 0,
      grossPay: 0,
      netCashPay: 0,
      totalCompanyCost: 0,
    };
    existing.count += 1;
    existing.grossPay += statement.grossPay;
    existing.netCashPay += statement.netCashPay;
    existing.totalCompanyCost += statement.totalCompanyCost;
    map.set(tier, existing);
  }
  return Array.from(map.values())
    .map((entry) => ({
      ...entry,
      grossPay: Math.round(entry.grossPay),
      netCashPay: Math.round(entry.netCashPay),
      totalCompanyCost: Math.round(entry.totalCompanyCost),
    }))
    .sort((a, b) => Number(a.key.split('-')[1]) - Number(b.key.split('-')[1]));
}

function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/** Payroll ready export of the calculated statements. */
export function statementsToCsv(statements: RemunerationStatement[]): string {
  const header = [
    'Period',
    'Manager',
    'Role',
    'Scope',
    'Tier',
    'Approved tier gross',
    'Housing continuity',
    'Gross pay',
    'PAYE',
    'NAPSA',
    'NHIMA',
    'Pension',
    'Employee deductions',
    'Net cash pay',
    'Housing',
    'Travel',
    'Fuel',
    'Life insurance',
    'Total direct value',
    'Employer contributions',
    'Bonus',
    'Total company cost',
    'Status',
    'Approved by',
    'Service gross pay',
    'Service net cash pay',
    'Service company cost',
  ];

  const rows = statements.map((statement) => [
    statement.period,
    statement.managerName,
    statement.roleName,
    statement.scopeLabel,
    statement.qualification.label,
    statement.approvedGrossPay ?? statement.grossPay,
    statement.housing.continuityAdjustment,
    statement.grossPay,
    statement.deductions.paye,
    statement.deductions.napsa,
    statement.deductions.nhima,
    statement.deductions.pension,
    statement.deductions.total,
    statement.netCashPay,
    statement.benefits.housing,
    statement.benefits.travel,
    statement.benefits.fuel,
    statement.benefits.lifeInsurance,
    statement.totalDirectValue,
    statement.employerCosts.total,
    statement.bonus.amount,
    statement.totalCompanyCost,
    statement.status,
    statement.approvedBy ?? '',
    statement.payroll?.grossPay ?? '',
    statement.payroll?.netCashPay ?? '',
    statement.payroll?.totalCompanyCost ?? '',
  ]);

  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
}
