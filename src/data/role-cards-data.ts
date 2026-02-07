/**
 * Role Card Data for all Leadership Positions
 * Each position has specific job responsibilities, KPIs, and details
 */

export const roleCardsData: Record<string, RoleCardConfig> = {
  'Branch Manager': {
    title: 'Branch Manager',
    department: 'Operations',
    reportsTo: 'District Manager',
    directReports: 'Loan Consultants (LCs), Satellite branch supervisors',
    location: 'Branch Office',
    jobPurpose: 'The Branch Manager is the primary revenue engine and profit center leader responsible for driving branch-level performance toward the institutional goal of achieving a $100M valuation within five years. The role focuses on loan disbursement growth, portfolio quality, collections efficiency, and team development within a value-driven, performance-aligned framework.',
    responsibilities: [
      {
        category: 'Revenue & Portfolio Management',
        items: [
          'Ensure the branch meets or exceeds monthly disbursement targets (K420,000+)',
          'Oversee the end-to-end loan lifecycle: origination, disbursement, collection, and recovery',
          'Implement and monitor the Collections Waterfall Process to maximize in-house/branch recoveries and minimize long-term delinquency',
          'Drive adoption of Motor Vehicle Loans and other new products through client referrals and cross-selling'
        ]
      },
      {
        category: 'Team Leadership & Development',
        items: [
          'Supervise, train, and mentor Loan Consultants (LCs) to achieve tiered performance targets (Base, K50K+, K80K+, K120K+)',
          'Conduct weekly performance reviews and coaching sessions with LCs',
          'Implement portfolio reassignment protocols to optimize underperforming portfolios',
          'Foster a high-performance, accountable, and client-focused culture'
        ]
      },
      {
        category: 'Risk & Compliance',
        items: [
          'Ensure compliance with institutional lending policies, risk frameworks, and regulatory requirements',
          'Monitor and reduce Month-1 default rates through improved client vetting and early intervention',
          'Maintain accurate and timely reporting on portfolio health, defaults, and recoveries'
        ]
      },
      {
        category: 'Operational Excellence',
        items: [
          'Manage branch operational costs within budget',
          'Ensure efficient use of branch resources, including office space, systems, and staff',
          'Implement and adhere to Service Level Agreements (SLAs) for handovers to the Recoveries Department'
        ]
      },
      {
        category: 'Strategic Contribution',
        items: [
          'Participate in the rollout of new products, processes, and technologies',
          'Support satellite branch expansion within the district if applicable',
          'Collaborate with District and Provincial Managers on regional growth initiatives'
        ]
      }
    ],
    kpis: [
      { name: 'Monthly Disbursement Volume', baseline: 'K420,000', target: 'K450,000+', weight: '20%' },
      { name: 'Branch Net Contribution', baseline: 'K280,650', target: 'K324,000+', weight: '25%' },
      { name: 'Month-1 Default Rate', baseline: '28.36%', target: '≤25%', weight: '20%' },
      { name: 'In-House Recovery Rate', baseline: '56.05%', target: '≥65%', weight: '15%' },
      { name: 'Delinquency Roll-Rate', baseline: '36.74%', target: '≥45%', weight: '10%' },
      { name: 'Cost-to-Income Ratio', baseline: '~55%', target: '≤50%', weight: '10%' }
    ],
    competencies: [
      'Leadership: Ability to inspire, coach, and hold teams accountable',
      'Analytical Skills: Proficiency in data-driven decision-making and KPI tracking',
      'Risk Management: Understanding of credit risk, collections, and recovery processes',
      'Communication: Clear and effective communication with staff, clients, and senior management',
      'Strategic Thinking: Alignment with the $100M valuation framework and growth pillars'
    ],
    authority: {
      hiring: 'Authority to hire/fire LCs with District Manager approval',
      creditDecisions: 'Approve loans up to K5,000; refer larger loans to District Manager',
      portfolio: 'Authority to reassign delinquent portfolios to high-performing LCs',
      budget: 'Oversee branch operational budget with cost control accountability'
    },
    reviewCycles: [
      { cycle: 'Monthly', description: 'KPI dashboards reviewed with District Manager' },
      { cycle: 'Quarterly', description: 'Formal performance review tied to rewards eligibility' },
      { cycle: 'Annual', description: 'Comprehensive review for promotion, increment, or remedial action' }
    ]
  },
  'District Manager': {
    title: 'District Manager',
    department: 'Operations & Regional Management',
    reportsTo: 'Provincial Manager',
    directReports: 'Branch Managers (2–3+ branches depending on tier)',
    location: 'District Hub / Regional Office',
    jobPurpose: 'The District Manager in addition to managing their own branch, serves as the Performance Multiplier & Collections Champion for a cluster of branches. The role is not to duplicate branch-level management, but to oversee, validate, and optimize inter-branch performance, risk management, and strategic alignment with the $100M valuation target. The focus is on cross-branch synergy, escalated risk oversight, future-period follow-ups, and talent pipeline development.',
    responsibilities: [
      {
        category: 'Strategic Oversight & Validation',
        items: [
          'Ensure all branches under supervision are aligned with the $100M valuation framework',
          'Validate branch-reported data, especially: Month-1 default rates, Collections waterfall recovery percentages, Cash and cash equivalent balances, Portfolio integrity (ghost clients, fraud prevention)',
          'Conduct random and scheduled audits of branch operations without interfering in day-to-day management'
        ]
      },
      {
        category: 'Performance Optimization (Cross-Branch Focus)',
        items: [
          'Identify and share best practices across branches (successful collection scripts, client retention tactics)',
          'Facilitate inter-branch portfolio reassignment where applicable',
          'Monitor inter-branch conflicts or coordination issues and resolve impartially',
          'Drive district/regional-wide initiatives such as product launches, partnership rollouts, or training programs'
        ]
      },
      {
        category: 'Forward-Looking Supervision',
        items: [
          'Focus on future-period risks and opportunities that branch managers may overlook',
          'Ensure branch managers are planning for next-month targets while managing current performance',
          'Monitor aging delinquency reports (Month-2, Month-3 portfolios)'
        ]
      },
      {
        category: 'Risk & Compliance Escalation',
        items: [
          'Act as first point of escalation for high-risk cases, fraud suspicions, or major compliance breaches',
          'Oversee district-level risk dashboard including cross-branch default trends and recovery rate variances',
          'Ensure timely handover to Recoveries Department for portfolios beyond Month-4'
        ]
      },
      {
        category: 'Talent & Leadership Development',
        items: [
          'Identify and develop high-potential LCs and Branch Managers',
          'Mentor Branch Managers on leadership, reporting, and strategic execution',
          'Support succession planning within the district'
        ]
      },
      {
        category: 'Revenue & Growth Facilitation',
        items: [
          'Drive Motor Vehicle Loan referrals and other high-value product adoption',
          'Explore and facilitate strategic partnerships at district level',
          'Support satellite branch expansion with minimal managerial overhead'
        ]
      }
    ],
    kpis: [
      { name: 'Cross-Branch Default Reduction', baseline: 'Branch avg. 28.36%', target: '-3% vs. branch avg.', weight: '20%' },
      { name: 'District Recovery on Month-1 Default', baseline: '56.05%', target: '+2 percentage points', weight: '15%' },
      { name: 'Delinquency Roll-Rate (Month-2)', baseline: '36.74%', target: '≥45%', weight: '15%' },
      { name: 'Total District Net Contribution', baseline: 'Sum of branch contributions', target: '+15% vs. prior year', weight: '20%' },
      { name: 'Cost-to-Income Ratio (District)', baseline: '~55%', target: '≤50%', weight: '10%' },
      { name: 'Audit Compliance Score', baseline: '-', target: '100%', weight: '15%' }
    ],
    competencies: [
      'Strategic Oversight: Ability to see beyond daily operations to future risks/opportunities',
      'Data Validation & Auditing: Strong analytical and verification skills',
      'Cross-Functional Leadership: Experience managing multiple teams without micromanaging',
      'Risk Management: Understanding of credit, operational, and compliance risks',
      'Coaching & Development: Ability to mentor Branch Managers and develop talent'
    ],
    authority: {
      hiring: 'Recommendation only for Branch Manager hiring/firing',
      creditDecisions: 'Review & endorse high-risk loan approval (>K20,000)',
      portfolio: 'Approve & facilitate inter-branch portfolio transfer',
      budget: 'Monthly incremental funding pool for branch developments tied to verified value creation'
    },
    reviewCycles: [
      { cycle: 'Monthly', description: 'KPI review with Provincial Manager' },
      { cycle: 'Quarterly', description: 'Bonus eligibility based on audited value creation' },
      { cycle: 'Annual', description: 'Tier re-evaluation based on revenue and performance' }
    ]
  },
  'Provincial Manager': {
    title: 'Provincial Manager',
    department: 'Regional Management',
    reportsTo: 'Senior Management / Executive',
    directReports: 'District Managers',
    location: 'Provincial Office',
    jobPurpose: 'The Provincial Manager is responsible for overseeing all operations within a province, ensuring alignment with institutional goals, driving regional growth initiatives, and maintaining high standards of performance and compliance across all districts.',
    responsibilities: [
      {
        category: 'Regional Strategy & Oversight',
        items: [
          'Develop and implement provincial strategies aligned with $100M valuation goal',
          'Oversee district performance and ensure targets are met across the province',
          'Coordinate cross-district initiatives and resource allocation'
        ]
      },
      {
        category: 'Performance Management',
        items: [
          'Monitor and analyze provincial KPIs across all districts',
          'Identify underperforming areas and implement corrective actions',
          'Recognize and reward high-performing districts and managers'
        ]
      },
      {
        category: 'Risk & Compliance',
        items: [
          'Ensure provincial compliance with all regulatory requirements',
          'Oversee risk management frameworks across districts',
          'Handle escalated issues from District Managers'
        ]
      }
    ],
    kpis: [
      { name: 'Provincial Disbursement', baseline: 'TBD', target: 'TBD', weight: '25%' },
      { name: 'Provincial Default Rate', baseline: 'TBD', target: 'TBD', weight: '20%' },
      { name: 'Provincial Recovery Rate', baseline: 'TBD', target: 'TBD', weight: '20%' },
      { name: 'District Manager Development', baseline: 'TBD', target: 'TBD', weight: '15%' },
      { name: 'Regional Consistency', baseline: 'TBD', target: 'TBD', weight: '20%' }
    ],
    competencies: [
      'Strategic Leadership: Ability to guide regional strategy',
      'Stakeholder Management: Strong relationships with internal and external stakeholders',
      'Analytical Skills: Data-driven decision making',
      'Communication: Clear communication across all levels'
    ],
    authority: {
      hiring: 'Authority over District Manager hiring recommendations',
      creditDecisions: 'Final approval for high-value loans',
      budget: 'Provincial budget oversight and allocation'
    },
    reviewCycles: [
      { cycle: 'Monthly', description: 'Provincial performance review' },
      { cycle: 'Quarterly', description: 'Strategic review with senior management' },
      { cycle: 'Annual', description: 'Annual performance evaluation' }
    ]
  },
  'General Operations Manager (GOM)': {
    title: 'General Operations Manager',
    department: 'Operations',
    reportsTo: 'Senior Management',
    directReports: 'Department Heads, Team Leads',
    location: 'Head Office',
    jobPurpose: 'The GOM oversees all operational functions across the organization, ensuring efficiency, quality, and continuous improvement in all business processes.',
    responsibilities: [
      {
        category: 'Operational Excellence',
        items: [
          'Streamline operational processes to improve efficiency',
          'Implement best practices across all departments',
          'Monitor and reduce operational costs while maintaining quality'
        ]
      },
      {
        category: 'Process Optimization',
        items: [
          'Identify bottlenecks and implement solutions',
          'Lead continuous improvement initiatives',
          'Implement new technologies and systems'
        ]
      }
    ],
    kpis: [
      { name: 'Process Cycle Time', baseline: '4.2 days', target: '3.5 days', weight: '20%' },
      { name: 'Error Rate', baseline: '1.8%', target: '1.0%', weight: '15%' },
      { name: 'SLA Compliance', baseline: '94%', target: '98%', weight: '15%' },
      { name: 'Cost per Transaction', baseline: 'K45', target: 'K40', weight: '15%' }
    ],
    competencies: [
      'Process Management',
      'Continuous Improvement',
      'Project Management',
      'Data Analysis'
    ],
    authority: {
      budget: 'Operational budget oversight',
      hiring: 'Department head hiring recommendations'
    },
    reviewCycles: [
      { cycle: 'Monthly', description: 'Operational metrics review' },
      { cycle: 'Quarterly', description: 'Process improvement review' }
    ]
  },
  'Management Accountant': {
    title: 'Management Accountant',
    department: 'Finance',
    reportsTo: 'Finance Manager / CFO',
    directReports: 'Finance Assistants',
    location: 'Head Office',
    jobPurpose: 'The Management Accountant provides financial analysis, budgeting, and reporting to support management decision-making and organizational performance.',
    responsibilities: [
      {
        category: 'Financial Reporting',
        items: [
          'Prepare accurate and timely financial reports',
          'Analyze financial performance against budgets',
          'Provide insights for cost optimization'
        ]
      },
      {
        category: 'Budgeting & Forecasting',
        items: [
          'Develop annual budgets in collaboration with departments',
          'Monitor budget variances and provide explanations',
          'Update forecasts based on actual performance'
        ]
      }
    ],
    kpis: [
      { name: 'Report Accuracy', baseline: '99.2%', target: '99.5%', weight: '25%' },
      { name: 'Month-End Close Time', baseline: '5 days', target: '4 days', weight: '20%' },
      { name: 'Budget Variance', baseline: '5.2%', target: '3%', weight: '20%' },
      { name: 'Forecast Accuracy', baseline: '92%', target: '95%', weight: '10%' }
    ],
    competencies: [
      'Financial Analysis',
      'Budgeting & Forecasting',
      'Excel & Financial Systems',
      'Attention to Detail'
    ],
    authority: {
      budget: 'Budget preparation and monitoring',
      approvals: 'Expense approval within assigned limits'
    },
    reviewCycles: [
      { cycle: 'Monthly', description: 'Financial reporting' },
      { cycle: 'Quarterly', description: 'Budget review with management' }
    ]
  },
  'IT Manager': {
    title: 'IT Manager',
    department: 'Information Technology',
    reportsTo: 'Senior Management / CIO',
    directReports: 'IT Staff, System Administrators',
    location: 'Head Office',
    jobPurpose: 'The IT Manager oversees all technology infrastructure, ensures system availability, and leads digital transformation initiatives.',
    responsibilities: [
      {
        category: 'IT Operations',
        items: [
          'Maintain 99.9% system uptime',
          'Oversee IT infrastructure and network security',
          'Manage IT budget and vendor relationships'
        ]
      },
      {
        category: 'Project Delivery',
        items: [
          'Lead technology implementation projects',
          'Ensure on-time delivery of IT initiatives',
          'Manage change management processes'
        ]
      }
    ],
    kpis: [
      { name: 'System Uptime', baseline: '99.5%', target: '99.9%', weight: '25%' },
      { name: 'Mean Time to Recovery', baseline: '2.5 hours', target: '1.5 hours', weight: '20%' },
      { name: 'Change Success Rate', baseline: '94%', target: '98%', weight: '15%' },
      { name: 'Project On-Time Delivery', baseline: '85%', target: '90%', weight: '10%' }
    ],
    competencies: [
      'Technical Leadership',
      'Project Management',
      'Security Management',
      'Vendor Management'
    ],
    authority: {
      budget: 'IT budget management',
      vendor: 'Vendor selection and contracts'
    },
    reviewCycles: [
      { cycle: 'Monthly', description: 'IT metrics review' },
      { cycle: 'Quarterly', description: 'Project delivery review' }
    ]
  },
  'Recoveries Coordinator': {
    title: 'Recoveries Coordinator',
    department: 'Recoveries',
    reportsTo: 'Risk Manager / Collections Manager',
    directReports: 'Recovery Agents',
    location: 'Head Office',
    jobPurpose: 'The Recoveries Coordinator manages the recovery of delinquent accounts, implements collection strategies, and maximizes recovery rates.',
    responsibilities: [
      {
        category: 'Recovery Operations',
        items: [
          'Oversee end-to-end recovery process',
          'Implement recovery strategies and scripts',
          'Monitor recovery performance metrics'
        ]
      },
      {
        category: 'Legal Escalation',
        items: [
          'Manage legal escalation process',
          'Coordinate with legal team on litigation cases',
          'Track legal recovery outcomes'
        ]
      }
    ],
    kpis: [
      { name: 'Total Recovery Amount', baseline: 'K850,000', target: 'K1,000,000', weight: '25%' },
      { name: 'Recovery Rate', baseline: '68%', target: '75%', weight: '25%' },
      { name: 'Avg Days to Recovery', baseline: '45 days', target: '35 days', weight: '20%' },
      { name: 'Legal Escalation Rate', baseline: '8%', target: '5%', weight: '15%' }
    ],
    competencies: [
      'Negotiation Skills',
      'Debt Collection',
      'Legal Knowledge',
      'Performance Management'
    ],
    authority: {
      paymentPlans: 'Approve payment plans',
      legal: 'Recommend legal escalation'
    },
    reviewCycles: [
      { cycle: 'Weekly', description: 'Recovery performance review' },
      { cycle: 'Monthly', description: 'Monthly recovery targets' }
    ]
  },
  'Risk Manager': {
    title: 'Risk Manager',
    department: 'Risk Management',
    reportsTo: 'Senior Management / CRO',
    directReports: 'Risk Analysts',
    location: 'Head Office',
    jobPurpose: 'The Risk Manager identifies, assesses, and mitigates organizational risks while ensuring compliance with regulatory requirements.',
    responsibilities: [
      {
        category: 'Risk Assessment',
        items: [
          'Conduct regular risk assessments',
          'Develop risk mitigation strategies',
          'Monitor risk indicators and early warning signs'
        ]
      },
      {
        category: 'Compliance',
        items: [
          'Ensure regulatory compliance across the organization',
          'Lead internal audit processes',
          'Address audit findings and implement recommendations'
        ]
      }
    ],
    kpis: [
      { name: 'Risk Score', baseline: '32', target: '25', weight: '25%' },
      { name: 'Compliance Score', baseline: '96%', target: '99%', weight: '20%' },
      { name: 'Audit Findings', baseline: '3', target: '1', weight: '20%' },
      { name: 'Risk Mitigation Rate', baseline: '82%', target: '90%', weight: '20%' }
    ],
    competencies: [
      'Risk Analysis',
      'Regulatory Knowledge',
      'Audit Skills',
      'Strategic Thinking'
    ],
    authority: {
      risk: 'Risk acceptance decisions',
      compliance: 'Compliance exception approvals'
    },
    reviewCycles: [
      { cycle: 'Monthly', description: 'Risk dashboard review' },
      { cycle: 'Quarterly', description: 'Comprehensive risk assessment' }
    ]
  },
  'Policy & Training Manager': {
    title: 'Policy & Training Manager',
    department: 'Human Resources / Operations',
    reportsTo: 'HR Director / Operations Director',
    directReports: 'Training Coordinators',
    location: 'Head Office',
    jobPurpose: 'The Policy & Training Manager develops and implements training programs, ensures policy compliance, and supports talent development across the organization.',
    responsibilities: [
      {
        category: 'Training & Development',
        items: [
          'Design and deliver training programs',
          'Monitor training effectiveness and participant feedback',
          'Develop onboarding programs for new hires'
        ]
      },
      {
        category: 'Policy Management',
        items: [
          'Develop and update organizational policies',
          'Ensure policy acknowledgment and compliance',
          'Communicate policy changes to staff'
        ]
      }
    ],
    kpis: [
      { name: 'Training Completion Rate', baseline: '88%', target: '95%', weight: '30%' },
      { name: 'Training Effectiveness Score', baseline: '4.1', target: '4.3', weight: '20%' },
      { name: 'New Hire Onboarding Time', baseline: '14 days', target: '10 days', weight: '15%' },
      { name: 'Policy Acknowledgment', baseline: '98%', target: '100%', weight: '20%' }
    ],
    competencies: [
      'Instructional Design',
      'Training Delivery',
      'Policy Development',
      'Communication'
    ],
    authority: {
      training: 'Training program approval',
      policy: 'Policy development and updates'
    },
    reviewCycles: [
      { cycle: 'Monthly', description: 'Training metrics review' },
      { cycle: 'Quarterly', description: 'Training effectiveness review' }
    ]
  },
  'Motor Vehicles Manager': {
    title: 'Motor Vehicles Manager',
    department: 'Lending / Operations',
    reportsTo: 'Operations Director / Branch Manager',
    directReports: 'MV Sales Team',
    location: 'Branch Office',
    jobPurpose: 'The Motor Vehicles Manager oversees the motor vehicle loan portfolio, develops dealer partnerships, and drives MV loan disbursement growth.',
    responsibilities: [
      {
        category: 'MV Loan Portfolio',
        items: [
          'Manage motor vehicle loan portfolio performance',
          'Monitor MV default rates and recovery',
          'Develop strategies to reduce MV loan defaults'
        ]
      },
      {
        category: 'Dealer Partnerships',
        items: [
          'Develop and maintain dealer relationships',
          'Negotiate partnership terms',
          'Expand dealer network'
        ]
      }
    ],
    kpis: [
      { name: 'MV Loan Disbursement', baseline: 'K280,000', target: 'K350,000', weight: '25%' },
      { name: 'MV Default Rate', baseline: '2.1%', target: '1.8%', weight: '20%' },
      { name: 'MV Recovery Rate', baseline: '97%', target: '98%', weight: '20%' },
      { name: 'Dealer Partnerships', baseline: '12', target: '15', weight: '15%' }
    ],
    competencies: [
      'Sales Management',
      'Dealer Relations',
      'Product Knowledge',
      'Portfolio Management'
    ],
    authority: {
      pricing: 'MV loan pricing recommendations',
      dealer: 'Dealer partnership approvals'
    },
    reviewCycles: [
      { cycle: 'Monthly', description: 'MV portfolio review' },
      { cycle: 'Quarterly', description: 'Dealer partnership review' }
    ]
  },
  'Payroll Loans Manager': {
    title: 'Payroll Loans Manager',
    department: 'Lending / Operations',
    reportsTo: 'Operations Director',
    directReports: 'Payroll Sales Team',
    location: 'Head Office',
    jobPurpose: 'The Payroll Loans Manager manages the payroll loan portfolio, maintains employer relationships, and ensures efficient payroll deduction processes.',
    responsibilities: [
      {
        category: 'Payroll Loan Management',
        items: [
          'Oversee payroll loan portfolio',
          'Monitor payroll deduction accuracy',
          'Develop strategies for payroll loan growth'
        ]
      },
      {
        category: 'Employer Relations',
        items: [
          'Maintain relationships with employer partners',
          'Negotiate new payroll agreements',
          'Expand employer network'
        ]
      }
    ],
    kpis: [
      { name: 'Payroll Loan Disbursement', baseline: 'K520,000', target: 'K600,000', weight: '25%' },
      { name: 'Payroll Default Rate', baseline: '1.8%', target: '1.5%', weight: '20%' },
      { name: 'Employer Partnerships', baseline: '45', target: '55', weight: '20%' },
      { name: 'Payroll Deduction Accuracy', baseline: '99.5%', target: '99.9%', weight: '20%' }
    ],
    competencies: [
      'Employer Relations',
      'Payroll Processing',
      'Portfolio Management',
      'Negotiation'
    ],
    authority: {
      approval: 'Payroll loan approvals',
      employer: 'Employer agreement negotiations'
    },
    reviewCycles: [
      { cycle: 'Monthly', description: 'Payroll loan review' },
      { cycle: 'Quarterly', description: 'Employer partnership review' }
    ]
  },
  // Default templates for other positions
  'General Operations Administrator (GOA)': {
    title: 'GOA',
    department: 'Administration',
    reportsTo: 'Operations Manager',
    directReports: 'Administrative Staff',
    location: 'Head Office',
    jobPurpose: 'Supports operational efficiency through administrative excellence and process coordination.',
    responsibilities: [
      {
        category: 'Administrative Support',
        items: [
          'Provide administrative support to operations',
          'Coordinate cross-departmental activities',
          'Maintain accurate records and documentation'
        ]
      }
    ],
    kpis: [
      { name: 'Ticket Resolution Time', baseline: '24 hours', target: '18 hours', weight: '25%' },
      { name: 'Document Accuracy', baseline: '98.5%', target: '99%', weight: '20%' },
      { name: 'Request Completion Rate', baseline: '95%', target: '98%', weight: '20%' }
    ],
    competencies: [
      'Organization',
      'Communication',
      'Problem Solving'
    ],
    authority: {},
    reviewCycles: [
      { cycle: 'Monthly', description: 'Administrative metrics review' }
    ]
  },
  'IT Coordinator': {
    title: 'IT Coordinator',
    department: 'Information Technology',
    reportsTo: 'IT Manager',
    directReports: 'IT Support Staff',
    location: 'Head Office',
    jobPurpose: 'Coordinates IT support services and ensures efficient resolution of technical issues.',
    responsibilities: [
      {
        category: 'IT Support',
        items: [
          'Coordinate IT support operations',
          'Monitor ticket resolution times',
          'Ensure first contact resolution targets are met'
        ]
      }
    ],
    kpis: [
      { name: 'First Contact Resolution', baseline: '78%', target: '85%', weight: '30%' },
      { name: 'Average Response Time', baseline: '45 minutes', target: '30 minutes', weight: '25%' },
      { name: 'Ticket Backlog', baseline: '25', target: '15', weight: '20%' }
    ],
    competencies: [
      'Technical Support',
      'Problem Solving',
      'Communication'
    ],
    authority: {},
    reviewCycles: [
      { cycle: 'Weekly', description: 'Support metrics review' }
    ]
  },
  'Manager Administration': {
    title: 'Administration Manager',
    department: 'Administration',
    reportsTo: 'Senior Management',
    directReports: 'Administrative Team',
    location: 'Head Office',
    jobPurpose: 'Manages administrative functions and ensures efficient facility and document management.',
    responsibilities: [
      {
        category: 'Administration Management',
        items: [
          'Oversee administrative operations',
          'Manage facility utilization',
          'Ensure document processing efficiency'
        ]
      }
    ],
    kpis: [
      { name: 'Document Processing Time', baseline: '2.5 hours', target: '2.0 hours', weight: '25%' },
      { name: 'Administrative Cost Efficiency', baseline: '88%', target: '92%', weight: '25%' },
      { name: 'Facility Utilization', baseline: '85%', target: '90%', weight: '20%' }
    ],
    competencies: [
      'Leadership',
      'Organization',
      'Resource Management'
    ],
    authority: {},
    reviewCycles: [
      { cycle: 'Monthly', description: 'Administrative review' }
    ]
  },
  'Administration': {
    title: 'Administration Staff',
    department: 'Administration',
    reportsTo: 'Administration Manager',
    directReports: 'None',
    location: 'Head Office',
    jobPurpose: 'Provides day-to-day administrative support to ensure smooth office operations.',
    responsibilities: [
      {
        category: 'Daily Operations',
        items: [
          'Handle incoming requests and inquiries',
          'Maintain filing and documentation',
          'Support office logistics'
        ]
      }
    ],
    kpis: [
      { name: 'Request Fulfillment Rate', baseline: '94%', target: '98%', weight: '35%' },
      { name: 'Response Time', baseline: '1.5 hours', target: '1.0 hour', weight: '30%' }
    ],
    competencies: [
      'Organization',
      'Communication',
      'Attention to Detail'
    ],
    authority: {},
    reviewCycles: [
      { cycle: 'Monthly', description: 'Performance review' }
    ]
  },
  'District Regional Manager': {
    title: 'Regional Manager',
    department: 'Regional Management',
    reportsTo: 'Provincial Manager',
    directReports: 'District Managers',
    location: 'Regional Office',
    jobPurpose: 'Oversees regional operations and drives growth initiatives across multiple districts.',
    responsibilities: [
      {
        category: 'Regional Oversight',
        items: [
          'Coordinate district activities within the region',
          'Drive regional growth initiatives',
          'Monitor regional performance metrics'
        ]
      }
    ],
    kpis: [
      { name: 'Regional Disbursement', baseline: 'TBD', target: 'TBD', weight: '25%' },
      { name: 'Regional Default Rate', baseline: '2.5%', target: '2.2%', weight: '20%' },
      { name: 'Regional Growth', baseline: '12%', target: '15%', weight: '10%' }
    ],
    competencies: [
      'Strategic Leadership',
      'Regional Coordination',
      'Performance Management'
    ],
    authority: {},
    reviewCycles: [
      { cycle: 'Monthly', description: 'Regional review' }
    ]
  },
  'General Operations Manager': {
    title: 'Operations Manager',
    department: 'Operations',
    reportsTo: 'GOM / Senior Management',
    directReports: 'Team Leads',
    location: 'Head Office',
    jobPurpose: 'Manages day-to-day operations and ensures operational efficiency.',
    responsibilities: [
      {
        category: 'Operations Management',
        items: [
          'Oversee daily operations',
          'Implement process improvements',
          'Monitor operational metrics'
        ]
      }
    ],
    kpis: [
      { name: 'Operational Efficiency', baseline: '88%', target: '92%', weight: '30%' },
      { name: 'Process Optimization', baseline: '82%', target: '88%', weight: '25%' },
      { name: 'Cost Reduction', baseline: '5.2%', target: '7%', weight: '25%' }
    ],
    competencies: [
      'Operations Management',
      'Process Improvement',
      'Team Leadership'
    ],
    authority: {},
    reviewCycles: [
      { cycle: 'Monthly', description: 'Operations review' }
    ]
  },
  'Performance Operations Administrator (POA)': {
    title: 'POA',
    department: 'Performance Management',
    reportsTo: 'Performance Manager',
    directReports: 'None',
    location: 'Head Office',
    jobPurpose: 'Supports performance monitoring and operations reporting across the organization.',
    responsibilities: [
      {
        category: 'Performance Monitoring',
        items: [
          'Track KPI data accuracy',
          'Generate performance reports',
          'Support performance review processes'
        ]
      }
    ],
    kpis: [
      { name: 'KPI Data Accuracy', baseline: '98%', target: '99%', weight: '30%' },
      { name: 'Report Timeliness', baseline: '96%', target: '100%', weight: '25%' },
      { name: 'Performance Review Completion', baseline: '92%', target: '98%', weight: '25%' }
    ],
    competencies: [
      'Data Analysis',
      'Reporting',
      'Attention to Detail'
    ],
    authority: {},
    reviewCycles: [
      { cycle: 'Monthly', description: 'Performance data review' }
    ]
  },
  'R&D Coordinator': {
    title: 'R&D Coordinator',
    department: 'Research & Development',
    reportsTo: 'R&D Manager / Innovation Head',
    directReports: 'Research Team',
    location: 'Head Office / Innovation Center',
    jobPurpose: 'Coordinates research initiatives and drives innovation projects.',
    responsibilities: [
      {
        category: 'Research Coordination',
        items: [
          'Coordinate research projects',
          'Support innovation initiatives',
          'Track research outcomes'
        ]
      }
    ],
    kpis: [
      { name: 'Projects Completed', baseline: '3', target: '4', weight: '25%' },
      { name: 'Innovation Index', baseline: '72', target: '80', weight: '25%' },
      { name: 'Research Adoption Rate', baseline: '65%', target: '75%', weight: '25%' }
    ],
    competencies: [
      'Research Methods',
      'Innovation',
      'Project Coordination'
    ],
    authority: {},
    reviewCycles: [
      { cycle: 'Quarterly', description: 'R&D review' }
    ]
  },
  'Creative Artwork & Marketing Representative Manager': {
    title: 'Marketing Manager',
    department: 'Marketing',
    reportsTo: 'Marketing Director / Senior Management',
    directReports: 'Marketing Staff',
    location: 'Head Office',
    jobPurpose: 'Leads marketing initiatives, creative campaigns, and brand development.',
    responsibilities: [
      {
        category: 'Marketing & Branding',
        items: [
          'Develop and execute marketing strategies',
          'Manage creative campaigns',
          'Drive lead generation initiatives'
        ]
      }
    ],
    kpis: [
      { name: 'Campaign Reach', baseline: '85,000', target: '100,000', weight: '25%' },
      { name: 'Lead Generation', baseline: '420', target: '500', weight: '25%' },
      { name: 'Conversion Rate', baseline: '3.2%', target: '4.0%', weight: '20%' },
      { name: 'Marketing ROI', baseline: '285%', target: '350%', weight: '15%' }
    ],
    competencies: [
      'Marketing Strategy',
      'Creative Direction',
      'Analytics',
      'Brand Management'
    ],
    authority: {},
    reviewCycles: [
      { cycle: 'Monthly', description: 'Marketing performance review' }
    ]
  }
};

