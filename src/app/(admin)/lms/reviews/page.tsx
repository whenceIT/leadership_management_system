"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useUserPosition, 
  AVAILABLE_POSITIONS, 
  PositionType,
  getUserPosition 
} from '@/hooks/useUserPosition';

// Position type matching the system available positions
type Position = PositionType;

// Interface for review items
interface ReviewItem {
  id: number;
  type: string;
  title: string;
  status: string;
  assignee: string;
  dueDate: string;
  progress: number;
}

// Interface for checklist items
interface ChecklistItem {
  id: number;
  title: string;
  completed: boolean;
  category?: string;
}

// Generic mock data structure customized per position
interface PositionReviewConfig {
  position: Position;
  displayName: string;
  reviewType: string;
  upcomingReviews: ReviewItem[];
  checklistItems: ChecklistItem[];
  kpis: { name: string; value: string; target: string; status: 'on-track' | 'at-risk' | 'behind'; }[];
  tierInfo?: {
    currentTier: string;
    nextTier: string;
    tierTarget: string;
    monthsInCurrentTier: number;
    progressionCriteria: string[];
  };
}

// Normalize position name to match AVAILABLE_POSITIONS
function normalizePosition(position: string): Position {
  const normalized = position.trim();
  
  // Map common variations to AVAILABLE_POSITIONS
  const positionMap: Record<string, Position> = {
    'Creative Artwork & Marketing Representative Manager': 'Creative Artwork & Marketing Representative Manager',
    'Creative Artwork Marketing Representative Manager': 'Creative Artwork & Marketing Representative Manager',
    'Creative Artwork Representative Manager': 'Creative Artwork & Marketing Representative Manager',
    'Marketing Manager': 'Creative Artwork & Marketing Representative Manager',
    'Administration': 'Administration',
    'Manager Admin': 'Manager Administration',
    'Manager Administration': 'Manager Administration',
    'Branch Manager': 'Branch Manager',
    'District Manager': 'District Manager',
    'General Operations Administrator': 'General Operations Administrator (GOA)',
    'GOA': 'General Operations Administrator (GOA)',
    'General Operations Manager (GOM)': 'General Operations Manager (GOM)',
    'GOM': 'General Operations Manager (GOM)',
    // Map plain 'General Operations Manager' to GOM to avoid type issues
    'General Operations Manager': 'General Operations Manager (GOM)',
    'IT Coordinator': 'IT Coordinator',
    'IT Manager': 'IT Manager',
    'Management Accountant': 'Management Accountant',
    'MA': 'Management Accountant',
    'Motor Vehicles Manager': 'Motor Vehicles Manager',
    'Motor Vehicle Manager': 'Motor Vehicles Manager',
    'Motor Vehicles Collateral Loans Manager': 'Motor Vehicles Manager',
    'Payroll Loans Manager': 'Payroll Loans Manager',
    'Payroll Manager': 'Payroll Loans Manager',
    'Performance Operations Administrator': 'Performance Operations Administrator (POA)',
    'POA': 'Performance Operations Administrator (POA)',
    'Performance Operations Manager': 'Performance Operations Administrator (POA)',
    'Policy & Training Manager': 'Policy & Training Manager',
    'Policy Training Manager': 'Policy & Training Manager',
    'PTM': 'Policy & Training Manager',
    'Provincial Manager': 'Provincial Manager',
    'PM': 'Provincial Manager',
    'R&D Coordinator': 'R&D Coordinator',
    'Research Development Coordinator': 'R&D Coordinator',
    'Recoveries Coordinator': 'Recoveries Coordinator',
    'Recoveries Manager': 'Recoveries Coordinator',
    'Risk Manager': 'Risk Manager',
    'District Regional Manager': 'District Regional Manager',
    'Super Seer': 'Super Seer',
    'Loan Consultant': 'Loan Consultant',
  };

  // If position exists in AVAILABLE_POSITIONS, use it directly
  if (AVAILABLE_POSITIONS.includes(normalized as Position)) {
    return normalized as Position;
  }

  // Try to find in position map
  if (positionMap[normalized]) {
    return positionMap[normalized];
  }

  // Default fallback to Branch Manager
  return 'Branch Manager';
}

// Branch Manager Review Configuration
const getBranchManagerConfig = (): PositionReviewConfig => ({
  position: 'Branch Manager',
  displayName: 'Branch Manager',
  reviewType: 'Monthly Performance Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'Monthly Review',
      title: 'February Disbursement & Collection Review',
      status: 'In Progress',
      assignee: 'Branch Manager',
      dueDate: '2024-02-28',
      progress: 65,
    },
    {
      id: 2,
      type: 'Quarterly Assessment',
      title: 'Q1 Progression Assessment',
      status: 'Pending',
      assignee: 'District Manager',
      dueDate: '2024-03-15',
      progress: 0,
    },
    {
      id: 3,
      type: 'Monthly Review',
      title: 'LC Performance Evaluation',
      status: 'Due in 3 days',
      assignee: 'Branch Manager',
      dueDate: '2024-02-10',
      progress: 40,
    },
  ],
  checklistItems: [
    { id: 1, title: 'Monthly Disbursement Target (K450,000+)', completed: true, category: 'Financial' },
    { id: 2, title: 'Month-1 Default Rate (≤25%)', completed: false, category: 'Risk' },
    { id: 3, title: 'Collections Waterfall Implementation', completed: true, category: 'Operations' },
    { id: 4, title: 'LC Tier Performance Review', completed: false, category: 'Team' },
    { id: 5, title: 'Portfolio Quality Assessment', completed: true, category: 'Risk' },
    { id: 6, title: 'Motor Vehicle Loan Referrals', completed: false, category: 'Growth' },
    { id: 7, title: 'Staff Development & Training', completed: true, category: 'Team' },
    { id: 8, title: 'Compliance & Policy Review', completed: true, category: 'Compliance' },
  ],
  kpis: [
    { name: 'Monthly Disbursement', value: 'K420,000', target: 'K450,000+', status: 'on-track' },
    { name: 'Month-1 Default Rate', value: '26.5%', target: '≤25%', status: 'at-risk' },
    { name: 'Recovery Rate (Month-4)', value: '62%', target: '≥65%', status: 'at-risk' },
    { name: 'LCs at K50K+ Tier', value: '35%', target: '≥40%', status: 'on-track' },
    { name: 'Net Contribution', value: 'K295,000', target: 'K324,000+', status: 'on-track' },
  ],
  tierInfo: {
    currentTier: 'Branch Manager',
    nextTier: 'District Manager',
    tierTarget: 'K580,314+ monthly',
    monthsInCurrentTier: 8,
    progressionCriteria: [
      'Achieve K580,314+ monthly revenue for 3 consecutive months',
      'Reduce Month-1 default rate to ≤22%',
      'Develop 2+ LC candidates for promotion',
      'Complete satellite branch expansion project',
    ],
  },
});

