import { BranchPerformance } from '@/services/ProvincialDataService';
import { OfficeUser } from '@/services/OfficeUserService';
import { Office } from '@/types/dashboard';
import {
  METRIC_THRESHOLDS,
  Suggestion,
  SuggestionLocation,
  SuggestionSeverity,
  BranchAttribution,
  ConsultantAttribution,
  KPI_SCORE_CRITICAL,
  KPI_SCORE_WARNING,
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

function scoreFallback(m: MetricMeasurement): Suggestion | null {
  if (m.normalizedScore === undefined || m.normalizedScore >= KPI_SCORE_WARNING) return null;
  const sev: SuggestionSeverity = m.normalizedScore < KPI_SCORE_CRITICAL ? 'critical' : 'warning';
  return {
    id: uid('score'),
    severity: sev,
    metric: m.metric,
    target: `≥ ${KPI_SCORE_WARNING}% normalized score`,
    actual: `${m.normalizedScore.toFixed(0)}%`,
    finding: `${m.metric} normalized score is ${m.normalizedScore.toFixed(0)}%, which is below the ${KPI_SCORE_WARNING}%.`,
    recommendation: `Investigate drivers of "${m.metric}" — score below target. Review root-cause at branch level.`,
    location: m.location,
  };
}

export function evaluateStaffAdequacy(m: MetricMeasurement): Suggestion | null {
  if (m.actualLcsPerOffice === undefined) return scoreFallback(m);
  const th = METRIC_THRESHOLDS['Staff Adequacy Score'];
  const lcsPerOffice = m.actualLcsPerOffice;
  const score = m.normalizedScore;

  if (lcsPerOffice < th.lowThreshold) {
    const gap = th.lowThreshold - lcsPerOffice;
    const sev: SuggestionSeverity = score !== undefined && score < KPI_SCORE_CRITICAL ? 'critical' : 'warning';
    return {
      id: uid('staff-adeq'),
      severity: sev,
      metric: 'Staff Adequacy Score',
      target: `${th.optimalRange![0]}-${th.optimalRange![1]} LCs per office`,
      actual: `${lcsPerOffice.toFixed(1)} LCs per office`,
      finding: `Average LC headcount is ${lcsPerOffice.toFixed(1)} per office, below the ${th.optimalRange![0]}-${th.optimalRange![1]} target band.`,
      recommendation: `Recruit ~${Math.ceil(gap)} additional loan consultant(s) per office to reach the ${th.optimalRange![0]}-${th.optimalRange![1]} target band.`,
      location: m.location,
      details: score !== undefined ? `Normalized score: ${score.toFixed(0)}%` : undefined,
      attribution: buildStaffAdequacyAttribution(m),
    };
  }

  if (lcsPerOffice > (th.highThreshold ?? Infinity)) {
    const over = lcsPerOffice - (th.highThreshold ?? th.target);
    return {
      id: uid('staff-adeq'),
      severity: 'info',
      metric: 'Staff Adequacy Score',
      target: `${th.optimalRange![0]}-${th.optimalRange![1]} LCs per office`,
      actual: `${lcsPerOffice.toFixed(1)} LCs per office`,
      finding: `Average LC headcount is ${lcsPerOffice.toFixed(1)} per office, above the ${th.optimalRange![1]} upper bound (potential over-staffing).`,
      recommendation: `Review LC allocation — ${over.toFixed(1)} head(s) above the optimal ceiling. Re-balance workload or convert surplus capacity to productivity initiatives.`,
      location: m.location,
      details: score !== undefined ? `Normalized score: ${score.toFixed(0)}%` : undefined,
    };
  }

  return null;
}

export function evaluateProductivity(m: MetricMeasurement): Suggestion | null {
  if (m.avgDisbursement === undefined) return scoreFallback(m);
  const avg = m.avgDisbursement;
  const th = METRIC_THRESHOLDS['Productivity Achievement'];

  if (avg < th.lowThreshold) {
    const gap = th.lowThreshold - avg;
    return {
      id: uid('prod'),
      severity: avg < th.lowThreshold ? 'critical' : 'good',
      metric: 'Productivity Achievement',
      target: `Avg disbursement ≥ K${th.target.toLocaleString()} per LC user`,
      actual: `Avg disbursement K${avg.toLocaleString()} per LC user`,
      finding: `Average disbursement per LC user (K${avg.toLocaleString()}) is below the K${th.target.toLocaleString()} target.`,
      recommendation: `Gap to target: K${gap.toLocaleString()} per LC. Coach under-performing loan consultants on client acquisition and portfolio growth, and review client-product mix in lower-yield branches.`,
      location: m.location,
      attribution: buildProductivityAttribution(m, th.target),
    };
  }

  return null;
}

export function evaluateVacancyImpact(m: MetricMeasurement): Suggestion | null {
  const vac = m.vacancies ?? 0;
  if (vac === 0 && m.vacanciesPerOffice === undefined) return scoreFallback(m);
  const total = vac;
  const th = METRIC_THRESHOLDS['Vacancy Impact'];

  if (total > 0) {
    return {
      id: uid('vacancy'),
      severity: total > 0 ? 'critical' : 'good',
      metric: 'Vacancy Impact',
      target: `${th.target} vacancies per office (fill all authorized positions)`,
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
  if (m.portfolioPerLc === undefined) return scoreFallback(m);
  const val = m.portfolioPerLc;
  const th = METRIC_THRESHOLDS['Portfolio Load Balance'];
  const low = th.lowThreshold;
  const high = th.highThreshold ?? Infinity;

  if (val < low) {
    const gap = low - val;
    return {
      id: uid('port'),
      severity: 'warning',
      metric: 'Portfolio Load Balance',
      target: `K${(low / 1000).toFixed(0)}K-K${(th.highThreshold! / 1000).toFixed(0)}K per LC user`,
      actual: `K${val.toLocaleString()} per LC user`,
      finding: `Outstanding portfolio per LC user (K${val.toLocaleString()}) is below the optimal K${(low / 1000).toFixed(0)}K floor — LCs are under-utilised.`,
      recommendation: `Close the K${gap.toLocaleString()} gap per LC through cross-selling, client up-lift and portfolio expansion campaigns.`,
      location: m.location,
      attribution: buildPortfolioAttribution(m, val, true),
    };
  }

  if (val > high) {
    const over = val - high;
    return {
      id: uid('port'),
      severity: 'critical',
      metric: 'Portfolio Load Balance',
      target: `K${(low / 1000).toFixed(0)}K-K${(th.highThreshold! / 1000).toFixed(0)}K per LC user`,
      actual: `K${val.toLocaleString()} per LC user`,
      finding: `Outstanding portfolio per LC user (K${val.toLocaleString()}) exceeds the optimal K${(th.highThreshold! / 1000).toFixed(0)}K ceiling — over-loaded / going concern.`,
      recommendation: `Reduce the K${over.toLocaleString()} per-LC exposure by re-balancing clients, approving top-ups for existing borrowers, or re-assigning accounts to under-utilised consultants.`,
      location: m.location,
      attribution: buildPortfolioAttribution(m, val, false),
    };
  }

  return null;
}

function buildStaffAdequacyAttribution(m: MetricMeasurement): BranchAttribution[] | undefined {
  if (!m.branchPerformances) return undefined;
  const th = METRIC_THRESHOLDS['Staff Adequacy Score'];
  const out: BranchAttribution[] = [];
  for (const b of m.branchPerformances) {
    const actualLcs = b.staff_count ?? 0;
    if (actualLcs < th.lowThreshold) {
      out.push({
        branchId: b.branch_id,
        branchName: b.branch_name,
        actualLcs,
        issues: [`understaffed (${actualLcs} LCs, below ${th.lowThreshold})`],
      });
    } else if (actualLcs > (th.highThreshold ?? Infinity)) {
      out.push({
        branchId: b.branch_id,
        branchName: b.branch_name,
        actualLcs,
        issues: [`over-staffed (${actualLcs} LCs, above ${th.highThreshold})`],
      });
    }
  }
  return out.length ? out : undefined;
}

function buildVacancyAttribution(m: MetricMeasurement): BranchAttribution[] | undefined {
  if (!m.offices) return undefined;
  const th = METRIC_THRESHOLDS['Vacancy Impact'];
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
  const th = METRIC_THRESHOLDS['Portfolio Load Balance'];
  const out: BranchAttribution[] = [];
  for (const b of m.branchPerformances) {
    const staff = b.staff_count ?? 0;
    const portfolio = b.portfolio?.total_portfolio ?? 0;
    if (staff > 0 && portfolio > 0) {
      const perLc = portfolio / staff;
      const under = perLc < th.lowThreshold;
      const over = perLc > (th.highThreshold ?? Infinity);
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

export function evaluateGenericMetric(name: string, data: any, location?: SuggestionLocation, officeUsers?: any[]): Suggestion | null {
  const score = resolveScore(data);
  if (score === null) return null;

  if (score < KPI_SCORE_WARNING) {
    const sev: SuggestionSeverity = score < KPI_SCORE_CRITICAL ? 'critical' : 'warning';
    const consultantAttribution = officeUsers && officeUsers.length > 0 ? buildConsultantAttribution({ officeUsers, location } as any, name, (METRIC_THRESHOLDS as any)[name]?.target || KPI_SCORE_WARNING) : undefined;
    return {
      id: uid(`metric-${name}`),
      severity: sev,
      metric: name,
      target: `≥ ${KPI_SCORE_WARNING}%`,
      actual: `${score.toFixed(0)}%`,
      finding: `${name} score is ${score.toFixed(0)}%, which is below the ${KPI_SCORE_WARNING}%.`,
      recommendation: `Investigation required for "${name}" — performance below target. Review data quality and root-cause drivers at branch level.`,
      location,
      consultantAttribution,
    };
  }

  return null;
}

export function evaluateVolumeAchievement(m: MetricMeasurement): Suggestion | null {
  const score = resolveScore(m);
  if (score === null) return null;
  if (score < KPI_SCORE_WARNING) {
    const sev: SuggestionSeverity = score < KPI_SCORE_CRITICAL ? 'critical' : 'warning';
    return {
      id: uid('volume'),
      severity: sev,
      metric: 'Volume Achievement',
      target: `≥ ${KPI_SCORE_WARNING}%`,
      actual: `${score.toFixed(0)}%`,
      finding: `Volume Achievement score is ${score.toFixed(0)}%, below the ${KPI_SCORE_WARNING}% target.`,
      recommendation: `Increase client acquisition and disbursement volume. Review pipeline and marketing efforts.`,
      location: m.location,
      attribution: buildProductivityAttribution(m, METRIC_THRESHOLDS['Productivity Achievement'].target),
      consultantAttribution: buildConsultantAttribution(m, 'Volume Achievement', METRIC_THRESHOLDS['Productivity Achievement'].target),
    };
  }
  return null;
}

export function evaluateCollectionsEfficiency(m: MetricMeasurement): Suggestion | null {
  const score = resolveScore(m);
  if (score === null) return null;
  if (score < KPI_SCORE_WARNING) {
    const sev: SuggestionSeverity = score < KPI_SCORE_CRITICAL ? 'critical' : 'warning';
    return {
      id: uid('collections'),
      severity: sev,
      metric: 'Collections efficiency',
      target: `≥ ${KPI_SCORE_WARNING}%`,
      actual: `${score.toFixed(0)}%`,
      finding: `Collections efficiency is ${score.toFixed(0)}%, below the ${KPI_SCORE_WARNING}% target.`,
      recommendation: `Strengthen collection processes, follow up on overdue accounts, and improve payment tracking.`,
      location: m.location,
      consultantAttribution: buildConsultantAttribution(m, 'Collections efficiency', KPI_SCORE_WARNING),
    };
  }
  return null;
}

export function evaluateCashPosition(m: MetricMeasurement): Suggestion | null {
  const score = resolveScore(m);
  if (score === null) return null;
  if (score < KPI_SCORE_WARNING) {
    const sev: SuggestionSeverity = score < KPI_SCORE_CRITICAL ? 'critical' : 'warning';
    return {
      id: uid('cash'),
      severity: sev,
      metric: 'Cash Position Score',
      target: `≥ ${KPI_SCORE_WARNING}%`,
      actual: `${score.toFixed(0)}%`,
      finding: `Cash Position Score is ${score.toFixed(0)}%, below the ${KPI_SCORE_WARNING}% target.`,
      recommendation: `Improve cash collection, reduce unnecessary expenditures, and monitor liquidity closely.`,
      location: m.location,
    };
  }
  return null;
}

export interface EvaluateInput {
  measurements: MetricMeasurement[];
  otherMetrics?: Array<{ name: string; data: any; location?: SuggestionLocation }>;
}

export function evaluateAll(input: EvaluateInput): Suggestion[] {
  const suggestions: Suggestion[] = [];

  for (const m of input.measurements) {
    const staff = m.metric === 'Staff Adequacy Score' ? evaluateStaffAdequacy(m) : null;
    if (staff) {
      staff.consultantAttribution = buildConsultantAttribution(m, 'Staff Adequacy Score', METRIC_THRESHOLDS['Staff Adequacy Score'].target);
      suggestions.push(staff);
      continue;
    }

    const prod = m.metric === 'Productivity Achievement' ? evaluateProductivity(m) : null;
    if (prod) {
      prod.consultantAttribution = buildConsultantAttribution(m, 'Productivity Achievement', METRIC_THRESHOLDS['Productivity Achievement'].target);
      suggestions.push(prod);
      continue;
    }

    const vac = m.metric === 'Vacancy Impact' ? evaluateVacancyImpact(m) : null;
    if (vac) suggestions.push(vac);

    const port = m.metric === 'Portfolio Load Balance' ? evaluatePortfolioLoad(m) : null;
    if (port) {
      port.consultantAttribution = buildConsultantAttribution(m, 'Portfolio Load Balance', METRIC_THRESHOLDS['Portfolio Load Balance'].lowThreshold);
      suggestions.push(port);
    }
  }

  if (input.otherMetrics) {
    for (const om of input.otherMetrics) {
      const s = evaluateGenericMetric(om.name, om.data, om.location);
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
