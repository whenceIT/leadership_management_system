/**
 * Cash Position Service
 * Calculates Cash & Liquidity Management Index (CLMI) according to Roadmap/6. Cash.md
 * 
 * Key thresholds:
 * - Absolute Minimum: K20,000
 * - Ideal Range: K20,000 - K30,000
 * - Exceptional Maximum: K50,000
 * - Above K50,000: Critical (automatic red flag)
 */

export interface CashPositionData {
  office_id?: string;
  province_id?: string;
  district_id?: string;
  offices_count?: number;
  period?: string;
  cash_position?: string;
  score?: string;
  average_score?: string;
  average_normalized_score?: string;
  percentage_points?: string;
  closing_balance?: string;
  weight?: string;
  percentage_point?: string;
  totalCashBalance?: number;
  
  // Constituent metrics (from Cash.md)
  cash_position_score?: number;
  above_threshold_risk?: number;
  below_threshold_risk?: number;
  approved_exception_ratio?: number;
  
  // Raw values for debugging
  approved_excess_amount?: number;
  unapproved_excess_amount?: number;
  total_excess_amount?: number;
}

// Threshold constants from Cash.md
const THRESHOLDS = {
  ABSOLUTE_MINIMUM: 20000,
  IDEAL_LOWER: 20000,
  IDEAL_UPPER: 30000,
  EXCEPTIONAL_MAX: 50000,
  CRITICAL_MAX: 50000,
  CRITICAL_MIN: 10000
};

const WEIGHTS = {
  CASH_POSITION_SCORE: 0.40,
  ABOVE_THRESHOLD_RISK: 0.30,
  BELOW_THRESHOLD_RISK: 0.20,
  APPROVED_EXCEPTION_RATIO: 0.10
};