// District Manager Review Configuration
const getDistrictManagerConfig = (): PositionReviewConfig => ({
  position: 'District Manager',
  displayName: 'District Manager',
  reviewType: 'Quarterly Performance Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'Quarterly Review',
      title: 'Q1 Cross-Branch Performance Review',
      status: 'In Progress',
      assignee: 'District Manager',
      dueDate: '2024-03-20',
      progress: 55,
    },
    {
      id: 2,
      type: 'Strategic Assessment',
      title: 'District Default Reduction Analysis',
      status: 'Due in 5 days',
      assignee: 'Provincial Manager',
      dueDate: '2024-02-15',
      progress: 30,
    },
  ],
  checklistItems: [
    { id: 1, title: 'Cross-Branch Default Reduction (3% improvement)', completed: false, category: 'Strategic' },
    { id: 2, title: 'Recovery Rate Lift (2+ percentage points)', completed: true, category: 'Operations' },
    { id: 3, title: 'Best Practice Adoption Across Branches', completed: true, category: 'Team' },
    { id: 4, title: 'District Audit Compliance (100%)', completed: true, category: 'Compliance' },
    { id: 5, title: 'Branch Manager Development Sessions', completed: false, category: 'Leadership' },
    { id: 6, title: 'Inter-Branch Issue Resolution', completed: true, category: 'Operations' },
    { id: 7, title: 'Risk Escalation Timeliness', completed: false, category: 'Risk' },
  ],
  kpis: [
    { name: 'Cross-Branch Default Avg', value: '26.8%', target: '≤25.36%', status: 'at-risk' },
    { name: 'District Recovery Rate', value: '58%', target: '≥58.05%', status: 'on-track' },
    { name: 'Audit Compliance', value: '100%', target: '100%', status: 'on-track' },
    { name: 'Best Practice Rollout', value: '85%', target: '100%', status: 'at-risk' },
    { name: 'Talent Pipeline (Promotions)', value: '1', target: '≥2/year', status: 'at-risk' },
  ],
  tierInfo: {
    currentTier: 'Tier 3',
    nextTier: 'Tier 2',
    tierTarget: 'K1,160,628+ monthly',
    monthsInCurrentTier: 14,
    progressionCriteria: [
      'Achieve K1,160,628+ monthly district revenue',
      'Maintain 3+ branches under supervision',
      'Mother branch contributes ≥50% of district revenue',
    ],
  },
});

// Manager Administration Review Configuration
const getManagerAdminConfig = (): PositionReviewConfig => ({
  position: 'Manager Administration',
  displayName: 'Manager Administration',
  reviewType: 'Quarterly Administration Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'Quarterly Review',
      title: 'Q1 Administrative Excellence Assessment',
      status: 'In Progress',
      assignee: 'Manager Administration',
      dueDate: '2024-03-25',
      progress: 70,
    },
    {
      id: 2,
      type: 'Functional Review',
      title: 'GOM, POM, PTM Performance Review',
      status: 'Pending',
      assignee: 'Technical Director',
      dueDate: '2024-03-30',
      progress: 0,
    },
  ],
  checklistItems: [
    { id: 1, title: 'Total Value Preserved/Enabled (≥K3M annually)', completed: true, category: 'Value' },
    { id: 2, title: 'Administrative Cost Ratio (≤11%)', completed: true, category: 'Efficiency' },
    { id: 3, title: 'Function Integration Index (≥70%)', completed: false, category: 'Integration' },
    { id: 4, title: 'Cross-Functional Synergy Value (≥K2M)', completed: true, category: 'Value' },
    { id: 5, title: 'Succession Plans for Function Heads', completed: false, category: 'Leadership' },
    { id: 6, title: 'Strategic Initiative Success Rate', completed: true, category: 'Strategy' },
    { id: 7, title: 'Scalability Readiness (2x growth)', completed: true, category: 'Growth' },
  ],
  kpis: [
    { name: 'Value Preserved', value: 'K3.2M', target: '≥K3M', status: 'on-track' },
    { name: 'Admin Cost Ratio', value: '10.2%', target: '≤11%', status: 'on-track' },
    { name: 'Function Integration', value: '65%', target: '≥70%', status: 'at-risk' },
    { name: 'Executive Satisfaction', value: '88%', target: '≥85%', status: 'on-track' },
  ],
  tierInfo: {
    currentTier: 'Tier 3',
    nextTier: 'Tier 2',
    tierTarget: 'K7M+ annually',
    monthsInCurrentTier: 12,
    progressionCriteria: [
      'Achieve ≥K7M annual value preserved/enabled',
      'Lead 1+ major cross-functional transformation',
      'Implement predictive/preventive systems',
      'Establish succession pipelines for all key roles',
    ],
  },
});

// IT Coordinator Review Configuration
const getITCoordinatorConfig = (): PositionReviewConfig => ({
  position: 'IT Coordinator',
  displayName: 'IT Coordinator',
  reviewType: 'Quarterly Technical Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'System Review',
      title: 'IT Infrastructure Assessment',
      status: 'In Progress',
      assignee: 'IT Coordinator',
      dueDate: '2024-02-28',
      progress: 80,
    },
    {
      id: 2,
      type: 'Project Review',
      title: 'ERP Phase 1 Implementation',
      status: 'Due in 7 days',
      assignee: 'Technical Director',
      dueDate: '2024-02-17',
      progress: 90,
    },
  ],
  checklistItems: [
    { id: 1, title: 'System Uptime (≥99%)', completed: true, category: 'Reliability' },
    { id: 2, title: 'Outsourcing Reduction to ≤70%', completed: true, category: 'Efficiency' },
    { id: 3, title: 'Major Project Delivery (2+ projects)', completed: false, category: 'Projects' },
    { id: 4, title: 'User Satisfaction (≥85%)', completed: true, category: 'Users' },
    { id: 5, title: 'Security Audit Zero Critical Findings', completed: true, category: 'Security' },
    { id: 6, title: 'IT Governance Implementation', completed: false, category: 'Governance' },
  ],
  kpis: [
    { name: 'System Uptime', value: '99.2%', target: '≥99%', status: 'on-track' },
    { name: 'Outsourcing Rate', value: '65%', target: '≤70%', status: 'on-track' },
    { name: 'Projects Delivered', value: '1/2', target: '≥2', status: 'at-risk' },
    { name: 'User Satisfaction', value: '87%', target: '≥85%', status: 'on-track' },
    { name: 'Security Incidents', value: '0', target: '0', status: 'on-track' },
  ],
  tierInfo: {
    currentTier: 'IT Coordinator',
    nextTier: 'IT Manager Tier 3',
    tierTarget: 'K10M+ annual value',
    monthsInCurrentTier: 10,
    progressionCriteria: [
      'Achieve ≥99.5% system uptime',
      'Reduce outsourcing to ≤50%',
      'Deliver ERP go-live successfully',
      'Zero critical security findings',
    ],
  },
});

