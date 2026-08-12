export interface KPIConfig {
  getValue: (data: any) => number;
  getTarget: (data: any) => number;
  formatValue: (value: number) => string;
  formatVariance: (variance: number) => string;
  formatInstitutionAvg: (value: number) => string;
  isLowerBetter: boolean;
  getTrend: (value: number, target: number) => '↑' | '↓' | '→';
  getStatus: (value: number, target: number) => 'good' | 'warning' | 'critical';
  displayTarget: (data: any) => string;
}

export function calculateCashPositionScore(cashBalance: number, userLevel: string): number {
  if (!cashBalance || cashBalance <= 0) return 0;

  let maxBalance: number;
  switch (userLevel) {
    case 'institution':
      maxBalance = 50000000;
      break;
    case 'province':
      maxBalance = 500000;
      break;
    case 'branch':
      maxBalance = 100000;
      break;
    default:
      maxBalance = 0;
  }

  const score = (cashBalance / maxBalance) * 100;
  return Math.round(Math.min(Math.max(score, 0), 100));
}

export const kpiConfigs: Record<string, KPIConfig> = {
  'Staff Adequacy Score': {
    getValue: (data) => parseFloat(data.average_normalized_score || '0'),
    getTarget: (data) => data.target || 100,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= t * 0.8 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= t * 0.8 ? 'warning' : 'critical',
    displayTarget: () => '100%'
  },
  'Productivity Achievement': {
    getValue: (data) => parseFloat(data.average_normalized_score || '0'),
    getTarget: (data) => data.target || 90,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= t * 0.8 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= t * 0.8 ? 'warning' : 'critical',
    displayTarget: () => '90%'
  },
  'Productivity Achievement Score': {
    getValue: (data) => parseFloat(data.average_normalized_score || '0'),
    getTarget: (data) => data.target || 90,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= t * 0.8 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= t * 0.8 ? 'warning' : 'critical',
    displayTarget: () => '90%'
  },
  'Vacancy Impact': {
    getValue: (data) => parseFloat(data.average_normalized_score || '0'),
    getTarget: (data) => data.target || 10,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 1.2 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 1.2 ? 'warning' : 'critical',
    displayTarget: () => '0%'
  },
  'Portfolio Load Balance': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: (data) => data.target || 100,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t * 0.9 ? '↑' : v >= t * 0.7 ? '→' : '↓',
    getStatus: (v, t) => v >= t * 0.9 ? 'good' : v >= t * 0.7 ? 'warning' : 'critical',
    displayTarget: () => '100%'
  },
  'Volume Achievement': {
    getValue: (data) => parseFloat(data.average_normalized_score || '0'),
    getTarget: () => 100,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t * 0.9 ? '↑' : v >= t * 0.7 ? '→' : '↓',
    getStatus: (v, t) => v >= t * 0.9 ? 'good' : v >= t * 0.7 ? 'warning' : 'critical',
    displayTarget: () => '100%'
  },
  'Portfolio quality': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 5,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 2 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 2 ? 'warning' : 'critical',
    displayTarget: () => '≤5%'
  },
  'Default contribution': {
    getValue: (data) => parseFloat(data.average_month_1_default_rate || '0'),
    getTarget: () => 15,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 1.33 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 1.33 ? 'warning' : 'critical',
    displayTarget: () => '≤15%'
  },
  'Default rate (branch, province, institutional)': {
    getValue: (data) => parseFloat(data.average_month_1_default_rate || '0'),
    getTarget: () => 15,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 1.33 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 1.33 ? 'warning' : 'critical',
    displayTarget: () => '≤15%'
  },
  'Collections efficiency': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 75,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= t * 0.87 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= t * 0.87 ? 'warning' : 'critical',
    displayTarget: () => '≥75%'
  },
  'Vetting compliance': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 1.0,
    formatValue: (v) => `${v.toFixed(2)}`,
    formatVariance: (v) => `${v.toFixed(2)}`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 1.5 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 1.5 ? 'warning' : 'critical',
    displayTarget: () => '≤1.0'
  },
  'Product risk contribution': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 1.0,
    formatValue: (v) => `${v.toFixed(2)}`,
    formatVariance: (v) => `${v.toFixed(2)}`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 1.5 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 1.5 ? 'warning' : 'critical',
    displayTarget: () => '≤1.0'
  },
  'Product distribution mix': {
    getValue: (data) => parseFloat(data.average_HHI || '0'),
    getTarget: () => 0.3,
    formatValue: (v) => `${v.toFixed(3)}`,
    formatVariance: (v) => `${v.toFixed(3)}`,
    formatInstitutionAvg: (v) => `${v.toFixed(3)}`,
    isLowerBetter: true,
    getTrend: (v, t) => v < t ? '↑' : v < t * 1.33 ? '→' : '↓',
    getStatus: (v, t) => v < t ? 'good' : v < t * 1.33 ? 'warning' : 'critical',
    displayTarget: () => 'HHI < 0.3'
  },
  'Revenue yield per product': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: (data) => parseFloat(data.target) || 38.2,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= t * 0.9 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= t * 0.9 ? 'warning' : 'critical',
    displayTarget: (data) => data.target ? `≥${data.target}%` : '≥38.2%'
  },
  'Margin alignment with strategy': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: (data) => parseFloat(data.target) || 55,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 1.1 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 1.1 ? 'warning' : 'critical',
    displayTarget: (data) => data.target ? `≤${data.target}%` : '≤55%'
  },
  'Cost-to-income ratios': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: (data) => parseFloat(data.target) || 55,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 1.1 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 1.1 ? 'warning' : 'critical',
    displayTarget: (data) => data.target ? `≤${data.target}%` : '≤55%'
  },
  'Default aging analysis': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: (data) => parseFloat(data.target) || 43.95,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 1.1 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 1.1 ? 'warning' : 'critical',
    displayTarget: (data) => data.target ? `≤${data.target}%` : '≤43.95%'
  },
  'Recovery rate within 1 month': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 100,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= t * 0.9 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= t * 0.9 ? 'warning' : 'critical',
    displayTarget: () => '≥100%'
  },
  'Recovery rate within 3 months': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 100,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= t * 0.9 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= t * 0.9 ? 'warning' : 'critical',
    displayTarget: () => '≥100%'
  },
  'Risk migration trends': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 20,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: true,
    getTrend: (v, t) => v <= t ? '↑' : v <= t * 1.5 ? '→' : '↓',
    getStatus: (v, t) => v <= t ? 'good' : v <= t * 1.5 ? 'warning' : 'critical',
    displayTarget: () => '≤20%'
  },
  'Branch revenue': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 2.5,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `K${v.toLocaleString()}`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= 0 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= 0 ? 'warning' : 'critical',
    displayTarget: () => '≥2.5%'
  },
  'Growth trajectory alignment': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 2.5,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= 0 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= 0 ? 'warning' : 'critical',
    displayTarget: () => '≥2.5%'
  },
  'Institutional average performance': {
    getValue: (data) => parseFloat(data.average_normalized_score || '0'),
    getTarget: () => 100,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= t * 0.9 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= t * 0.9 ? 'warning' : 'critical',
    displayTarget: () => '≥100%'
  },
  'Revenue achievement': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 100,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= t * 0.9 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= t * 0.9 ? 'warning' : 'critical',
    displayTarget: () => '≥100%'
  },
  'Profitability contribution': {
    getValue: (data) => parseFloat(data.average_score || '0'),
    getTarget: () => 100,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= 90 ? '↑' : v >= 70 ? '→' : '↓',
    getStatus: (v, t) => v >= 90 ? 'good' : v >= 70 ? 'warning' : 'critical',
    displayTarget: () => '≥ institutional avg'
  },
  'Cash Position Score': {
    getValue: (data) => calculateCashPositionScore(parseFloat(data.totalCashBalance || data.average_score || '0'), 'province'),
    getTarget: () => 100,
    formatValue: (v) => `${v.toFixed(2)}%`,
    formatVariance: (v) => `${v.toFixed(2)}%`,
    formatInstitutionAvg: (v) => `${v.toFixed(2)}%`,
    isLowerBetter: false,
    getTrend: (v, t) => v >= t ? '↑' : v >= t * 0.9 ? '→' : '↓',
    getStatus: (v, t) => v >= t ? 'good' : v >= t * 0.7 ? 'warning' : 'critical',
    displayTarget: () => 'K500,000'
  },
};

export function calculateProvinceInstitutionAvg(selectedKPI: string | null, provincialData: Record<number, any>, provinces: any[]): string {
  if (!selectedKPI) return '--';
  const config = kpiConfigs[selectedKPI];
  if (!config) return '--';

  let total = 0;
  let count = 0;

  provinces.forEach(province => {
    const data = provincialData[province.id];
    if (data) {
      const value = config.getValue(data);
      if (!isNaN(value)) {
        total += value;
        count++;
      }
    }
  });

  if (count === 0) return '--';

  const average = total / count;
  return config.formatInstitutionAvg(average);
}
