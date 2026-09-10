import { BranchPerformance } from '@/services/ProvincialDataService';
import { OfficeUser } from '@/services/OfficeUserService';
import { Office } from '@/types/dashboard';
import {
  Suggestion,
  SuggestionLocation,
  SuggestionSeverity,
  BranchAttribution,
  ConsultantAttribution,
  MetricKey,
} from '@/lib/kpiThresholds';

export interface MetricMeasurement {
  metric: MetricKey;
  actualLcsPerOffice?: number;
  avgDisbursement?: number;
  vacancies?: number;
  vacanciesPerOffice?: number;
  portfolioPerLc?: number;
  normalizedScore?: number;
  target?: number;
  threshold?: number;
  userLevel?: 'institution' | 'province' | 'district' | 'branch' | 'consultant';
  location?: SuggestionLocation;
  officeName?: string;
  branchPerformances?: BranchPerformance[];
  offices?: Office[];
  officeUsers?: OfficeUser[];
}

export interface ServiceContext {
  userLevel: 'institution' | 'province' | 'district' | 'branch' | 'consultant';
  branchPerformances?: BranchPerformance[];
  offices?: Office[];
  officeUsers?: OfficeUser[];
}

export function parseNumber(value: any): number | null {
  if (value === undefined || value === null || value === '--') return null;
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }
  let str = String(value).trim();
  if (!str) return null;
  if (/^K/i.test(str)) str = str.slice(1);
  str = str.replace(/,/g, '');
  const m = str.match(/^(-?\d+(?:\.\d+)?)\s*([KM]?)$/i);
  if (m) {
    const num = parseFloat(m[1]);
    const suffix = m[2].toUpperCase();
    if (isNaN(num)) return null;
    if (suffix === 'M') return num * 1_000_000;
    if (suffix === 'K') return num * 1000;
    return num;
  }
  const match = str.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const num = parseFloat(match[0]);
  return isNaN(num) ? null : num;
}