// IT Manager Review Configuration
const getITManagerConfig = (): PositionReviewConfig => ({
  position: 'IT Manager',
  displayName: 'IT Manager',
  reviewType: 'Quarterly Technical Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'System Review',
      title: 'IT Infrastructure Assessment',
      status: 'In Progress',
      assignee: 'IT Manager',
      dueDate: '2024-02-28',
      progress: 75,
    },
    {
      id: 2,
      type: 'Project Review',
      title: 'ERP Phase 1 Implementation',
      status: 'Due in 7 days',
      assignee: 'Technical Director',
      dueDate: '2024-02-17',
      progress: 85,
    },
  ],
  checklistItems: [
    { id: 1, title: 'System Uptime (≥99.5%)', completed: true, category: 'Reliability' },
    { id: 2, title: 'Outsourcing Reduction to ≤50%', completed: false, category: 'Efficiency' },
    { id: 3, title: 'Major Project Delivery (3+ projects)', completed: false, category: 'Projects' },
    { id: 4, title: 'User Satisfaction (≥90%)', completed: true, category: 'Users' },
    { id: 5, title: 'Security Audit Zero Critical Findings', completed: true, category: 'Security' },
    { id: 6, title: 'IT Governance Implementation', completed: true, category: 'Governance' },
  ],
  kpis: [
    { name: 'System Uptime', value: '99.5%', target: '≥99.5%', status: 'on-track' },
    { name: 'Outsourcing Rate', value: '55%', target: '≤50%', status: 'at-risk' },
    { name: 'Projects Delivered', value: '1/3', target: '≥3', status: 'at-risk' },
    { name: 'User Satisfaction', value: '90%', target: '≥90%', status: 'on-track' },
    { name: 'Security Incidents', value: '0', target: '0', status: 'on-track' },
  ],
  tierInfo: {
    currentTier: 'IT Manager Tier 3',
    nextTier: 'IT Manager Tier 2',
    tierTarget: 'K15M+ annual value',
    monthsInCurrentTier: 12,
    progressionCriteria: [
      'Achieve ≥99.5% system uptime for 6+ months',
      'Reduce outsourcing to ≤50%',
      'Deliver ERP go-live successfully',
      'Zero critical security findings',
    ],
  },
});

// Management Accountant Review Configuration
const getManagementAccountantConfig = (): PositionReviewConfig => ({
  position: 'Management Accountant',
  displayName: 'Management Accountant',
  reviewType: 'Quarterly Finance Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'Financial Review',
      title: 'Q1 Financial Control Assessment',
      status: 'In Progress',
      assignee: 'Management Accountant',
      dueDate: '2024-03-15',
      progress: 60,
    },
    {
      id: 2,
      type: 'System Review',
      title: 'ERP Implementation Progress',
      status: 'Due in 10 days',
      assignee: 'Executive Chairperson',
      dueDate: '2024-02-20',
      progress: 75,
    },
  ],
  checklistItems: [
    { id: 1, title: 'ERP Go-Live Success (on schedule)', completed: true, category: 'Systems' },
    { id: 2, title: 'AI Agent Utilization (≥80%)', completed: false, category: 'Automation' },
    { id: 3, title: 'Financial Control Gap Closure (100%)', completed: true, category: 'Controls' },
    { id: 4, title: 'Real-Time Reconciliation Accuracy (≥99.5%)', completed: true, category: 'Accuracy' },
    { id: 5, title: 'External Audit Opinion (Unqualified)', completed: false, category: 'Compliance' },
    { id: 6, title: 'Efficiency-Led Growth (≥K5M annually)', completed: true, category: 'Value' },
  ],
  kpis: [
    { name: 'ERP Progress', value: '75%', target: '100%', status: 'on-track' },
    { name: 'Control Gaps Closed', value: '85%', target: '100%', status: 'at-risk' },
    { name: 'Reconciliation Accuracy', value: '99.2%', target: '≥99.5%', status: 'on-track' },
    { name: 'Efficiency Value', value: 'K5.2M', target: '≥K5M', status: 'on-track' },
    { name: 'Executive Satisfaction', value: '82%', target: '≥85%', status: 'at-risk' },
  ],
  tierInfo: {
    currentTier: 'Tier 3',
    nextTier: 'Chief Accountant Tier 2',
    tierTarget: 'K10M+ annual value',
    monthsInCurrentTier: 16,
    progressionCriteria: [
      'Deliver clean external audit opinion',
      'Reduce financial control gaps by ≥80%',
      'Achieve K5M+ efficiency-led growth',
      'Executive satisfaction ≥85%',
    ],
  },
});

// Risk Manager Review Configuration
const getRiskManagerConfig = (): PositionReviewConfig => ({
  position: 'Risk Manager',
  displayName: 'Risk Manager',
  reviewType: 'Monthly Risk Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'Monthly Review',
      title: 'February Fraud & Loss Prevention Assessment',
      status: 'In Progress',
      assignee: 'Risk Manager',
      dueDate: '2024-02-28',
      progress: 70,
    },
    {
      id: 2,
      type: 'Quarterly Review',
      title: 'Q1 Portfolio Risk Assessment',
      status: 'Pending',
      assignee: 'Management Accountant',
      dueDate: '2024-03-15',
      progress: 0,
    },
  ],
  checklistItems: [
    { id: 1, title: 'Losses Prevented (≥K500,000 annually)', completed: true, category: 'Prevention' },
    { id: 2, title: 'Fraud Detection Rate (≥90%)', completed: true, category: 'Detection' },
    { id: 3, title: 'Time to Detect Fraud (≤7 days)', completed: false, category: 'Response' },
    { id: 4, title: 'Ghost Client Identification (100% sample)', completed: true, category: 'Prevention' },
    { id: 5, title: 'Cash Handling Compliance (100%)', completed: true, category: 'Compliance' },
    { id: 6, title: 'Incident Investigation Closure (≤14 days)', completed: false, category: 'Response' },
  ],
  kpis: [
    { name: 'Losses Prevented', value: 'K520,000', target: '≥K500,000', status: 'on-track' },
    { name: 'Fraud Detection Rate', value: '92%', target: '≥90%', status: 'on-track' },
    { name: 'Avg Detection Time', value: '5 days', target: '≤7 days', status: 'on-track' },
    { name: 'Cash Compliance', value: '100%', target: '100%', status: 'on-track' },
    { name: 'Recovery Rate on Fraud', value: '38%', target: '≥40%', status: 'at-risk' },
  ],
  tierInfo: {
    currentTier: 'Risk Manager',
    nextTier: 'Tier 3',
    tierTarget: 'K1.2M+ annually',
    monthsInCurrentTier: 18,
    progressionCriteria: [
      'Achieve ≥K1.2M annual losses prevented',
      'Reduce fraud incidents by ≥30%',
      'Build 1+ automated monitoring tool',
      'Branch Manager satisfaction ≥85%',
    ],
  },
});