async function fetchKpiSummary(filters?: {
  office_id?: number;
  province_id?: number;
  district_id?: number;
  start_date?: string;
  end_date?: string;
}) {
  const queryParams = new URLSearchParams();
  if (filters?.office_id) queryParams.append('office_id', filters.office_id.toString());
  if (filters?.province_id) queryParams.append('province_id', filters.province_id.toString());
  if (filters?.district_id) queryParams.append('district_id', filters.district_id.toString());

  const url = `https://smartbackend.whencefinancesystem.com/api/kpi-scores/summary${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch KPI summary: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.success) throw new Error('API returned success false');

  return result.data;
}

/**
 * Calculate Cash Position Score (40% weight)
 * Measures how close branch is to ideal range (K20k-K30k)
 */
function calculateCashPositionScore(totalCashBalance: number): number {
  if (totalCashBalance >= THRESHOLDS.IDEAL_LOWER && totalCashBalance <= THRESHOLDS.IDEAL_UPPER) {
    return 100;
  } else if (totalCashBalance > THRESHOLDS.IDEAL_UPPER && totalCashBalance <= THRESHOLDS.EXCEPTIONAL_MAX) {
    const excess = totalCashBalance - THRESHOLDS.IDEAL_UPPER;
    const penalty = (excess / 20000) * 40;
    return Math.max(100 - penalty, 60);
  } else if (totalCashBalance > THRESHOLDS.CRITICAL_MAX) {
    return 0;
  } else if (totalCashBalance >= THRESHOLDS.CRITICAL_MIN && totalCashBalance < THRESHOLDS.IDEAL_LOWER) {
    const shortfall = THRESHOLDS.IDEAL_LOWER - totalCashBalance;
    const penalty = (shortfall / 10000) * 50;
    return Math.max(100 - penalty, 50);
  } else if (totalCashBalance < THRESHOLDS.CRITICAL_MIN) {
    return 0;
  }
  return 100;
}

/**
 * Calculate Above-Threshold Risk (30% weight)
 * Measures unapproved cash above K30,000 (proxy for theft/fraud risk)
 */
function calculateAboveThresholdRisk(totalCash: number, unapprovedExcess: number): number {
  if (totalCash <= THRESHOLDS.IDEAL_UPPER) {
    return 100;
  }
  if (unapprovedExcess <= 0) {
    return 100;
  }
  const score = 100 * (1 - (unapprovedExcess / totalCash));
  return Math.max(score, 0);
}

/**
 * Calculate Below-Threshold Risk (20% weight)
 * Measures liquidity shortage – cash below K20,000
 */
function calculateBelowThresholdRisk(totalCash: number): number {
  if (totalCash >= THRESHOLDS.IDEAL_LOWER) {
    return 100;
  }
  if (totalCash <= 0) {
    return 0;
  }
  const score = 100 * (totalCash / THRESHOLDS.IDEAL_LOWER);
  return Math.min(Math.max(score, 0), 100);
}

/**
 * Calculate Approved Exception Ratio (10% weight)
 * Ensures governance – any cash above K30,000 must have approval
 */
function calculateApprovedExceptionRatio(approvedExcess: number, totalExcess: number): number {
  if (totalExcess <= 0) {
    return 100;
  }
  if (approvedExcess <= 0) {
    return 0;
  }
  const score = (approvedExcess / totalExcess) * 100;
  return Math.min(Math.max(score, 0), 100);
}

/**
 * Calculate the composite Cash & Liquidity Management Index
 */
export function calculateCashLiquidityIndex(
  totalCashBalance: number,
  approvedExcessAmount: number,
  unapprovedExcessAmount: number,
  totalExcessAmount: number
): {
  cashPositionScore: number;
  aboveThresholdRisk: number;
  belowThresholdRisk: number;
  approvedExceptionRatio: number;
  compositeScore: number;
} {
  const cashPositionScore = calculateCashPositionScore(totalCashBalance);
  const aboveThresholdRisk = calculateAboveThresholdRisk(totalCashBalance, unapprovedExcessAmount);
  const belowThresholdRisk = calculateBelowThresholdRisk(totalCashBalance);
  const approvedExceptionRatio = calculateApprovedExceptionRatio(approvedExcessAmount, totalExcessAmount);
  
  const compositeScore = 
    (cashPositionScore * WEIGHTS.CASH_POSITION_SCORE) +
    (aboveThresholdRisk * WEIGHTS.ABOVE_THRESHOLD_RISK) +
    (belowThresholdRisk * WEIGHTS.BELOW_THRESHOLD_RISK) +
    (approvedExceptionRatio * WEIGHTS.APPROVED_EXCEPTION_RATIO);
  
  return {
    cashPositionScore: Math.round(cashPositionScore * 100) / 100,
    aboveThresholdRisk: Math.round(aboveThresholdRisk * 100) / 100,
    belowThresholdRisk: Math.round(belowThresholdRisk * 100) / 100,
    approvedExceptionRatio: Math.round(approvedExceptionRatio * 100) / 100,
    compositeScore: Math.round(compositeScore * 100) / 100
  };
}

export async function fetchCashPosition(branchId: number): Promise<CashPositionData> {
  const apiData = await fetchKpiSummary({ office_id: branchId });
  
  const totalCashBalance = parseFloat(apiData.totalCashBalance) || 0;
  const approvedExcessAmount = parseFloat(apiData.approvedExcessAmount) || 0;
  const unapprovedExcessAmount = parseFloat(apiData.unapprovedExcessAmount) || 0;
  const totalExcessAmount = parseFloat(apiData.totalExcessAmount) || 0;
  
  const metrics = calculateCashLiquidityIndex(
    totalCashBalance,
    approvedExcessAmount,
    unapprovedExcessAmount,
    totalExcessAmount
  );

  return {
    office_id: branchId.toString(),
    score: metrics.compositeScore.toString(),
    average_score: metrics.compositeScore.toString(),
    average_normalized_score: metrics.compositeScore.toString(),
    totalCashBalance: totalCashBalance,
    percentage_point: metrics.compositeScore.toString(),
    cash_position_score: metrics.cashPositionScore,
    above_threshold_risk: metrics.aboveThresholdRisk,
    below_threshold_risk: metrics.belowThresholdRisk,
    approved_exception_ratio: metrics.approvedExceptionRatio,
    approved_excess_amount: approvedExcessAmount,
    unapproved_excess_amount: unapprovedExcessAmount,
    total_excess_amount: totalExcessAmount,
    ...apiData
  };
}

export async function fetchProvincialCashPosition(provinceId: number): Promise<CashPositionData> {
  const apiData = await fetchKpiSummary({ province_id: provinceId });
  
  const totalCashBalance = parseFloat(apiData.totalCashBalance) || 0;
  const approvedExcessAmount = parseFloat(apiData.approvedExcessAmount) || 0;
  const unapprovedExcessAmount = parseFloat(apiData.unapprovedExcessAmount) || 0;
  const totalExcessAmount = parseFloat(apiData.totalExcessAmount) || 0;
  
  const metrics = calculateCashLiquidityIndex(
    totalCashBalance,
    approvedExcessAmount,
    unapprovedExcessAmount,
    totalExcessAmount
  );

  return {
    province_id: provinceId.toString(),
    score: metrics.compositeScore.toString(),
    average_score: metrics.compositeScore.toString(),
    average_normalized_score: metrics.compositeScore.toString(),
    totalCashBalance: totalCashBalance,
    percentage_point: metrics.compositeScore.toString(),
    cash_position_score: metrics.cashPositionScore,
    above_threshold_risk: metrics.aboveThresholdRisk,
    below_threshold_risk: metrics.belowThresholdRisk,
    approved_exception_ratio: metrics.approvedExceptionRatio,
    approved_excess_amount: approvedExcessAmount,
    unapproved_excess_amount: unapprovedExcessAmount,
    total_excess_amount: totalExcessAmount,
    ...apiData
  };
}

export async function fetchInstitutionalCashPosition(): Promise<CashPositionData> {
  const apiData = await fetchKpiSummary();
  
  const totalCashBalance = parseFloat(apiData.totalCashBalance) || 0;
  const approvedExcessAmount = parseFloat(apiData.approvedExcessAmount) || 0;
  const unapprovedExcessAmount = parseFloat(apiData.unapprovedExcessAmount) || 0;
  const totalExcessAmount = parseFloat(apiData.totalExcessAmount) || 0;
  
  const metrics = calculateCashLiquidityIndex(
    totalCashBalance,
    approvedExcessAmount,
    unapprovedExcessAmount,
    totalExcessAmount
  );

  return {
    score: metrics.compositeScore.toString(),
    average_score: metrics.compositeScore.toString(),
    average_normalized_score: metrics.compositeScore.toString(),
    totalCashBalance: totalCashBalance,
    percentage_point: metrics.compositeScore.toString(),
    cash_position_score: metrics.cashPositionScore,
    above_threshold_risk: metrics.aboveThresholdRisk,
    below_threshold_risk: metrics.belowThresholdRisk,
    approved_exception_ratio: metrics.approvedExceptionRatio,
    approved_excess_amount: approvedExcessAmount,
    unapproved_excess_amount: unapprovedExcessAmount,
    total_excess_amount: totalExcessAmount,
    ...apiData
  };
}

export async function fetchDistrictCashPosition(districtId: number): Promise<CashPositionData> {
  const apiData = await fetchKpiSummary({ district_id: districtId });
  const score = calculateCashPositionScore(apiData.totalCashBalance);

  return {
    district_id: districtId.toString(),
    score: score.toString(),
    average_score: score.toString(),
    totalCashBalance: apiData.totalCashBalance,
    percentage_point: score.toString(),
    ...apiData
  };
}
