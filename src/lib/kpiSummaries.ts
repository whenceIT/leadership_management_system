export type KpiDirection = 'higher' | 'lower';

export interface KpiSummary {
  label: string;
  summary: string;
  direction: KpiDirection;
  target: string;
}

export const kpiSummaries: Record<string, KpiSummary> = {
  'Staff Adequacy Score': {
    label: 'Staff Adequacy',
    summary:
      'Do our offices have enough loan officers? Each office should have 10–12 loan consultants. More coverage means we can serve more clients.',
    direction: 'higher',
    target: '100%',
  },
  'Productivity Achievement': {
    label: 'Productivity Achievement',
    summary:
      'How much lending is each loan consultant actually producing? It compares what they disbursed to what they were expected to disburse.',
    direction: 'higher',
    target: '90%',
  },
  'Productivity Achievement Score': {
    label: 'Productivity Achievement',
    summary:
      'How much lending is each loan consultant actually producing? It compares what they disbursed to what they were expected to disburse.',
    direction: 'higher',
    target: '90%',
  },
  'Vacancy Impact': {
    label: 'Vacancy Impact',
    summary:
      'How many loan consultant jobs are empty? Empty seats mean less capacity to serve clients, so we want this as close to zero as possible.',
    direction: 'lower',
    target: '0%',
  },
  'Portfolio Load Balance': {
    label: 'Portfolio Load Balance',
    summary:
      'Is the loan workload fairly spread across officers? We aim for about K300k–K380k of loans per officer — not too little (wasted capacity) and not too much (risky).',
    direction: 'higher',
    target: '100%',
  },
  'Volume Achievement': {
    label: 'Volume Achievement',
    summary:
      'Are we hitting our lending target? It compares the money we actually gave out in loans to the amount we planned to give out.',
    direction: 'higher',
    target: '100%',
  },
  'Portfolio Quality Score': {
    label: 'Portfolio Quality',
    summary:
      'How healthy is our loan book? A higher score means fewer problem loans and a safer portfolio.',
    direction: 'higher',
    target: '≥92%',
  },
  'Portfolio quality': {
    label: 'Portfolio Quality',
    summary:
      'What share of our loans are in trouble (PAR)? The smaller this number, the healthier our loans.',
    direction: 'lower',
    target: '≤5%',
  },
  'Vetting compliance': {
    label: 'Vetting Compliance',
    summary:
      'Are we checking loans properly before approving them? A lower default rate from poor vetting means our checks are working.',
    direction: 'lower',
    target: '≤1.0',
  },
  'Product risk contribution': {
    label: 'Product Risk Contribution',
    summary:
      'How much risk are our products adding? A lower number means our product mix is safer and better checked.',
    direction: 'lower',
    target: '≤1.0',
  },
  'Collection Efficiency': {
    label: 'Collection Efficiency',
    summary:
      'Are we collecting the money clients owe us? A higher percentage means we are recovering cash well.',
    direction: 'higher',
    target: '≥75%',
  },
  'Collections efficiency': {
    label: 'Collection Efficiency',
    summary:
      'Are we collecting the money clients owe us? A higher percentage means we are recovering cash well.',
    direction: 'higher',
    target: '≥75%',
  },
  'Yield Achievement': {
    label: 'Yield Achievement',
    summary:
      'Are we earning the interest we expect on our loans? A higher yield means each loan is more profitable.',
    direction: 'higher',
    target: '≥95%',
  },
  'Product diversification': {
    label: 'Product Diversification',
    summary:
      'Are we relying on too few products? Spreading loans across many products (lower score) is safer than betting on just one or two.',
    direction: 'lower',
    target: 'HHI < 0.3',
  },
  'Product distribution mix': {
    label: 'Product Distribution Mix',
    summary:
      'Are we relying on too few products? Spreading loans across many products (lower score) is safer than betting on just one or two.',
    direction: 'lower',
    target: 'HHI < 0.3',
  },
  'Product Risk Score': {
    label: 'Product Risk Score',
    summary:
      'How safe is our mix of loan products? A higher score means the products we offer carry less risk.',
    direction: 'higher',
    target: '≥90%',
  },
  'Month-1 Default Performance': {
    label: 'Month-1 Default Performance',
    summary:
      'How many loans go bad within the first month? Fewer early defaults means we are approving the right clients.',
    direction: 'lower',
    target: '≤15%',
  },
  'Default contribution': {
    label: 'Default Contribution',
    summary:
      'What share of loans are defaulting? A lower rate means better credit quality across the business.',
    direction: 'lower',
    target: '≤15%',
  },
  'Default rate (branch, province, institutional)': {
    label: 'Default Rate',
    summary:
      'What share of loans are defaulting? A lower rate means better credit quality across the business.',
    direction: 'lower',
    target: '≤15%',
  },
  '3-Month Recovery Achievement': {
    label: '3-Month Recovery Achievement',
    summary:
      'Of the money that went overdue, how much did we get back within 3 months? A higher rate means we recover arrears well.',
    direction: 'higher',
    target: '≥100%',
  },
  'Recovery rate within 1 month': {
    label: 'Recovery Rate (1 Month)',
    summary:
      'Of the money that went overdue, how much did we get back within 1 month? A higher rate means we fix problems early.',
    direction: 'higher',
    target: '≥100%',
  },
  'Recovery rate within 3 months': {
    label: 'Recovery Rate (3 Months)',
    summary:
      'Of the money that went overdue, how much did we get back within 3 months? A higher rate means we recover arrears well.',
    direction: 'higher',
    target: '≥100%',
  },
  'Roll-Rate Control': {
    label: 'Roll-Rate Control',
    summary:
      'Are we stopping small problems from becoming big ones? A higher score means overdue loans are not sliding into worse buckets.',
    direction: 'higher',
    target: '≥90%',
  },
  'Risk migration trends': {
    label: 'Risk Migration Trends',
    summary:
      'Are loans moving into worse trouble over time? Less movement is better and means the portfolio is stable.',
    direction: 'lower',
    target: '≤20%',
  },
  'Long-Term Delinquency Risk': {
    label: 'Long-Term Delinquency Risk',
    summary:
      'How much of our loans are stuck as long-term bad debt? A lower rate means fewer chronic problem loans.',
    direction: 'lower',
    target: '≤43.95%',
  },
  'Default aging analysis': {
    label: 'Default Aging Analysis',
    summary:
      'How much of our loans are stuck as long-term bad debt? A lower rate means fewer chronic problem loans.',
    direction: 'lower',
    target: '≤43.95%',
  },
  'Revenue Achievement': {
    label: 'Revenue Achievement',
    summary:
      'Are we bringing in the revenue we planned for? A higher number means we are hitting our income target.',
    direction: 'higher',
    target: '≥100%',
  },
  'Revenue achievement': {
    label: 'Revenue Achievement',
    summary:
      'Are we bringing in the revenue we planned for? A higher number means we are hitting our income target.',
    direction: 'higher',
    target: '≥100%',
  },
  'Efficiency Ratio (CIR)': {
    label: 'Efficiency Ratio (CIR)',
    summary:
      'How much does it cost us to earn each kwacha? A lower ratio means we run leaner and keep more of what we earn.',
    direction: 'lower',
    target: '≤55%',
  },
  'Margin alignment with strategy': {
    label: 'Margin Alignment',
    summary:
      'How much does it cost us to earn each kwacha? A lower ratio means we run leaner and keep more of what we earn.',
    direction: 'lower',
    target: '≤55%',
  },
  'Cost-to-income ratios': {
    label: 'Cost-to-Income Ratio',
    summary:
      'How much does it cost us to earn each kwacha? A lower ratio means we run leaner and keep more of what we earn.',
    direction: 'lower',
    target: '≤55%',
  },
  'Profitability Contribution': {
    label: 'Profitability Contribution',
    summary:
      'How much profit is this part of the business adding? A higher number means it is creating more value for the institution.',
    direction: 'higher',
    target: '≥90%',
  },
  'Profitability contribution': {
    label: 'Profitability Contribution',
    summary:
      'How much profit is this part of the business adding? A higher number means it is creating more value for the institution.',
    direction: 'higher',
    target: '≥90%',
  },
  'Growth Trajectory': {
    label: 'Growth Trajectory',
    summary:
      'Are we growing month over month? Positive growth means the business is expanding as planned.',
    direction: 'higher',
    target: '≥2.5% MoM',
  },
  'Growth trajectory alignment': {
    label: 'Growth Trajectory Alignment',
    summary:
      'Are we growing month over month? Positive growth means the business is expanding as planned.',
    direction: 'higher',
    target: '≥2.5% MoM',
  },
  'Institutional average performance': {
    label: 'Institutional Average Performance',
    summary:
      'Are we doing better or worse than the institution’s average? Above 100% means we are outperforming the baseline.',
    direction: 'higher',
    target: '≥100%',
  },
  'Revenue yield per product': {
    label: 'Revenue Yield per Product',
    summary:
      'How much interest does each product earn us? A higher yield means the product is more profitable.',
    direction: 'higher',
    target: '≥38.2%',
  },
  'Cash Position Score': {
    label: 'Cash Position Score',
    summary:
      'Do our offices have enough cash on hand? Each office should hold about K100k. Too little is risky; too much may just be sitting idle.',
    direction: 'higher',
    target: '≥100%',
  },
};

const fallbackSummary: KpiSummary = {
  label: 'KPI',
  summary:
    'How this metric is performing against its target. Check the score, variance and trend to see where it stands.',
  direction: 'higher',
  target: 'See KPI key',
};

export function getKpiSummary(kpi: string | null | undefined): KpiSummary {
  if (!kpi) return fallbackSummary;
  return kpiSummaries[kpi] ?? fallbackSummary;
}