// Recoveries Coordinator Review Configuration
const getRecoveriesCoordinatorConfig = (): PositionReviewConfig => ({
  position: 'Recoveries Coordinator',
  displayName: 'Recoveries Coordinator',
  reviewType: 'Weekly Recovery Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'Weekly Review',
      title: 'Week 6 Recovery Performance Review',
      status: 'In Progress',
      assignee: 'Recoveries Coordinator',
      dueDate: '2024-02-12',
      progress: 85,
    },
    {
      id: 2,
      type: 'Monthly Review',
      title: 'February Recovery Income Assessment',
      status: 'Due in 5 days',
      assignee: 'Head of Risk',
      dueDate: '2024-02-15',
      progress: 45,
    },
  ],
  checklistItems: [
    { id: 1, title: 'Total Monthly Recoveries (≥K190,000)', completed: true, category: 'Revenue' },
    { id: 2, title: 'Net Recovery Income Growth', completed: false, category: 'Sustainability' },
    { id: 3, title: 'Cost-to-Recovery Ratio (≤20%)', completed: true, category: 'Efficiency' },
    { id: 4, title: 'Overall Recovery Rate (≥65%)', completed: true, category: 'Effectiveness' },
    { id: 5, title: 'Parameter-Specific Success Rates', completed: false, category: 'Operations' },
    { id: 6, title: 'System Tagging Accuracy (100%)', completed: true, category: 'Compliance' },
  ],
  kpis: [
    { name: 'Monthly Recoveries', value: 'K195,000', target: '≥K190,000', status: 'on-track' },
    { name: 'Net Recovery Income', value: 'K156,000', target: '≥K152,000', status: 'on-track' },
    { name: 'Cost-to-Recovery', value: '18%', target: '≤20%', status: 'on-track' },
    { name: 'Recovery Rate', value: '67%', target: '≥65%', status: 'on-track' },
    { name: 'Self-Funding Progress', value: '82%', target: '100%', status: 'at-risk' },
  ],
  tierInfo: {
    currentTier: 'Coordinator',
    nextTier: 'Manager Level 3',
    tierTarget: 'K100,000+ monthly net',
    monthsInCurrentTier: 8,
    progressionCriteria: [
      'Cover all operational costs for 6+ months',
      'Achieve K100,000+ net recovery income for 3 months',
      'Implement comprehensive recovery strategy',
      'Establish all 5 parameters operational',
    ],
  },
});

// Policy & Training Manager Review Configuration
const getPolicyTrainingManagerConfig = (): PositionReviewConfig => ({
  position: 'Policy & Training Manager',
  displayName: 'Policy & Training Manager',
  reviewType: 'Quarterly Governance Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'Quarterly Review',
      title: 'Q1 Policy & Training Effectiveness',
      status: 'In Progress',
      assignee: 'Policy & Training Manager',
      dueDate: '2024-03-20',
      progress: 65,
    },
    {
      id: 2,
      type: 'Compliance Review',
      title: 'Regulatory Compliance Assessment',
      status: 'Due in 8 days',
      assignee: 'Manager Administration',
      dueDate: '2024-02-18',
      progress: 50,
    },
  ],
  checklistItems: [
    { id: 1, title: 'Policy Breach Incident Rate (≤2/year)', completed: true, category: 'Governance' },
    { id: 2, title: 'Training ROI (≥150%)', completed: false, category: 'Development' },
    { id: 3, title: 'Mandatory Training Completion (100%)', completed: true, category: 'Compliance' },
    { id: 4, title: 'Post-Training Behavior Change (≥80%)', completed: true, category: 'Effectiveness' },
    { id: 5, title: 'Regulatory Change Implementation (≤30 days)', completed: false, category: 'Responsiveness' },
    { id: 6, title: 'Value Protected/Enabled', completed: true, category: 'Value' },
  ],
  kpis: [
    { name: 'Policy Breaches', value: '1', target: '≤2', status: 'on-track' },
    { name: 'Training ROI', value: '135%', target: '≥150%', status: 'at-risk' },
    { name: 'Training Completion', value: '100%', target: '100%', status: 'on-track' },
    { name: 'Behavior Change', value: '82%', target: '≥80%', status: 'on-track' },
    { name: 'Value Protected', value: 'K780,000', target: '≥K750,000', status: 'on-track' },
  ],
  tierInfo: {
    currentTier: 'Tier 3',
    nextTier: 'Tier 2',
    tierTarget: 'K1.8M+ annually',
    monthsInCurrentTier: 14,
    progressionCriteria: [
      'Achieve ≥K1.8M annual value protected',
      'Reduce repeat violations by ≥40%',
      'Achieve ≥150% ROI on major training',
      'Strong cross-departmental influence',
    ],
  },
});