// Helper function to get current user's position
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
    const position = user.position?.trim();
    return position || 'Branch Manager';
  } catch (e) {
    console.error('Error parsing user data:', e);
    return 'Branch Manager';
  }
}

// Type definitions
export interface RoleCardConfig {
  title: string;
  department: string;
  reportsTo: string;
  directReports: string;
  location: string;
  jobPurpose: string;
  responsibilities: ResponsibilityCategory[];
  kpis: KPIItem[];
  competencies: string[];
  authority: AuthorityConfig;
  reviewCycles: ReviewCycle[];
}

export interface ResponsibilityCategory {
  category: string;
  items: string[];
}

export interface KPIItem {
  name: string;
  baseline: string;
  target: string;
  weight: string;
}

export interface AuthorityConfig {
  hiring?: string;
  creditDecisions?: string;
  portfolio?: string;
  budget?: string;
  pricing?: string;
  dealer?: string;
  approval?: string;
  employer?: string;
  risk?: string;
  compliance?: string;
  paymentPlans?: string;
  legal?: string;
  [key: string]: string | undefined;
}

export interface ReviewCycle {
  cycle: string;
  description: string;
}

// Default fallback for unknown positions
export const defaultRoleCard: RoleCardConfig = {
  title: 'Position',
  department: 'TBD',
  reportsTo: 'TBD',
  directReports: 'TBD',
  location: 'TBD',
  jobPurpose: 'Position responsibilities to be defined.',
  responsibilities: [],
  kpis: [],
  competencies: [],
  authority: {},
  reviewCycles: []
};

export default roleCardsData;
