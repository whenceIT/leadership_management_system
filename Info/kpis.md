/**
 * KPI Mock Data for all Leadership Positions
 * Each position has specific KPIs based on their role and responsibilities
 */

export const kpiDataByPosition: Record<string, PositionKPIConfig> = {
  'Branch Manager': {
    title: 'Branch Manager Dashboard',
    description: 'Revenue, portfolio quality, and team performance metrics',
    kpiCategories: [
      {
        name: 'Financial KPIs',
        metrics: [
          { name: 'Monthly Disbursement Volume', value: 420000, target: 450000, unit: 'currency', format: 'currency', weight: 20 },
          { name: 'Branch Net Contribution', value: 280650, target: 324000, unit: 'currency', format: 'currency', weight: 25 },
          { name: 'Month-1 Default Rate', value: 28.36, target: 25, unit: 'percent', format: 'percent', weight: 20, lowerIsBetter: true },
          { name: 'In-House Recovery Rate', value: 56.05, target: 65, unit: 'percent', format: 'percent', weight: 15 },
          { name: 'Delinquency Roll-Rate', value: 36.74, target: 45, unit: 'percent', format: 'percent', weight: 10, lowerIsBetter: true },
          { name: 'Cost-to-Income Ratio', value: 55, target: 50, unit: 'percent', format: 'percent', weight: 10, lowerIsBetter: true },
        ],
      },
      {
        name: 'Operational & Team KPIs',
        metrics: [
          { name: 'LCs Achieving K50K+ Tier', value: 40, target: 50, unit: 'percent', format: 'percent', weight: 10 },
          { name: 'LCs Achieving K80K+ Tier', value: 8, target: 15, unit: 'percent', format: 'percent', weight: 5 },
          { name: 'Portfolio Reassignment Compliance', value: 95, target: 100, unit: 'percent', format: 'percent', weight: 5 },
          { name: 'Client Retention Rate', value: 82, target: 85, unit: 'percent', format: 'percent', weight: 5 },
          { name: 'Staff Turnover Rate', value: 8, target: 10, unit: 'percent', format: 'percent', weight: 5, lowerIsBetter: true },
        ],
      },
      {
        name: 'Strategic KPIs',
        metrics: [
          { name: 'MV Loan Referrals', value: 35000, target: 40000, unit: 'currency', format: 'currency', weight: 5 },
          { name: 'New Process Adoption', value: 90, target: 100, unit: 'percent', format: 'percent', weight: 5 },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Month-1 Default Rate', message: 'Current rate (28.36%) is above target (25%). Review client vetting procedures.' },
      { type: 'success', title: 'Recovery Rate Improving', message: 'In-house recovery rate increased by 3% this month.' },
    ],
  },
  'District Manager': {
    title: 'District Manager Dashboard',
    description: 'Multi-branch performance and regional metrics',
    kpiCategories: [
      {
        name: 'Regional Financial KPIs',
        metrics: [
          { name: 'Total District Disbursement', value: 2100000, target: 2250000, unit: 'currency', format: 'currency', weight: 20 },
          { name: 'District Net Contribution', value: 1403250, target: 1620000, unit: 'currency', format: 'currency', weight: 20 },
          { name: 'Avg Month-1 Default Rate', value: 2.8, target: 2.5, unit: 'percent', format: 'percent', weight: 15, lowerIsBetter: true },
          { name: 'Avg Recovery Rate', value: 95.2, target: 97, unit: 'percent', format: 'percent', weight: 15 },
          { name: 'Branch Compliance Score', value: 96, target: 98, unit: 'percent', format: 'percent', weight: 10 },
        ],
      },
      {
        name: 'Branch Performance KPIs',
        metrics: [
          { name: 'Branches Meeting Targets', value: 3, target: 4, unit: 'number', format: 'number', weight: 10 },
          { name: 'Branches Needing Intervention', value: 1, target: 0, unit: 'number', format: 'number', weight: 5, lowerIsBetter: true },
          { name: 'Cross-Branch Learning Sessions', value: 2, target: 4, unit: 'number', format: 'number', weight: 5 },
        ],
      },
      {
        name: 'Talent & Development KPIs',
        metrics: [
          { name: 'BM Promotions Ready', value: 2, target: 3, unit: 'number', format: 'number', weight: 5 },
          { name: 'Succession Coverage', value: 85, target: 90, unit: 'percent', format: 'percent', weight: 5 },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Branch B Performance', message: 'Branch B requires intervention - default rate elevated.' },
      { type: 'info', title: 'Satellite Expansion', message: 'New satellite branch on track for Q2 launch.' },
    ],
  },
  'Provincial Manager': {
    title: 'Provincial Manager Dashboard',
    description: 'Province-wide performance and strategic initiatives',
    kpiCategories: [
      {
        name: 'Provincial Financial KPIs',
        metrics: [
          { name: 'Total Provincial Disbursement', value: 10500000, target: 12000000, unit: 'currency', format: 'currency', weight: 20 },
          { name: 'Provincial Net Contribution', value: 7016250, target: 8100000, unit: 'currency', format: 'currency', weight: 20 },
          { name: 'Avg Default Rate', value: 2.6, target: 2.4, unit: 'percent', format: 'percent', weight: 15, lowerIsBetter: true },
          { name: 'Province Recovery Rate', value: 95.8, target: 97, unit: 'percent', format: 'percent', weight: 15 },
        ],
      },
      {
        name: 'District Management KPIs',
        metrics: [
          { name: 'Districts Meeting Targets', value: 3, target: 4, unit: 'number', format: 'number', weight: 10 },
          { name: 'District Manager Development', value: 75, target: 85, unit: 'percent', format: 'percent', weight: 10 },
          { name: 'Regional Consistency', value: 88, target: 92, unit: 'percent', format: 'percent', weight: 10 },
        ],
      },
    ],
    alerts: [
      { type: 'info', title: 'Province Performance', message: 'On track for annual targets. Q2 review scheduled.' },
    ],
  },
  'General Operations Manager (GOM)': {
    title: 'General Operations Manager Dashboard',
    description: 'Operational efficiency and process optimization',
    kpiCategories: [
      {
        name: 'Operational Efficiency KPIs',
        metrics: [
          { name: 'Process Cycle Time', value: 4.2, target: 3.5, unit: 'days', format: 'number', weight: 20, lowerIsBetter: true },
          { name: 'Error Rate', value: 1.8, target: 1.0, unit: 'percent', format: 'percent', weight: 15, lowerIsBetter: true },
          { name: ' SLA Compliance', value: 94, target: 98, unit: 'percent', format: 'percent', weight: 15 },
          { name: 'Cost per Transaction', value: 45, target: 40, unit: 'currency', format: 'currency', weight: 15, lowerIsBetter: true },
        ],
      },
      {
        name: 'Resource Utilization KPIs',
        metrics: [
          { name: 'Staff Utilization Rate', value: 82, target: 85, unit: 'percent', format: 'percent', weight: 15 },
          { name: 'System Uptime', value: 99.2, target: 99.9, unit: 'percent', format: 'percent', weight: 10 },
          { name: 'Document Processing Time', value: 2.5, target: 2.0, unit: 'hours', format: 'number', weight: 10, lowerIsBetter: true },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Error Rate', message: 'Error rate above target. Training refresh recommended.' },
    ],
  },
  'General Operations Administrator (GOA)': {
    title: 'GOA Dashboard',
    description: 'Administrative operations and support metrics',
    kpiCategories: [
      {
        name: 'Administrative KPIs',
        metrics: [
          { name: 'Ticket Resolution Time', value: 24, target: 18, unit: 'hours', format: 'number', weight: 25, lowerIsBetter: true },
          { name: 'Document Accuracy', value: 98.5, target: 99, unit: 'percent', format: 'percent', weight: 20 },
          { name: 'Compliance Adherence', value: 96, target: 100, unit: 'percent', format: 'percent', weight: 20 },
          { name: 'Request Completion Rate', value: 95, target: 98, unit: 'percent', format: 'percent', weight: 20 },
        ],
      },
      {
        name: 'Support KPIs',
        metrics: [
          { name: 'User Satisfaction Score', value: 4.2, target: 4.5, unit: 'rating', format: 'rating', weight: 15 },
        ],
      },
    ],
    alerts: [],
  },
  'Management Accountant': {
    title: 'Management Accountant Dashboard',
    description: 'Financial reporting and analysis metrics',
    kpiCategories: [
      {
        name: 'Financial Reporting KPIs',
        metrics: [
          { name: 'Report Accuracy', value: 99.2, target: 99.5, unit: 'percent', format: 'percent', weight: 25 },
          { name: 'Month-End Close Time', value: 5, target: 4, unit: 'days', format: 'number', weight: 20, lowerIsBetter: true },
          { name: 'Budget Variance', value: 5.2, target: 3, unit: 'percent', format: 'percent', weight: 20, lowerIsBetter: true },
          { name: 'Audit Findings', value: 2, target: 0, unit: 'number', format: 'number', weight: 15, lowerIsBetter: true },
        ],
      },
      {
        name: 'Analysis KPIs',
        metrics: [
          { name: 'Forecast Accuracy', value: 92, target: 95, unit: 'percent', format: 'percent', weight: 10 },
          { name: 'Ad-hoc Requests Completion', value: 90, target: 95, unit: 'percent', format: 'percent', weight: 10 },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Budget Variance', message: 'Variance exceeds target. Review needed.' },
    ],
  },
  'IT Manager': {
    title: 'IT Manager Dashboard',
    description: 'IT operations and technology performance',
    kpiCategories: [
      {
        name: 'IT Operations KPIs',
        metrics: [
          { name: 'System Uptime', value: 99.5, target: 99.9, unit: 'percent', format: 'percent', weight: 25 },
          { name: 'Mean Time to Recovery', value: 2.5, target: 1.5, unit: 'hours', format: 'number', weight: 20, lowerIsBetter: true },
          { name: 'Change Success Rate', value: 94, target: 98, unit: 'percent', format: 'percent', weight: 15 },
          { name: 'Security Incidents', value: 1, target: 0, unit: 'number', format: 'number', weight: 20, lowerIsBetter: true },
        ],
      },
      {
        name: 'Project & Delivery KPIs',
        metrics: [
          { name: 'Project On-Time Delivery', value: 85, target: 90, unit: 'percent', format: 'percent', weight: 10 },
          { name: 'User Satisfaction', value: 4.0, target: 4.3, unit: 'rating', format: 'rating', weight: 10 },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Security', message: 'Minor security incident detected and resolved.' },
    ],
  },
  'IT Coordinator': {
    title: 'IT Coordinator Dashboard',
    description: 'IT support and coordination metrics',
    kpiCategories: [
      {
        name: 'Support KPIs',
        metrics: [
          { name: 'First Contact Resolution', value: 78, target: 85, unit: 'percent', format: 'percent', weight: 30 },
          { name: 'Average Response Time', value: 45, target: 30, unit: 'minutes', format: 'number', weight: 25, lowerIsBetter: true },
          { name: 'Ticket Backlog', value: 25, target: 15, unit: 'number', format: 'number', weight: 20, lowerIsBetter: true },
          { name: 'User Training Completion', value: 88, target: 95, unit: 'percent', format: 'percent', weight: 25 },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Ticket Backlog', message: 'Ticket backlog above target. Staff reallocation recommended.' },
    ],
  },
  'Recoveries Coordinator': {
    title: 'Recoveries Coordinator Dashboard',
    description: 'Recovery operations and collection performance',
    kpiCategories: [
      {
        name: 'Recovery KPIs',
        metrics: [
          { name: 'Total Recovery Amount', value: 850000, target: 1000000, unit: 'currency', format: 'currency', weight: 25 },
          { name: 'Recovery Rate', value: 68, target: 75, unit: 'percent', format: 'percent', weight: 25 },
          { name: 'Avg Days to Recovery', value: 45, target: 35, unit: 'days', format: 'number', weight: 20, lowerIsBetter: true },
          { name: 'Legal Escalation Rate', value: 8, target: 5, unit: 'percent', format: 'percent', weight: 15, lowerIsBetter: true },
          { name: 'Client Payment Plans', value: 150, target: 180, unit: 'number', format: 'number', weight: 15 },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Recovery Rate', message: 'Recovery rate below target. Review strategies.' },
    ],
  },
  'Risk Manager': {
    title: 'Risk Manager Dashboard',
    description: 'Risk management and compliance metrics',
    kpiCategories: [
      {
        name: 'Risk KPIs',
        metrics: [
          { name: 'Risk Score', value: 32, target: 25, unit: 'score', format: 'number', weight: 25, lowerIsBetter: true },
          { name: 'Compliance Score', value: 96, target: 99, unit: 'percent', format: 'percent', weight: 20 },
          { name: 'Audit Findings', value: 3, target: 1, unit: 'number', format: 'number', weight: 20, lowerIsBetter: true },
          { name: 'Risk Mitigation Rate', value: 82, target: 90, unit: 'percent', format: 'percent', weight: 20 },
          { name: 'Policy Violations', value: 2, target: 0, unit: 'number', format: 'number', weight: 15, lowerIsBetter: true },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Risk Score', message: 'Risk score above target. Mitigation actions needed.' },
    ],
  },
  'Policy & Training Manager': {
    title: 'Policy & Training Manager Dashboard',
    description: 'Training and policy compliance metrics',
    kpiCategories: [
      {
        name: 'Training KPIs',
        metrics: [
          { name: 'Training Completion Rate', value: 88, target: 95, unit: 'percent', format: 'percent', weight: 30 },
          { name: 'Training Effectiveness Score', value: 4.1, target: 4.3, unit: 'rating', format: 'rating', weight: 20 },
          { name: 'New Hire Onboarding Time', value: 14, target: 10, unit: 'days', format: 'number', weight: 15, lowerIsBetter: true },
          { name: 'Policy Acknowledgment', value: 98, target: 100, unit: 'percent', format: 'percent', weight: 20 },
          { name: 'Compliance Training Pass Rate', value: 94, target: 98, unit: 'percent', format: 'percent', weight: 15 },
        ],
      },
    ],
    alerts: [],
  },
  'Motor Vehicles Manager': {
    title: 'Motor Vehicles Manager Dashboard',
    description: 'Motor vehicle loan portfolio and sales performance',
    kpiCategories: [
      {
        name: 'MV Loan KPIs',
        metrics: [
          { name: 'MV Loan Disbursement', value: 280000, target: 350000, unit: 'currency', format: 'currency', weight: 25 },
          { name: 'MV Default Rate', value: 2.1, target: 1.8, unit: 'percent', format: 'percent', weight: 20, lowerIsBetter: true },
          { name: 'MV Recovery Rate', value: 97, target: 98, unit: 'percent', format: 'percent', weight: 20 },
          { name: 'Dealer Partnerships', value: 12, target: 15, unit: 'number', format: 'number', weight: 15 },
          { name: 'MV Referral Conversion', value: 35, target: 45, unit: 'percent', format: 'percent', weight: 20 },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Disbursement Target', message: 'MV disbursement below target. Partner outreach needed.' },
    ],
  },
  'Payroll Loans Manager': {
    title: 'Payroll Loans Manager Dashboard',
    description: 'Payroll loan portfolio management',
    kpiCategories: [
      {
        name: 'Payroll Loan KPIs',
        metrics: [
          { name: 'Payroll Loan Disbursement', value: 520000, target: 600000, unit: 'currency', format: 'currency', weight: 25 },
          { name: 'Payroll Default Rate', value: 1.8, target: 1.5, unit: 'percent', format: 'percent', weight: 20, lowerIsBetter: true },
          { name: 'Employer Partnerships', value: 45, target: 55, unit: 'number', format: 'number', weight: 20 },
          { name: 'Payroll Deduction Accuracy', value: 99.5, target: 99.9, unit: 'percent', format: 'percent', weight: 20 },
          { name: 'Client Satisfaction', value: 4.4, target: 4.5, unit: 'rating', format: 'rating', weight: 15 },
        ],
      },
    ],
    alerts: [],
  },
  'Performance Operations Administrator (POA)': {
    title: 'POA Dashboard',
    description: 'Performance monitoring and operations support',
    kpiCategories: [
      {
        name: 'Performance KPIs',
        metrics: [
          { name: 'KPI Data Accuracy', value: 98, target: 99, unit: 'percent', format: 'percent', weight: 30 },
          { name: 'Report Timeliness', value: 96, target: 100, unit: 'percent', format: 'percent', weight: 25 },
          { name: 'Performance Review Completion', value: 92, target: 98, unit: 'percent', format: 'percent', weight: 25 },
          { name: 'Data Analysis Quality', value: 4.2, target: 4.5, unit: 'rating', format: 'rating', weight: 20 },
        ],
      },
    ],
    alerts: [],
  },
  'R&D Coordinator': {
    title: 'R&D Coordinator Dashboard',
    description: 'Research and development metrics',
    kpiCategories: [
      {
        name: 'R&D KPIs',
        metrics: [
          { name: 'Projects Completed', value: 3, target: 4, unit: 'number', format: 'number', weight: 25 },
          { name: 'Innovation Index', value: 72, target: 80, unit: 'score', format: 'number', weight: 25 },
          { name: 'Research Adoption Rate', value: 65, target: 75, unit: 'percent', format: 'percent', weight: 25 },
          { name: 'Time to Market', value: 6, target: 5, unit: 'months', format: 'number', weight: 25, lowerIsBetter: true },
        ],
      },
    ],
    alerts: [],
  },
  'Manager Administration': {
    title: 'Administration Manager Dashboard',
    description: 'Administrative management metrics',
    kpiCategories: [
      {
        name: 'Administration KPIs',
        metrics: [
          { name: 'Document Processing Time', value: 2.5, target: 2.0, unit: 'hours', format: 'number', weight: 25, lowerIsBetter: true },
          { name: 'Administrative Cost Efficiency', value: 88, target: 92, unit: 'percent', format: 'percent', weight: 25 },
          { name: 'Facility Utilization', value: 85, target: 90, unit: 'percent', format: 'percent', weight: 20 },
          { name: 'Staff Productivity', value: 90, target: 95, unit: 'percent', format: 'percent', weight: 30 },
        ],
      },
    ],
    alerts: [],
  },
  'Administration': {
    title: 'Administration Dashboard',
    description: 'General administrative support metrics',
    kpiCategories: [
      {
        name: 'Support KPIs',
        metrics: [
          { name: 'Request Fulfillment Rate', value: 94, target: 98, unit: 'percent', format: 'percent', weight: 35 },
          { name: 'Response Time', value: 1.5, target: 1.0, unit: 'hours', format: 'number', weight: 30, lowerIsBetter: true },
          { name: 'Quality Score', value: 4.3, target: 4.5, unit: 'rating', format: 'rating', weight: 35 },
        ],
      },
    ],
    alerts: [],
  },
  'District Regional Manager': {
    title: 'Regional Manager Dashboard',
    description: 'Regional performance and strategy metrics',
    kpiCategories: [
      {
        name: 'Regional Financial KPIs',
        metrics: [
          { name: 'Regional Disbursement', value: 5250000, target: 6000000, unit: 'currency', format: 'currency', weight: 25 },
          { name: 'Regional Net Contribution', value: 3508125, target: 4050000, unit: 'currency', format: 'currency', weight: 25 },
          { name: 'Regional Default Rate', value: 2.5, target: 2.2, unit: 'percent', format: 'percent', weight: 20, lowerIsBetter: true },
          { name: 'Regional Recovery Rate', value: 96, target: 98, unit: 'percent', format: 'percent', weight: 20 },
        ],
      },
      {
        name: 'Strategic KPIs',
        metrics: [
          { name: 'Regional Growth', value: 12, target: 15, unit: 'percent', format: 'percent', weight: 10 },
        ],
      },
    ],
    alerts: [],
  },
  'General Operations Manager': {
    title: 'Operations Manager Dashboard',
    description: 'Operations management and efficiency',
    kpiCategories: [
      {
        name: 'Operations KPIs',
        metrics: [
          { name: 'Operational Efficiency', value: 88, target: 92, unit: 'percent', format: 'percent', weight: 30 },
          { name: 'Process Optimization', value: 82, target: 88, unit: 'percent', format: 'percent', weight: 25 },
          { name: 'Cost Reduction', value: 5.2, target: 7, unit: 'percent', format: 'percent', weight: 25 },
          { name: 'Quality Assurance Score', value: 95, target: 98, unit: 'percent', format: 'percent', weight: 20 },
        ],
      },
    ],
    alerts: [],
  },
  'Creative Artwork & Marketing Representative Manager': {
    title: 'Marketing Manager Dashboard',
    description: 'Marketing and creative performance metrics',
    kpiCategories: [
      {
        name: 'Marketing KPIs',
        metrics: [
          { name: 'Campaign Reach', value: 85000, target: 100000, unit: 'number', format: 'number', weight: 25 },
          { name: 'Lead Generation', value: 420, target: 500, unit: 'number', format: 'number', weight: 25 },
          { name: 'Conversion Rate', value: 3.2, target: 4.0, unit: 'percent', format: 'percent', weight: 20 },
          { name: 'Brand Awareness', value: 68, target: 75, unit: 'percent', format: 'percent', weight: 15 },
          { name: 'Marketing ROI', value: 285, target: 350, unit: 'percent', format: 'percent', weight: 15 },
        ],
      },
    ],
    alerts: [
      { type: 'warning', title: 'Lead Generation', message: 'Lead generation below target. Campaign refresh needed.' },
    ],
  },
  'Super Seer': {
    title: 'Super Seer Dashboard',
    description: 'Executive overview - All positions and system-wide metrics',
    kpiCategories: [
      {
        name: 'Executive Overview KPIs',
        metrics: [
          { name: 'Total Disbursement', value: 15000000, target: 18000000, unit: 'currency', format: 'currency', weight: 20 },
          { name: 'Overall Default Rate', value: 2.4, target: 2.0, unit: 'percent', format: 'percent', weight: 20, lowerIsBetter: true },
          { name: 'System Recovery Rate', value: 96.5, target: 98, unit: 'percent', format: 'percent', weight: 15 },
          { name: 'Portfolio Health Score', value: 88, target: 92, unit: 'percent', format: 'percent', weight: 15 },
          { name: 'Employee Satisfaction', value: 4.2, target: 4.5, unit: 'rating', format: 'rating', weight: 15 },
          { name: 'System Uptime', value: 99.5, target: 99.9, unit: 'percent', format: 'percent', weight: 15 },
        ],
      },
    ],
    alerts: [
      { type: 'info', title: 'Executive View', message: 'You have access to all position KPIs. Use impersonation to view specific dashboards.' },
    ],
  },
};

// Helper function to get position from localStorage
export function getCurrentUserPosition(): string {
  if (typeof window === 'undefined') {
    return 'Branch Manager';
  }
  
  const storedUser = localStorage.getItem('thisUser');
  if (!storedUser) {
    return 'Branch Manager';
  }
  
  try {
    const user = JSON.parse(storedUser);
    // First try position string, then job_position (from API), then position_id
    const positionStr = user.position?.trim();
    if (positionStr) {
      return positionStr;
    }
    // Check job_position (from API) or position_id
    const positionId = user.job_position || user.position_id;
    if (positionId) {
      // Map position ID to name
      return getPositionNameByIdStatic(positionId);
    }
    return 'Branch Manager';
  } catch (e) {
    console.error('Error parsing user data:', e);
    return 'Branch Manager';
  }
}

// Map position ID to name (same as useUserPosition)
function getPositionNameByIdStatic(id: number): string {
  const positionMap: Record<number, string> = {
    1: 'General Operations Manager (GOM)',
    2: 'Provincial Manager',
    3: 'District Regional Manager',
    4: 'District Manager',
    5: 'Branch Manager',
    6: 'IT Manager',
    7: 'Risk Manager',
    8: 'Management Accountant',
    9: 'Motor Vehicles Manager',
    10: 'Payroll Loans Manager',
    11: 'Policy & Training Manager',
    12: 'Manager Administration',
    13: 'R&D Coordinator',
    14: 'Recoveries Coordinator',
    15: 'IT Coordinator',
    16: 'General Operations Administrator (GOA)',
    17: 'Performance Operations Administrator (POA)',
    18: 'Creative Artwork & Marketing Representative Manager',
    19: 'Administration',
    20: 'Super Seer',
  };
  return positionMap[id] || 'Branch Manager';
}

// Helper function to calculate overall KPI score
export function calculateOverallScore(metrics: KSIMetric[]): number {
  if (metrics.length === 0) return 0;
  
  let totalWeight = 0;
  let weightedScore = 0;
  
  metrics.forEach(metric => {
    const weight = metric.weight || 0;
    totalWeight += weight;
    
    let score = 0;
    if (metric.lowerIsBetter) {
      // For metrics where lower is better, calculate how close to target
      if (metric.value <= metric.target) {
        score = 100;
      } else {
        score = Math.max(0, 100 - ((metric.value - metric.target) / metric.target) * 100);
      }
    } else {
      // For metrics where higher is better
      score = Math.min(100, (metric.value / metric.target) * 100);
    }
    
    weightedScore += score * weight;
  });
  
  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
}

// Type definitions
export interface PositionKPIConfig {
  title: string;
  description: string;
  kpiCategories: KPICategory[];
  alerts: KPIAlert[];
}

export interface KPICategory {
  name: string;
  metrics: KSIMetric[];
}

export interface KSIMetric {
  name: string;
  value: number;
  target: number;
  unit: 'currency' | 'percent' | 'number' | 'days' | 'hours' | 'minutes' | 'months' | 'rating' | 'score';
  format: 'currency' | 'percent' | 'number' | 'rating';
  weight: number;
  lowerIsBetter?: boolean;
}

export interface KPIAlert {
  type: 'warning' | 'success' | 'info' | 'error';
  title: string;
  message: string;
}

// Default fallback for unknown positions
export const defaultKPIData: PositionKPIConfig = {
  title: 'Performance Dashboard',
  description: 'General performance metrics',
  kpiCategories: [
    {
      name: 'Key Performance Indicators',
      metrics: [
        { name: 'Overall Performance', value: 85, target: 90, unit: 'percent', format: 'percent', weight: 50 },
        { name: 'Efficiency', value: 88, target: 92, unit: 'percent', format: 'percent', weight: 30 },
        { name: 'Quality', value: 90, target: 95, unit: 'percent', format: 'percent', weight: 20 },
      ],
    },
  ],
  alerts: [],
};

export default kpiDataByPosition;