// Provincial Manager Review Configuration
const getProvincialManagerConfig = (): PositionReviewConfig => ({
  position: 'Provincial Manager',
  displayName: 'Provincial Manager',
  reviewType: 'Quarterly Strategic Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'Quarterly Review',
      title: 'Q1 Provincial Strategic Assessment',
      status: 'In Progress',
      assignee: 'Provincial Manager',
      dueDate: '2024-03-25',
      progress: 55,
    },
    {
      id: 2,
      type: 'Strategic Review',
      title: 'District Tier Re-Assessment',
      status: 'Pending',
      assignee: 'Technical Director',
      dueDate: '2024-04-01',
      progress: 0,
    },
  ],
  checklistItems: [
    { id: 1, title: 'Provincial Net Contribution (+25% YoY)', completed: true, category: 'Financial' },
    { id: 2, title: 'Long-Term Delinquency Reduction (5pp)', completed: false, category: 'Risk' },
    { id: 3, title: 'New Product/Channel Revenue (≥K500K)', completed: true, category: 'Growth' },
    { id: 4, title: 'Strategic Partnership Revenue (≥K1M)', completed: false, category: 'Partnerships' },
    { id: 5, title: 'District Manager Development (2+ promotions)', completed: true, category: 'Leadership' },
    { id: 6, title: 'Quarter-Ahead Risk Mitigation (100%)', completed: false, category: 'Strategy' },
  ],
  kpis: [
    { name: 'Net Contribution Growth', value: '22%', target: '+25%', status: 'at-risk' },
    { name: 'Delinquency Reduction', value: '3pp', target: '5pp', status: 'at-risk' },
    { name: 'New Product Revenue', value: 'K520,000', target: '≥K500,000', status: 'on-track' },
    { name: 'Partnership Revenue', value: 'K850,000', target: '≥K1M', status: 'at-risk' },
    { name: 'DM Promotions', value: '2', target: '≥2', status: 'on-track' },
  ],
  tierInfo: {
    currentTier: 'Tier 3',
    nextTier: 'Tier 2',
    tierTarget: 'K5,803,140+ monthly',
    monthsInCurrentTier: 20,
    progressionCriteria: [
      'Achieve K5,803,140+ monthly provincial revenue',
      'All branches debt-free',
      '10+ revenue-equivalent branches',
    ],
  },
});

// General Operations Manager Review Configuration
const getGOMConfig = (): PositionReviewConfig => ({
  position: 'General Operations Manager (GOM)',
  displayName: 'General Operations Manager',
  reviewType: 'Monthly Operations Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'Monthly Review',
      title: 'February Operations Excellence Assessment',
      status: 'In Progress',
      assignee: 'GOM',
      dueDate: '2024-02-28',
      progress: 72,
    },
    {
      id: 2,
      type: 'Quarterly Review',
      title: 'Q1 Value Preservation Report',
      status: 'Pending',
      assignee: 'Manager Administration',
      dueDate: '2024-03-15',
      progress: 0,
    },
  ],
  checklistItems: [
    { id: 1, title: 'Recruitment Vacancy Days (≤7 days)', completed: true, category: 'Staffing' },
    { id: 2, title: 'Fleet Downtime (≤5%)', completed: true, category: 'Operations' },
    { id: 3, title: 'BMOS Compliance Rate (100%)', completed: false, category: 'Compliance' },
    { id: 4, title: 'Statutory Submission Timeliness (100%)', completed: true, category: 'Compliance' },
    { id: 5, title: 'Internet Uptime (≥98%)', completed: true, category: 'Operations' },
    { id: 6, title: 'Monthly Value Preserved (≥K150,000)', completed: true, category: 'Value' },
  ],
  kpis: [
    { name: 'Vacancy Days', value: '5 days', target: '≤7 days', status: 'on-track' },
    { name: 'Fleet Downtime', value: '4%', target: '≤5%', status: 'on-track' },
    { name: 'BMOS Compliance', value: '98%', target: '100%', status: 'at-risk' },
    { name: 'Value Preserved', value: 'K165,000', target: '≥K150,000', status: 'on-track' },
    { name: 'Staff Satisfaction', value: '86%', target: '≥85%', status: 'on-track' },
  ],
  tierInfo: {
    currentTier: 'GOM Tier 3',
    nextTier: 'GOM Tier 2',
    tierTarget: 'K1.2M+ annually',
    monthsInCurrentTier: 16,
    progressionCriteria: [
      'Preserve ≥K1.2M annual value',
      'Lead cross-branch efficiency project',
      'Achieve 92%+ KPI score for 3 quarters',
    ],
  },
});

// General Operations Administrator Review Configuration
const getGOAConfig = (): PositionReviewConfig => ({
  position: 'General Operations Administrator (GOA)',
  displayName: 'General Operations Administrator',
  reviewType: 'Monthly Operations Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'Monthly Review',
      title: 'February Operations Excellence Assessment',
      status: 'In Progress',
      assignee: 'GOA',
      dueDate: '2024-02-28',
      progress: 70,
    },
    {
      id: 2,
      type: 'Quarterly Review',
      title: 'Q1 Value Preservation Report',
      status: 'Pending',
      assignee: 'Manager Administration',
      dueDate: '2024-03-15',
      progress: 0,
    },
  ],
  checklistItems: [
    { id: 1, title: 'Recruitment Vacancy Days (≤7 days)', completed: true, category: 'Staffing' },
    { id: 2, title: 'Fleet Downtime (≤5%)', completed: true, category: 'Operations' },
    { id: 3, title: 'BMOS Compliance Rate (100%)', completed: false, category: 'Compliance' },
    { id: 4, title: 'Statutory Submission Timeliness (100%)', completed: true, category: 'Compliance' },
    { id: 5, title: 'Internet Uptime (≥98%)', completed: true, category: 'Operations' },
    { id: 6, title: 'Monthly Value Preserved (≥K150,000)', completed: true, category: 'Value' },
  ],
  kpis: [
    { name: 'Vacancy Days', value: '6 days', target: '≤7 days', status: 'on-track' },
    { name: 'Fleet Downtime', value: '4.5%', target: '≤5%', status: 'on-track' },
    { name: 'BMOS Compliance', value: '97%', target: '100%', status: 'at-risk' },
    { name: 'Value Preserved', value: 'K155,000', target: '≥K150,000', status: 'on-track' },
    { name: 'Staff Satisfaction', value: '85%', target: '≥85%', status: 'on-track' },
  ],
  tierInfo: {
    currentTier: 'GOA',
    nextTier: 'GOM Tier 3',
    tierTarget: 'K900K+ annually',
    monthsInCurrentTier: 12,
    progressionCriteria: [
      'Preserve ≥K900K annual value',
      'Demonstrate operational excellence',
      'Achieve 90%+ KPI score for 3 quarters',
    ],
  },
});