export function resolveScore(data: any): number | null {
  if (!data) return null;
  const raw = data.normalized_score ?? data.average_normalized_score;
  if (raw === undefined || raw === null) return null;
  const num = parseNumber(raw);
  if (num === null) return null;
  if (num < 0 || num > 100) return null;
  return num;
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function evaluateStaffAdequacy(m: MetricMeasurement): Suggestion | null {
  if (m.actualLcsPerOffice === undefined) return null;
  const lcsPerOffice = m.actualLcsPerOffice;
  const score = m.normalizedScore;
  const target = m.target ?? 11;
  const lowThreshold = m.threshold ?? 10;
  const highThreshold = 12;
  const optimalRange: [number, number] = [lowThreshold, highThreshold];

  if (lcsPerOffice < lowThreshold) {
    const gap = lowThreshold - lcsPerOffice;
    const sev: SuggestionSeverity = score !== undefined && score < (m.target ?? 76) ? 'critical' : 'warning';
    return {
      id: uid('staff-adeq'),
      severity: sev,
      metric: 'Staff Adequacy Score',
      target: `${optimalRange[0]}-${optimalRange[1]} LCs per office`,
      actual: `${lcsPerOffice.toFixed(1)} LCs per office`,
      finding: `Average LC headcount is ${lcsPerOffice.toFixed(1)} per office, below the ${optimalRange[0]}-${optimalRange[1]} target band.`,
      recommendation: `Recruit ~${Math.ceil(gap)} additional loan consultant(s) per office to reach the ${optimalRange[0]}-${optimalRange[1]} target band.`,
      location: m.location,
      details: score !== undefined ? `Normalized score: ${score.toFixed(0)}%` : undefined,
      attribution: buildStaffAdequacyAttribution(m),
    };
  }

  if (lcsPerOffice > highThreshold) {
    const over = lcsPerOffice - highThreshold;
    return {
      id: uid('staff-adeq'),
      severity: 'info',
      metric: 'Staff Adequacy Score',
      target: `${optimalRange[0]}-${optimalRange[1]} LCs per office`,
      actual: `${lcsPerOffice.toFixed(1)} LCs per office`,
      finding: `Average LC headcount is ${lcsPerOffice.toFixed(1)} per office, above the ${optimalRange[1]} upper bound (potential over-staffing).`,
      recommendation: `Review LC allocation — ${over.toFixed(1)} head(s) above the optimal ceiling. Re-balance workload or convert surplus capacity to productivity initiatives.`,
      location: m.location,
      details: score !== undefined ? `Normalized score: ${score.toFixed(0)}%` : undefined,
    };
  }

  return null;
}

export function evaluateProductivity(m: MetricMeasurement): Suggestion | null {
  if (m.avgDisbursement === undefined) return null;
  const avg = m.avgDisbursement;
  const target = m.target ?? 40000;
  const lowThreshold = m.threshold ?? 40000;

  if (avg < lowThreshold) {
    const gap = lowThreshold - avg;
    return {
      id: uid('prod'),
      severity: avg < lowThreshold ? 'critical' : 'good',
      metric: 'Productivity Achievement',
      target: `Avg disbursement ≥ K${target.toLocaleString()} per LC user`,
      actual: `Avg disbursement K${avg.toLocaleString()} per LC user`,
      finding: `Average disbursement per LC user (K${avg.toLocaleString()}) is below the K${target.toLocaleString()} target.`,
      recommendation: `Gap to target: K${gap.toLocaleString()} per LC. Coach under-performing loan consultants on client acquisition and portfolio growth, and review client-product mix in lower-yield branches.`,
      location: m.location,
      attribution: buildProductivityAttribution(m, target),
    };
  }

  return null;
}

export function evaluateVacancyImpact(m: MetricMeasurement): Suggestion | null {
  const vac = m.vacancies ?? 0;
  if (vac === 0 && m.vacanciesPerOffice === undefined) return null;
  const total = vac;
  const target = m.target ?? 0;

  if (total > 0) {
    return {
      id: uid('vacancy'),
      severity: total > 0 ? 'critical' : 'good',
      metric: 'Vacancy Impact',
      target: `${target} vacancies per office (fill all authorized positions)`,
      actual: `${total} vacancy/ies`,
      finding: `There ${total === 1 ? 'is' : 'are'} ${total} vacanc${total === 1 ? 'y' : 'ies'} — office capacity exceeds the total LC users.`,
      recommendation: `Initiate targeted recruitment to fill the ${total} authorized LC position(s). Prioritise high-capacity branches where user_count is below branch capacity.`,
      location: m.location,
      details: m.vacanciesPerOffice !== undefined ? `Vacancies per office: ${m.vacanciesPerOffice.toFixed(1)}` : undefined,
      attribution: buildVacancyAttribution(m),
    };
  }

  return null;
}

export function evaluatePortfolioLoad(m: MetricMeasurement): Suggestion | null {
  if (m.portfolioPerLc === undefined) return null;
  const val = m.portfolioPerLc;
  const lowThreshold = m.threshold ?? 300000;
  const highThreshold = m.threshold ? m.threshold * 1.2 : 380000;

  if (val < lowThreshold) {
    const gap = lowThreshold - val;
    return {
      id: uid('port'),
      severity: 'warning',
      metric: 'Portfolio Load Balance',
      target: `K${(lowThreshold / 1000).toFixed(0)}K-K${(highThreshold / 1000).toFixed(0)}K per LC user`,
      actual: `K${val.toLocaleString()} per LC user`,
      finding: `Outstanding portfolio per LC user (K${val.toLocaleString()}) is below the optimal K${(lowThreshold / 1000).toFixed(0)}K floor — LCs are under-utilised.`,
      recommendation: `Close the K${gap.toLocaleString()} gap per LC through cross-selling, client up-lift and portfolio expansion campaigns.`,
      location: m.location,
      attribution: buildPortfolioAttribution(m, val, true),
    };
  }

  if (val > highThreshold) {
    const over = val - highThreshold;
    return {
      id: uid('port'),
      severity: 'critical',
      metric: 'Portfolio Load Balance',
      target: `K${(lowThreshold / 1000).toFixed(0)}K-K${(highThreshold / 1000).toFixed(0)}K per LC user`,
      actual: `K${val.toLocaleString()} per LC user`,
      finding: `Outstanding portfolio per LC user (K${val.toLocaleString()}) exceeds the optimal K${(highThreshold / 1000).toFixed(0)}K ceiling — over-loaded / going concern.`,
      recommendation: `Reduce the K${over.toLocaleString()} per-LC exposure by re-balancing clients, approving top-ups for existing borrowers, or re-assigning accounts to under-utilised consultants.`,
      location: m.location,
      attribution: buildPortfolioAttribution(m, val, false),
    };
  }

  return null;
}

function buildStaffAdequacyAttribution(m: MetricMeasurement): BranchAttribution[] | undefined {
  if (!m.branchPerformances) return undefined;
  const lowThreshold = m.threshold ?? 10;
  const highThreshold = 12;
  const out: BranchAttribution[] = [];
  for (const b of m.branchPerformances) {
    const actualLcs = b.staff_count ?? 0;
    if (actualLcs < lowThreshold) {
      out.push({
        branchId: b.branch_id,
        branchName: b.branch_name,
        actualLcs,
        issues: [`understaffed (${actualLcs} LCs, below ${lowThreshold})`],
      });
    } else if (actualLcs > highThreshold) {
      out.push({
        branchId: b.branch_id,
        branchName: b.branch_name,
        actualLcs,
        issues: [`over-staffed (${actualLcs} LCs, above ${highThreshold})`],
      });
    }
  }
  return out.length ? out : undefined;
}

function buildVacancyAttribution(m: MetricMeasurement): BranchAttribution[] | undefined {
  if (!m.offices) return undefined;
  const out: BranchAttribution[] = [];
  for (const o of m.offices) {
    const capacity = parseNumber(o.branchCapacity);
    const userCount = typeof o.user_count === 'number' ? o.user_count : 0;
    if (capacity !== null && userCount < capacity) {
      const vac = capacity - userCount;
      out.push({
        branchId: o.id,
        branchName: o.name,
        vacancies: vac,
        issues: [`vacant positions: ${vac} (capacity ${capacity}, users ${userCount})`],
      });
    }
  }
  return out.length ? out : undefined;
}

function buildProductivityAttribution(m: MetricMeasurement, threshold: number): BranchAttribution[] | undefined {
  if (!m.branchPerformances) return undefined;
  const out: BranchAttribution[] = [];
  for (const b of m.branchPerformances) {
    const staff = b.staff_count ?? 0;
    const total = b.disbursements?.total ?? 0;
    if (staff > 0 && total > 0) {
      const avg = total / staff;
      if (avg < threshold) {
        out.push({
          branchId: b.branch_id,
          branchName: b.branch_name,
          avgDisbursement: avg,
          actualLcs: staff,
          issues: [`avg disbursement per LC K${avg.toLocaleString()} below K${threshold.toLocaleString()}`],
        });
      }
    }
  }
  return out.length ? out : undefined;
}

function buildPortfolioAttribution(
  m: MetricMeasurement,
  value: number,
  underUtilised: boolean
): BranchAttribution[] | undefined {
  if (!m.branchPerformances) return undefined;
  const lowThreshold = m.threshold ?? 300000;
  const highThreshold = m.threshold ? m.threshold * 1.2 : 380000;
  const out: BranchAttribution[] = [];
  for (const b of m.branchPerformances) {
    const staff = b.staff_count ?? 0;
    const portfolio = b.portfolio?.total_portfolio ?? 0;
    if (staff > 0 && portfolio > 0) {
      const perLc = portfolio / staff;
      const under = perLc < lowThreshold;
      const over = perLc > highThreshold;
      if (underUtilised ? under : over) {
        out.push({
          branchId: b.branch_id,
          branchName: b.branch_name,
          portfolioPerLc: perLc,
          actualLcs: staff,
          issues: [
            under
              ? `portfolio/LC K${perLc.toLocaleString()} below optimal floor`
              : `portfolio/LC K${perLc.toLocaleString()} above optimal ceiling`,
          ],
        });
      }
    }
  }
  return out.length ? out : undefined;
}

function buildConsultantAttribution(m: MetricMeasurement, metric: string, threshold: number): ConsultantAttribution[] | undefined {
  if (!m.officeUsers) return undefined;
  const out: ConsultantAttribution[] = [];
  for (const u of m.officeUsers) {
    const disbTotal = (u.loans ?? []).reduce((sum: number, l) => {
      const p = parseNumber(l.principal) ?? 0;
      return sum + p;
    }, 0);
    const loanCount = (u.loans ?? []).length;
    const fullName = `${u.first_name} ${u.last_name}`.trim();
    const displayName = fullName || `LC ${u.id}`;
    if (metric === 'Staff Adequacy Score') {
      if (loanCount > 0 && disbTotal > 0 && disbTotal < threshold) {
        out.push({
          consultantId: u.id,
          consultantName: displayName,
          officeId: u.office_id,
          officeName: m.officeName,
          metric: 'Disbursement',
          value: `K${disbTotal.toLocaleString()}`,
          issue: `total disbursement K${disbTotal.toLocaleString()} (${loanCount} loans) below K${threshold.toLocaleString()} target`,
        });
      }
    }
    if (metric === 'Portfolio Load Balance') {
      if (loanCount > 0 && disbTotal < threshold) {
        out.push({
          consultantId: u.id,
          consultantName: displayName,
          officeId: u.office_id,
          officeName: m.officeName,
          metric: 'Portfolio per LC',
          value: `K${disbTotal.toLocaleString()}`,
          issue: `portfolio K${disbTotal.toLocaleString()} below optimal K${(threshold / 1000).toFixed(0)}K`,
        });
      }
    }
  }
  return out.length ? out : undefined;
}

export function evaluateGenericMetric(name: string, data: any, location?: SuggestionLocation, officeUsers?: any[], userLevel?: string, target?: number): Suggestion | null {
  const score = resolveScore(data);
  if (score === null) return null;
  const effectiveTarget = target ?? 76;
  const effectiveCritical = 60;

  if (score < effectiveTarget) {
    const sev: SuggestionSeverity = score < effectiveCritical ? 'critical' : 'warning';
    const consultantAttribution = officeUsers && officeUsers.length > 0 ? buildConsultantAttribution({ officeUsers, location } as any, name, effectiveTarget) : undefined;
    return {
      id: uid(`metric-${name}`),
      severity: sev,
      metric: name,
      target: `≥ ${effectiveTarget}%`,
      actual: `${score.toFixed(0)}%`,
      finding: `${name} score is ${score.toFixed(0)}%, which is below the ${effectiveTarget}%.`,
      recommendation: `Investigation required for "${name}" — performance below target. Review data quality and root-cause drivers at ${userLevel ?? 'branch'} level.`,
      location,
      consultantAttribution,
    };
  }

  return null;
}

export function evaluateVolumeAchievement(m: MetricMeasurement): Suggestion | null {
  const score = resolveScore(m);
  if (score === null) return null;
  const target = m.target ?? 76;
  const critical = 60;

  if (score < target) {
    const sev: SuggestionSeverity = score < critical ? 'critical' : 'warning';
    return {
      id: uid('volume'),
      severity: sev,
      metric: 'Volume Achievement',
      target: `≥ ${target}%`,
      actual: `${score.toFixed(0)}%`,
      finding: `Volume Achievement score is ${score.toFixed(0)}%, below the ${target}% target.`,
      recommendation: `Increase client acquisition and disbursement volume. Review pipeline and marketing efforts.`,
      location: m.location,
      attribution: buildProductivityAttribution(m, m.target ?? 40000),
      consultantAttribution: buildConsultantAttribution(m, 'Volume Achievement', m.target ?? 40000),
    };
  }
  return null;
}

export function evaluateCollectionsEfficiency(m: MetricMeasurement): Suggestion | null {
  const score = resolveScore(m);
  if (score === null) return null;
  const target = m.target ?? 76;

  if (score < target) {
    const sev: SuggestionSeverity = score < 60 ? 'critical' : 'warning';
    return {
      id: uid('collections'),
      severity: sev,
      metric: 'Collections efficiency',
      target: `≥ ${target}%`,
      actual: `${score.toFixed(0)}%`,
      finding: `Collections efficiency is ${score.toFixed(0)}%, below the ${target}% target.`,
      recommendation: `Strengthen collection processes, follow up on overdue accounts, and improve payment tracking.`,
      location: m.location,
      consultantAttribution: buildConsultantAttribution(m, 'Collections efficiency', target),
    };
  }
  return null;
}

export function evaluateCashPosition(m: MetricMeasurement): Suggestion | null {
  const score = resolveScore(m);
  if (score === null) return null;
  const target = m.target ?? 76;

  if (score < target) {
    const sev: SuggestionSeverity = score < 60 ? 'critical' : 'warning';
    return {
      id: uid('cash'),
      severity: sev,
      metric: 'Cash Position Score',
      target: `≥ ${target}%`,
      actual: `${score.toFixed(0)}%`,
      finding: `Cash Position Score is ${score.toFixed(0)}%, below the ${target}% target.`,
      recommendation: `Improve cash collection, reduce unnecessary expenditures, and monitor liquidity closely.`,
      location: m.location,
    };
  }
  return null;
}

export interface EvaluateInput {
  measurements: MetricMeasurement[];
  otherMetrics?: Array<{ name: string; data: any; location?: SuggestionLocation; userLevel?: string; target?: number }>;
}

export function evaluateAll(input: EvaluateInput): Suggestion[] {
  const suggestions: Suggestion[] = [];

  for (const m of input.measurements) {
    const staff = m.metric === 'Staff Adequacy Score' ? evaluateStaffAdequacy(m) : null;
    if (staff) {
      staff.consultantAttribution = buildConsultantAttribution(m, 'Staff Adequacy Score', m.target ?? 11);
      suggestions.push(staff);
      continue;
    }

    const prod = m.metric === 'Productivity Achievement' ? evaluateProductivity(m) : null;
    if (prod) {
      prod.consultantAttribution = buildConsultantAttribution(m, 'Productivity Achievement', m.target ?? 40000);
      suggestions.push(prod);
      continue;
    }

    const vac = m.metric === 'Vacancy Impact' ? evaluateVacancyImpact(m) : null;
    if (vac) suggestions.push(vac);

    const port = m.metric === 'Portfolio Load Balance' ? evaluatePortfolioLoad(m) : null;
    if (port) {
      port.consultantAttribution = buildConsultantAttribution(m, 'Portfolio Load Balance', m.threshold ?? 300000);
      suggestions.push(port);
    }
  }

  if (input.otherMetrics) {
    for (const om of input.otherMetrics) {
      const s = evaluateGenericMetric(om.name, om.data, om.location, undefined, om.userLevel, om.target);
      if (s) suggestions.push(s);
    }
  }

  return suggestions;
}

export const SuggestionService = {
  parseNumber,
  evaluateStaffAdequacy,
  evaluateProductivity,
  evaluateVacancyImpact,
  evaluatePortfolioLoad,
  evaluateVolumeAchievement,
  evaluateCollectionsEfficiency,
  evaluateCashPosition,
  evaluateGenericMetric,
  evaluateAll,
  resolveScore,
};

export default SuggestionService;