// Payroll Loans Manager Review Configuration
const getPayrollLoansManagerConfig = (): PositionReviewConfig => ({
  position: 'Payroll Loans Manager',
  displayName: 'Payroll Loans Manager',
  reviewType: 'Monthly Performance Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'Monthly Review',
      title: 'February Payroll Loan Performance',
      status: 'In Progress',
      assignee: 'Payroll Loans Manager',
      dueDate: '2024-02-28',
      progress: 68,
    },
    {
      id: 2,
      type: 'Quarterly Review',
      title: 'Q1 Tier Re-Assessment',
      status: 'Pending',
      assignee: 'Head of Specialized Products',
      dueDate: '2024-03-20',
      progress: 0,
    },
  ],
  checklistItems: [
    { id: 1, title: 'Monthly Net Income Growth', completed: true, category: 'Financial' },
    { id: 2, title: 'Revenue Growth Rate (+15% MoM)', completed: true, category: 'Growth' },
    { id: 3, title: 'Capital Efficiency Ratio (≥1.5)', completed: false, category: 'Efficiency' },
    { id: 4, title: 'Motor Vehicle Loan Contribution (≥40%)', completed: true, category: 'Growth' },
    { id: 5, title: 'Employer Payment Delay Rate (≤5%)', completed: true, category: 'Risk' },
    { id: 6, title: 'New Product Variations (2/quarter)', completed: false, category: 'Innovation' },
  ],
  kpis: [
    { name: 'Net Income Growth', value: '18%', target: '+15%', status: 'on-track' },
    { name: 'Capital Efficiency', value: '1.4', target: '≥1.5', status: 'at-risk' },
    { name: 'MV Loan Contribution', value: '42%', target: '≥40%', status: 'on-track' },
    { name: 'Employer Delay Rate', value: '4%', target: '≤5%', status: 'on-track' },
    { name: 'New Products', value: '1/2', target: '≥2/quarter', status: 'at-risk' },
  ],
  tierInfo: {
    currentTier: 'Tier 5',
    nextTier: 'Tier 4',
    tierTarget: 'K1,740,942+ monthly',
    monthsInCurrentTier: 10,
    progressionCriteria: [
      'Achieve K1,740,942+ monthly revenue',
      'Unit sustainable, costs covered',
      'Positive growth trajectory',
    ],
  },
});

// Motor Vehicles Manager Review Configuration
const getMotorVehiclesManagerConfig = (): PositionReviewConfig => ({
  position: 'Motor Vehicles Manager',
  displayName: 'Motor Vehicles Manager',
  reviewType: 'Monthly Portfolio Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'Monthly Review',
      title: 'February Motor Vehicle Loan Portfolio',
      status: 'In Progress',
      assignee: 'MV Manager',
      dueDate: '2024-02-28',
      progress: 75,
    },
    {
      id: 2,
      type: 'Quarterly Review',
      title: 'Q1 Tier Assessment',
      status: 'Pending',
      assignee: 'Head of Specialized Products',
      dueDate: '2024-03-20',
      progress: 0,
    },
  ],
  checklistItems: [
    { id: 1, title: 'Monthly Net Profit (≥K40,000)', completed: true, category: 'Profitability' },
    { id: 2, title: 'Float Utilization Rate (≥95%)', completed: true, category: 'Efficiency' },
    { id: 3, title: 'Repayment Compliance (100%)', completed: false, category: 'Compliance' },
    { id: 4, title: 'Performing Loan Book Ratio (≥97%)', completed: true, category: 'Quality' },
    { id: 5, title: 'Collateral Liquidation Timeline (≤10 days)', completed: true, category: 'Operations' },
    { id: 6, title: 'New Branches Activated (5+/month)', completed: false, category: 'Growth' },
  ],
  kpis: [
    { name: 'Net Profit', value: 'K45,000', target: '≥K40,000', status: 'on-track' },
    { name: 'Float Utilization', value: '96%', target: '≥95%', status: 'on-track' },
    { name: 'Repayment Compliance', value: '98.5%', target: '100%', status: 'at-risk' },
    { name: 'Performing Ratio', value: '97.5%', target: '≥97%', status: 'on-track' },
    { name: 'New Branches', value: '3/5', target: '≥5/month', status: 'at-risk' },
  ],
  tierInfo: {
    currentTier: 'Tier 6',
    nextTier: 'Tier 5',
    tierTarget: 'K580,314+ monthly',
    monthsInCurrentTier: 6,
    progressionCriteria: [
      'Achieve K580,314+ monthly revenue',
      'Branch-level rewards eligibility',
      'Consistent 2+ month target achievement',
    ],
  },
});

// Performance Operations Administrator Review Configuration
const getPOAConfig = (): PositionReviewConfig => ({
  position: 'Performance Operations Administrator (POA)',
  displayName: 'Performance Operations Administrator',
  reviewType: 'Monthly Performance Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'Monthly Review',
      title: 'February Performance Monitoring Assessment',
      status: 'In Progress',
      assignee: 'POA',
      dueDate: '2024-02-28',
      progress: 70,
    },
    {
      id: 2,
      type: 'Quarterly Review',
      title: 'Q1 Progression Assessment',
      status: 'Pending',
      assignee: 'Manager Administration',
      dueDate: '2024-03-15',
      progress: 0,
    },
  ],
  checklistItems: [
    { id: 1, title: 'Underperformance Detection Time (≤7 days)', completed: true, category: 'Detection' },
    { id: 2, title: 'Performance Data Accuracy (100%)', completed: true, category: 'Data' },
    { id: 3, title: 'Intervention Plan Completion (≥95%)', completed: false, category: 'Intervention' },
    { id: 4, title: 'Performance Improvement Success (≥70%)', completed: true, category: 'Results' },
    { id: 5, title: 'Dashboard Utilization (≥90%)', completed: true, category: 'Adoption' },
    { id: 6, title: 'Monthly Value Protected', completed: false, category: 'Value' },
  ],
  kpis: [
    { name: 'Detection Time', value: '5 days', target: '≤7 days', status: 'on-track' },
    { name: 'Data Accuracy', value: '100%', target: '100%', status: 'on-track' },
    { name: 'Intervention Completion', value: '92%', target: '≥95%', status: 'at-risk' },
    { name: 'Improvement Success', value: '68%', target: '≥70%', status: 'at-risk' },
    { name: 'Dashboard Usage', value: '88%', target: '≥90%', status: 'on-track' },
  ],
  tierInfo: {
    currentTier: 'POA',
    nextTier: 'POM Tier 3',
    tierTarget: 'K1.2M+ annually',
    monthsInCurrentTier: 14,
    progressionCriteria: [
      'Achieve 90%+ KPI score for 2 consecutive quarters',
      'Reduce underperformance losses by ≥K500,000 annually',
      'Implement 1+ performance improvement initiative',
    ],
  },
});

// R&D Coordinator Review Configuration
const getRDCoordinatorConfig = (): PositionReviewConfig => ({
  position: 'R&D Coordinator',
  displayName: 'R&D Coordinator',
  reviewType: 'Quarterly Innovation Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'Quarterly Review',
      title: 'Q1 Research & Innovation Assessment',
      status: 'In Progress',
      assignee: 'R&D Coordinator',
      dueDate: '2024-03-25',
      progress: 60,
    },
    {
      id: 2,
      type: 'Vision Review',
      title: 'WIT Vision Document Progress',
      status: 'Pending',
      assignee: 'Executive Chairperson',
      dueDate: '2024-04-15',
      progress: 0,
    },
  ],
  checklistItems: [
    { id: 1, title: 'WIT Vision Document Completion', completed: true, category: 'Vision' },
    { id: 2, title: 'Active Research Projects (≥3)', completed: true, category: 'Research' },
    { id: 3, title: 'First Research Team Built', completed: false, category: 'Team' },
    { id: 4, title: 'Initial Partnerships (2+)', completed: true, category: 'Partnerships' },
    { id: 5, title: 'Community Engagement Initiatives', completed: false, category: 'Community' },
    { id: 6, title: 'Executive Alignment (≥90%)', completed: true, category: 'Alignment' },
  ],
  kpis: [
    { name: 'WIT Vision Progress', value: '75%', target: '100%', status: 'on-track' },
    { name: 'Active Projects', value: '4', target: '≥3', status: 'on-track' },
    { name: 'Partnerships', value: '3', target: '≥2', status: 'on-track' },
    { name: 'Team Size', value: '2', target: '≥3', status: 'at-risk' },
    { name: 'Executive Alignment', value: '92%', target: '≥90%', status: 'on-track' },
  ],
  tierInfo: {
    currentTier: 'R&D Coordinator',
    nextTier: 'R&D Manager Tier 3',
    tierTarget: 'See progression criteria',
    monthsInCurrentTier: 12,
    progressionCriteria: [
      'WIT Vision Document completed and widely understood',
      'Core team of 3+ researchers/innovators established',
      '2+ academic/community partnerships active',
      '3+ active research projects with clear community impact',
    ],
  },
});

// Creative Artwork & Marketing Manager Review Configuration
const getCreativeArtworkManagerConfig = (): PositionReviewConfig => ({
  position: 'Creative Artwork & Marketing Representative Manager',
  displayName: 'Creative Artwork & Marketing Manager',
  reviewType: 'Monthly Performance Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'Monthly Review',
      title: 'February Marketing Performance',
      status: 'In Progress',
      assignee: 'Marketing Manager',
      dueDate: '2024-02-28',
      progress: 65,
    },
    {
      id: 2,
      type: 'Quarterly Review',
      title: 'Q1 Self-Funding Progress',
      status: 'Pending',
      assignee: 'Head of Strategic Growth',
      dueDate: '2024-03-20',
      progress: 0,
    },
  ],
  checklistItems: [
    { id: 1, title: 'Total Monthly Revenue (≥K73,000)', completed: true, category: 'Revenue' },
    { id: 2, title: 'Net Income Growth (self-funding)', completed: false, category: 'Sustainability' },
    { id: 3, title: 'Cost Recovery Ratio (≥100%)', completed: true, category: 'Efficiency' },
    { id: 4, title: 'New Income Stream (1+/quarter)', completed: true, category: 'Growth' },
    { id: 5, title: 'Client Referral Conversion (≥20%)', completed: true, category: 'Marketing' },
    { id: 6, title: 'Brand Consistency (≥95%)', completed: false, category: 'Quality' },
  ],
  kpis: [
    { name: 'Total Revenue', value: 'K78,000', target: '≥K73,000', status: 'on-track' },
    { name: 'Net Income', value: 'K42,000', target: '≥K50,000', status: 'at-risk' },
    { name: 'Cost Recovery', value: '105%', target: '≥100%', status: 'on-track' },
    { name: 'Referral Conversion', value: '22%', target: '≥20%', status: 'on-track' },
    { name: 'Brand Consistency', value: '93%', target: '≥95%', status: 'at-risk' },
  ],
  tierInfo: {
    currentTier: 'Level 2: Emerging Manager',
    nextTier: 'Level 3: Marketing Manager',
    tierTarget: 'K50,000-K580,314+ monthly',
    monthsInCurrentTier: 10,
    progressionCriteria: [
      'Department covers all operational costs for 6 months',
      'Net income ≥ K50,000 for 3 consecutive months',
      'Manager salary fully funded by department',
    ],
  },
});

// Administration Review Configuration (fallback)
const getAdministrationConfig = (): PositionReviewConfig => ({
  position: 'Administration',
  displayName: 'Administration',
  reviewType: 'Quarterly Administration Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'Quarterly Review',
      title: 'Q1 Administrative Excellence Assessment',
      status: 'In Progress',
      assignee: 'Administration',
      dueDate: '2024-03-25',
      progress: 65,
    },
  ],
  checklistItems: [
    { id: 1, title: 'Administrative Excellence', completed: false, category: 'Operations' },
    { id: 2, title: 'Policy Compliance', completed: true, category: 'Compliance' },
    { id: 3, title: 'Staff Support', completed: true, category: 'Team' },
  ],
  kpis: [
    { name: 'Admin Score', value: '85%', target: '≥85%', status: 'on-track' },
    { name: 'Compliance', value: '100%', target: '100%', status: 'on-track' },
  ],
});

// District Regional Manager Review Configuration
const getDistrictRegionalManagerConfig = (): PositionReviewConfig => ({
  position: 'District Regional Manager',
  displayName: 'District Regional Manager',
  reviewType: 'Quarterly Strategic Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'Quarterly Review',
      title: 'Q1 Regional Performance Assessment',
      status: 'In Progress',
      assignee: 'District Regional Manager',
      dueDate: '2024-03-25',
      progress: 55,
    },
  ],
  checklistItems: [
    { id: 1, title: 'Regional Net Contribution', completed: true, category: 'Financial' },
    { id: 2, title: 'District Development', completed: false, category: 'Leadership' },
    { id: 3, title: 'Strategic Initiatives', completed: true, category: 'Strategy' },
  ],
  kpis: [
    { name: 'Net Contribution', value: 'TBD', target: 'TBD', status: 'on-track' },
    { name: 'District Score', value: '85%', target: '≥85%', status: 'on-track' },
  ],
});

// Default configuration for unknown positions
const getDefaultConfig = (position: string): PositionReviewConfig => ({
  position: position as Position,
  displayName: position,
  reviewType: 'Performance Review',
  upcomingReviews: [
    {
      id: 1,
      type: 'Review',
      title: 'Current Period Assessment',
      status: 'In Progress',
      assignee: position,
      dueDate: '2024-02-28',
      progress: 50,
    },
  ],
  checklistItems: [
    { id: 1, title: 'Core Responsibilities', completed: false },
    { id: 2, title: 'Performance Targets', completed: false },
    { id: 3, title: 'Development Goals', completed: false },
  ],
  kpis: [
    { name: 'Performance', value: 'TBD', target: 'TBD', status: 'on-track' as const },
  ],
});

// Get configuration based on position
function getPositionConfig(position: Position | null): PositionReviewConfig {
  if (!position) {
    return getDefaultConfig('Branch Manager');
  }

  const configMap: Record<Position, () => PositionReviewConfig> = {
    'Branch Manager': getBranchManagerConfig,
    'District Manager': getDistrictManagerConfig,
    'District Regional Manager': getDistrictRegionalManagerConfig,
    'Manager Administration': getManagerAdminConfig,
    'Administration': getAdministrationConfig,
    'IT Coordinator': getITCoordinatorConfig,
    'IT Manager': getITManagerConfig,
    'Management Accountant': getManagementAccountantConfig,
    'Risk Manager': getRiskManagerConfig,
    'Recoveries Coordinator': getRecoveriesCoordinatorConfig,
    'Motor Vehicles Manager': getMotorVehiclesManagerConfig,
    'Payroll Loans Manager': getPayrollLoansManagerConfig,
    'Policy & Training Manager': getPolicyTrainingManagerConfig,
    'Provincial Manager': getProvincialManagerConfig,
    'General Operations Manager (GOM)': getGOMConfig,
    'General Operations Administrator (GOA)': getGOAConfig,
    'Performance Operations Administrator (POA)': getPOAConfig,
    'R&D Coordinator': getRDCoordinatorConfig,
    'Creative Artwork & Marketing Representative Manager': getCreativeArtworkManagerConfig,
    'Super Seer': getGOMConfig, // Super Seer uses GOM config as placeholder
    'Loan Consultant': getBranchManagerConfig, // Loan Consultant uses Branch Manager config
  };

  const configFn = configMap[position];
  if (configFn) {
    return configFn();
  }

  return getDefaultConfig(position);
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('progress')) return 'bg-blue-100 text-blue-800';
    if (lowerStatus.includes('due') || lowerStatus.includes('pending')) return 'bg-yellow-100 text-yellow-800';
    if (lowerStatus.includes('complete') || lowerStatus.includes('done')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
      {status}
    </span>
  );
}

// KPI Status indicator
function KPIStatus({ status }: { status: 'on-track' | 'at-risk' | 'behind' }) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'text-green-600 bg-green-100';
      case 'at-risk':
        return 'text-yellow-600 bg-yellow-100';
      case 'behind':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusStyles(status)}`}>
      {status === 'on-track' ? '✓ On Track' : status === 'at-risk' ? '⚠ At Risk' : '✗ Behind'}
    </span>
  );
}

// Main component
export default function ReviewsPage() {
  const router = useRouter();
  const { positionName: rawPosition, isLoading, refreshPosition } = useUserPosition();
  const [config, setConfig] = useState<PositionReviewConfig | null>(null);

  // Normalize position and set config
  useEffect(() => {
    if (!isLoading && rawPosition) {
      const normalizedPosition = normalizePosition(rawPosition);
      setConfig(getPositionConfig(normalizedPosition));
    }
  }, [rawPosition, isLoading]);

  if (isLoading || !config) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading review data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Review & Progression
            </h1>
            <span className="px-3 py-1 text-sm font-medium bg-brand-100 text-brand-800 rounded-full">
              {config.displayName}
            </span>
          </div>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {config.reviewType} • Position-based automated review tracking
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refreshPosition(true)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            Refresh Data
          </button>
          <button className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors">
            Schedule Review
          </button>
        </div>
      </div>

      {/* Tier Info Banner */}
      {config.tierInfo && (
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Current Position</p>
              <h2 className="text-xl font-bold">{config.displayName} - {config.tierInfo.currentTier}</h2>
              <p className="mt-1 text-sm opacity-90">
                {config.tierInfo.monthsInCurrentTier} months in current tier
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Next Tier Target</p>
              <h3 className="text-lg font-semibold">{config.tierInfo.nextTier}</h3>
              <p className="text-sm opacity-90">{config.tierInfo.tierTarget}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm font-medium mb-2">Progression Criteria:</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm opacity-90">
              {config.tierInfo.progressionCriteria.slice(0, 4).map((criteria, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  {criteria}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {config.kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {kpi.name}
              </p>
              <KPIStatus status={kpi.status} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Target: {kpi.target}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Reviews */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Reviews
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {config.upcomingReviews.map((review) => (
              <div
                key={review.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {review.type}
                      </span>
                      <StatusBadge status={review.status} />
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {review.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Assigned to: {review.assignee} • Due: {review.dueDate}
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-300"
                        style={{ width: `${review.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                      {review.progress}% complete
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Position-Specific Checklist */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {config.displayName} Review Checklist
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Auto-populated with position-specific performance metrics
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.checklistItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  item.completed
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => {}}
                  className="w-5 h-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                <div className="flex-1">
                  <span className={`text-sm ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                    {item.title}
                  </span>
                  {item.category && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                      {item.category}
                    </span>
                  )}
                </div>
                {item.completed && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                    Complete
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Digital Sign-off */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Digital Sign-Off
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Electronic Signature
                </label>
                <input
                  type="text"
                  placeholder={`Type your name to sign as ${config.displayName}`}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex items-end">
                <button className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors">
                  Sign & Submit
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Electronic acknowledgment required within 24 hours
            </p>
          </div>
        </div>
      </div>

      {/* Review History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Review History
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Review</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">January {config.reviewType}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">2024-01-31</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span></td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">88/100</td>
                  <td className="px-4 py-3"><button className="text-brand-500 hover:underline text-sm">View</button></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">December {config.reviewType}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">2023-12-31</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span></td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">85/100</td>
                  <td className="px-4 py-3"><button className="text-brand-500 hover:underline text-sm">View</button></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Q4 Progression Assessment</td>
                  <td className="px-4 py-3 text-sm text-gray-500">2023-10-31</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span></td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">82/100</td>
                  <td className="px-4 py-3"><button className="text-brand-500 hover:underline text-sm">View</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
