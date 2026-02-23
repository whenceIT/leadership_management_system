"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useUserPosition, 
  AVAILABLE_POSITIONS, 
  PositionType,
  getUserPosition 
} from '@/hooks/useUserPosition';
import { useUserKPI, ProcessedKPI } from '@/hooks/useUserKPI';

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

// Interface for scheduled review from API
interface ScheduledReview {
  id: string;
  position: string;
  reviewType: string;
  title: string;
  description?: string;
  scheduledDateTime: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  sendReminder: boolean;
  reminderDaysBefore: number;
  kpiId?: string;
  kpiName?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for KPI option in dropdown
interface KpiOption {
  id: string;
  name: string;
  category: string;
  target: string;
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

// Helper function to determine KPI status based on score percentage
function getKPIStatus(kpi: ProcessedKPI): 'on-track' | 'at-risk' | 'behind' {
  const scorePercentage = kpi.score;
  
  if (kpi.lowerIsBetter) {
    // For metrics where lower is better (e.g., default rate)
    if (kpi.value <= kpi.target) return 'on-track';
    if (kpi.value <= kpi.target * 1.1) return 'at-risk';
    return 'behind';
  }
  
  // For metrics where higher is better
  if (scorePercentage >= 90) return 'on-track';
  if (scorePercentage >= 70) return 'at-risk';
  return 'behind';
}

// Helper function to format KPI value based on format type
function formatKPIValue(value: number, format: ProcessedKPI['format']): string {
  switch (format) {
    case 'currency':
      return `K${value.toLocaleString()}`;
    case 'percent':
      return `${value}%`;
    case 'rating':
      return value.toFixed(1);
    default:
      return value.toLocaleString();
  }
}

// Helper function to format KPI target
function formatKPITarget(target: number, format: ProcessedKPI['format'], lowerIsBetter: boolean): string {
  const prefix = lowerIsBetter ? '≤' : '≥';
  switch (format) {
    case 'currency':
      return `${prefix}K${target.toLocaleString()}`;
    case 'percent':
      return `${prefix}${target}%`;
    case 'rating':
      return `${prefix}${target.toFixed(1)}`;
    default:
      return `${prefix}${target.toLocaleString()}`;
  }
}

// Main component
export default function ReviewsPage() {
  const router = useRouter();
  const { user, positionName: rawPosition, userTier, isLoading, refreshPosition } = useUserPosition();
  const [config, setConfig] = useState<PositionReviewConfig | null>(null);
  
  // Fetch real-time KPI data from API
  const { processedKPIs, isLoading: kpiLoading, error: kpiError, refresh: refreshKPIs } = useUserKPI();
  
  // Digital Sign-Off state
  const [signature, setSignature] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [signOffStatus, setSignOffStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [signOffError, setSignOffError] = useState<string>('');
  const [signedAt, setSignedAt] = useState<Date | null>(null);

  // Schedule Review Modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [scheduleFormData, setScheduleFormData] = useState({
    reviewType: '',
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '09:00',
    assignee: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    sendReminder: true,
    reminderDaysBefore: 1,
    kpiId: '',
  });
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  const [scheduleStatus, setScheduleStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [scheduleError, setScheduleError] = useState<string>('');
  const [isClosingModal, setIsClosingModal] = useState<boolean>(false);

  // KPI options for dropdown
  const [kpiOptions, setKpiOptions] = useState<KpiOption[]>([]);
  const [isLoadingKpis, setIsLoadingKpis] = useState<boolean>(false);

  // Scheduled reviews from API
  const [scheduledReviews, setScheduledReviews] = useState<ScheduledReview[]>([]);
  const [pastReviews, setPastReviews] = useState<ScheduledReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(false);
  const [isLoadingPastReviews, setIsLoadingPastReviews] = useState<boolean>(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  // Normalize position and set config
  useEffect(() => {
    if (!isLoading && rawPosition) {
      const normalizedPosition = normalizePosition(rawPosition);
      setConfig(getPositionConfig(normalizedPosition));
    }
  }, [rawPosition, isLoading]);

  // Fetch scheduled reviews from API
  const fetchScheduledReviews = async () => {
    if (!config) return;
    
    setIsLoadingReviews(true);
    try {
      const response = await fetch(
        `/api/reviews/schedule?position=${encodeURIComponent(config.position)}&upcoming=true&limit=10`
      );
      const result = await response.json();
      
      if (result.success && result.data) {
        setScheduledReviews(result.data);
      }
    } catch (error) {
      console.error('Error fetching scheduled reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Fetch past reviews from API (reviews that have passed their scheduled date)
  const fetchPastReviews = async () => {
    if (!config) return;
    
    setIsLoadingPastReviews(true);
    try {
      // Get current date in YYYY-MM-DD format
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const response = await fetch(
        `/api/reviews/schedule?position=${encodeURIComponent(config.position)}&end_date=${todayStr}&limit=20`
      );
      const result = await response.json();
      
      if (result.success && result.data) {
        // Filter to only include reviews that have passed their scheduled date
        const now = new Date();
        const past = result.data.filter((review: ScheduledReview) => 
          new Date(review.scheduledDateTime) < now
        );
        setPastReviews(past);
      }
    } catch (error) {
      console.error('Error fetching past reviews:', error);
    } finally {
      setIsLoadingPastReviews(false);
    }
  };

  // Fetch scheduled reviews when config is set
  useEffect(() => {
    if (config) {
      fetchScheduledReviews();
      fetchPastReviews();
    }
  }, [config]);

  // Fetch KPI options from API
  const fetchKpis = async () => {
    setIsLoadingKpis(true);
    try {
      const response = await fetch('/api/kpi/all');
      
      if (!response.ok) {
        console.error('KPI API returned non-OK status:', response.status);
        setKpiOptions([]);
        return;
      }
      
      const data = await response.json();
      
      // Handle error response
      if (data.error) {
        console.error('KPI API returned error:', data.error);
        setKpiOptions([]);
        return;
      }
      
      // Handle array response directly (API returns array, not wrapped object)
      if (Array.isArray(data) && data.length > 0) {
        // Transform API data to KpiOption format
        const options: KpiOption[] = data.map((kpi: any) => ({
          id: String(kpi.id),
          name: kpi.name || kpi.kpi_name || 'Unnamed KPI',
          category: kpi.category || 'General',
          target: kpi.target ? String(kpi.target) : 'N/A',
        }));
        setKpiOptions(options);
        console.log('KPI options loaded:', options.length, 'items');
      } else if (Array.isArray(data) && data.length === 0) {
        // Empty array - no KPIs available
        console.log('KPI API returned empty array');
        setKpiOptions([]);
      } else if (data.success && data.data && Array.isArray(data.data)) {
        // Handle wrapped response format as fallback
        const options: KpiOption[] = data.data.map((kpi: any) => ({
          id: String(kpi.id),
          name: kpi.name || kpi.kpi_name || 'Unnamed KPI',
          category: kpi.category || 'General',
          target: kpi.target ? String(kpi.target) : 'N/A',
        }));
        setKpiOptions(options);
        console.log('KPI options loaded (wrapped format):', options.length, 'items');
      } else {
        // Unknown response format
        console.warn('KPI API returned unexpected format:', typeof data, data);
        setKpiOptions([]);
      }
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      setKpiOptions([]);
    } finally {
      setIsLoadingKpis(false);
    }
  };

  // Fetch KPIs when modal opens
  useEffect(() => {
    if (isScheduleModalOpen) {
      fetchKpis();
    }
  }, [isScheduleModalOpen]);

  // Open Edit Review Modal
  const openEditModal = (review: ScheduledReview) => {
    const scheduledDate = new Date(review.scheduledDateTime);
    const dateStr = scheduledDate.toISOString().split('T')[0];
    const timeStr = scheduledDate.toTimeString().slice(0, 5);
    
    setScheduleFormData({
      reviewType: review.reviewType,
      title: review.title,
      description: review.description || '',
      scheduledDate: dateStr,
      scheduledTime: timeStr,
      assignee: review.assignee,
      priority: review.priority,
      sendReminder: review.sendReminder,
      reminderDaysBefore: review.reminderDaysBefore,
      kpiId: review.kpiId || '',
    });
    setEditingReviewId(review.id);
    setIsEditMode(true);
    setScheduleStatus('idle');
    setScheduleError('');
    setIsScheduleModalOpen(true);
  };

  // Handle Update Review submission
  const handleUpdateReview = async () => {
    if (!editingReviewId) return;

    // Validate required fields
    if (!scheduleFormData.title.trim()) {
      setScheduleError('Please enter a review title.');
      setScheduleStatus('error');
      return;
    }
    if (!scheduleFormData.scheduledDate) {
      setScheduleError('Please select a scheduled date.');
      setScheduleStatus('error');
      return;
    }

    setIsScheduling(true);
    setScheduleStatus('idle');
    setScheduleError('');

    try {
      const response = await fetch(`/api/reviews/schedule/${editingReviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: scheduleFormData.title.trim(),
          description: scheduleFormData.description.trim(),
          scheduledDate: scheduleFormData.scheduledDate,
          scheduledTime: scheduleFormData.scheduledTime,
          assignee: scheduleFormData.assignee,
          priority: scheduleFormData.priority,
          sendReminder: scheduleFormData.sendReminder,
          reminderDaysBefore: scheduleFormData.reminderDaysBefore,
          kpiId: scheduleFormData.kpiId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update review');
      }

      setScheduleStatus('success');
      
      // Close modal after a short delay on success
      setTimeout(() => {
        closeScheduleModal();
        fetchScheduledReviews();
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to update review. Please try again.';
      setScheduleError(errorMessage);
      setScheduleStatus('error');
    } finally {
      setIsScheduling(false);
    }
  };

  // Handle Delete Review
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled review?')) return;
    
    setDeletingReviewId(reviewId);
    try {
      const response = await fetch(`/api/reviews/schedule/${reviewId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to cancel review');
      }

      // Refresh the list
      fetchScheduledReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to cancel the review. Please try again.');
    } finally {
      setDeletingReviewId(null);
    }
  };

  // Handle Status Update
  const handleStatusUpdate = async (reviewId: string, newStatus: 'scheduled' | 'in-progress' | 'completed' | 'cancelled') => {
    try {
      const response = await fetch(`/api/reviews/schedule/${reviewId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update status');
      }

      // Refresh the list
      fetchScheduledReviews();
    } catch (error) {
      console.error('Error updating review status:', error);
      alert('Failed to update the review status. Please try again.');
    }
  };

  // Handle Digital Sign-Off submission
  const handleSignOff = async () => {
    if (!config) return;
    
    // Reset previous states
    setSignOffError('');
    setSignOffStatus('idle');
    
    // Validate signature
    const trimmedSignature = signature.trim();
    if (!trimmedSignature) {
      setSignOffError('Please enter your name to sign.');
      setSignOffStatus('error');
      return;
    }
    
    // Check if signature matches the display name (case-insensitive comparison)
    const expectedName = config.displayName.toLowerCase();
    const providedName = trimmedSignature.toLowerCase();
    
    // Allow partial match (first name or last name) or full match
    const nameParts = expectedName.split(' ');
    const isValidSignature = 
      providedName === expectedName || 
      nameParts.some(part => part.length > 2 && providedName.includes(part.toLowerCase()));
    
    if (!isValidSignature) {
      setSignOffError(`Signature must match your position name: ${config.displayName}`);
      setSignOffStatus('error');
      return;
    }
    
    // Submit the sign-off
    setIsSubmitting(true);
    
    try {
      // Get user info for the API call
      const userId = user?.id;
      const userEmail = user?.email;
      const userName = user ? `${user.first_name} ${user.last_name}`.trim() : undefined;
      const officeId = user?.office_id;

      // Call the sign-off API endpoint
      const response = await fetch('/api/reviews/signoff', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          position: config.position,
          signature: trimmedSignature,
          reviewType: config.reviewType,
          userId,
          userEmail,
          userName,
          officeId,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit signature');
      }
      
      // Use the signedAt timestamp from the server response
      setSignedAt(new Date(result.data.signedAt));
      setSignOffStatus('success');
      setSignature(trimmedSignature);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to submit signature. Please try again.';
      setSignOffError(errorMessage);
      setSignOffStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle signature input change
  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignature(e.target.value);
    if (signOffStatus === 'error') {
      setSignOffStatus('idle');
      setSignOffError('');
    }
  };

  // Open Schedule Review Modal
  const openScheduleModal = () => {
    if (!config) return;
    
    // Pre-populate form with default values
    setScheduleFormData({
      reviewType: config.reviewType,
      title: '',
      description: '',
      scheduledDate: '',
      scheduledTime: '09:00',
      assignee: config.displayName,
      priority: 'medium',
      sendReminder: true,
      reminderDaysBefore: 1,
      kpiId: '',
    });
    setEditingReviewId(null);
    setIsEditMode(false);
    setScheduleStatus('idle');
    setScheduleError('');
    setIsScheduleModalOpen(true);
  };

  // Close Schedule Review Modal
  const closeScheduleModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setIsScheduleModalOpen(false);
      setIsEditMode(false);
      setEditingReviewId(null);
      setScheduleStatus('idle');
      setScheduleError('');
      setIsClosingModal(false);
    }, 300);
  };

  // Handle schedule form input changes
  const handleScheduleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setScheduleFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle Schedule Review submission
  const handleScheduleReview = async () => {
    if (!config) return;

    // Validate required fields
    if (!scheduleFormData.title.trim()) {
      setScheduleError('Please enter a review title.');
      setScheduleStatus('error');
      return;
    }
    if (!scheduleFormData.scheduledDate) {
      setScheduleError('Please select a scheduled date.');
      setScheduleStatus('error');
      return;
    }

    setIsScheduling(true);
    setScheduleStatus('idle');
    setScheduleError('');

    try {
      // Get user info for the API call
      const userId = user?.id;
      const userEmail = user?.email;
      const userName = user ? `${user.first_name} ${user.last_name}`.trim() : undefined;
      const officeId = user?.office_id;

      // Call the schedule review API endpoint
      const response = await fetch('/api/reviews/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          position: config.position,
          reviewType: scheduleFormData.reviewType,
          title: scheduleFormData.title.trim(),
          description: scheduleFormData.description.trim(),
          scheduledDate: scheduleFormData.scheduledDate,
          scheduledTime: scheduleFormData.scheduledTime,
          assignee: scheduleFormData.assignee,
          priority: scheduleFormData.priority,
          sendReminder: scheduleFormData.sendReminder,
          reminderDaysBefore: scheduleFormData.reminderDaysBefore,
          kpiId: scheduleFormData.kpiId,
          userId,
          userEmail,
          userName,
          officeId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to schedule review');
      }

      setScheduleStatus('success');
      
      // Close modal after a short delay on success
      setTimeout(() => {
        closeScheduleModal();
        // Refresh scheduled reviews list
        fetchScheduledReviews();
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to schedule review. Please try again.';
      setScheduleError(errorMessage);
      setScheduleStatus('error');
    } finally {
      setIsScheduling(false);
    }
  };

  // Determine if we should show loading state
  const isPageLoading = isLoading || !config;

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading review data...</p>
        </div>
      </div>
    );
  }

  // Use dynamic KPIs if available, otherwise fall back to static config KPIs
  const displayKPIs = processedKPIs.length > 0 ? processedKPIs : config.kpis.map((kpi, idx) => ({
    id: `static-kpi-${idx}`,
    name: kpi.name,
    description: '',
    category: 'default',
    position: config.position,
    target: parseFloat(kpi.target.replace(/[^0-9.]/g, '')),
    baseline: parseFloat(kpi.value.replace(/[^0-9.]/g, '')),
    weight: 10,
    unit: kpi.target.includes('%') ? 'percent' : kpi.target.includes('K') ? 'currency' : 'number',
    frequency: 'monthly',
    isActive: true,
    lastUpdated: new Date().toISOString(),
    createdBy: 'Static',
    value: parseFloat(kpi.value.replace(/[^0-9.]/g, '')),
    format: kpi.target.includes('%') ? 'percent' : kpi.target.includes('K') ? 'currency' : 'number',
    lowerIsBetter: kpi.target.includes('≤'),
    score: kpi.status === 'on-track' ? 95 : kpi.status === 'at-risk' ? 75 : 50,
  }));

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
            {userTier && (
              <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                Tier: {userTier}
              </span>
            )}
          </div>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {config.reviewType} • Position-based automated review tracking
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              refreshPosition(true);
              refreshKPIs();
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            Refresh Data
          </button>
          <button 
            onClick={openScheduleModal}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
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
        {displayKPIs ? (
          // Dynamic KPIs from API
          displayKPIs.map((kpi, idx) => {
            const status = getKPIStatus(kpi);
            return (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {kpi.name}
                  </p>
                  <KPIStatus status={status} />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatKPIValue(kpi.value, kpi.format)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Target: {formatKPITarget(kpi.target, kpi.format, !!kpi.lowerIsBetter)}
                </p>
              </div>
            );
          })
        ) : (
          // No KPIs available
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No KPI data available.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              KPIs will appear here once they are configured for your position.
            </p>
          </div>
        )}
      </div>

      {/* KPI Loading/Error State */}
      {kpiLoading && (
        <div className="text-center py-2">
          <p className="text-sm text-gray-500">Loading KPI data...</p>
        </div>
      )}
      {kpiError && (
        <div className="text-center py-2">
          <p className="text-sm text-red-500">Error loading KPIs: {kpiError}</p>
        </div>
      )}

      {/* Upcoming Reviews */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Reviews
          </h3>
          {isLoadingReviews && (
            <span className="text-sm text-gray-500">Loading...</span>
          )}
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {/* API-fetched scheduled reviews */}
            {scheduledReviews.length > 0 && scheduledReviews.map((review) => {
              const scheduledDate = new Date(review.scheduledDateTime);
              const isDeleting = deletingReviewId === review.id;
              
              return (
                <div
                  key={review.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                          {review.reviewType}
                        </span>
                        <StatusBadge status={review.status} />
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          review.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          review.priority === 'low' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {review.priority}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {review.title}
                      </h4>
                      {review.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {review.description}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Assigned to: {review.assignee} • Scheduled: {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {review.sendReminder && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          🔔 Reminder {review.reminderDaysBefore} day(s) before
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      {/* Status Update Dropdown */}
                      <select
                        value={review.status}
                        onChange={(e) => handleStatusUpdate(review.id, e.target.value as any)}
                        className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      
                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(review)}
                        disabled={isDeleting}
                        className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded transition-colors disabled:opacity-50"
                        title="Edit review"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={isDeleting}
                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                        title="Cancel review"
                      >
                        {isDeleting ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Empty state */}
            {scheduledReviews.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No upcoming reviews scheduled.</p>
                <button
                  onClick={openScheduleModal}
                  className="mt-2 text-brand-500 hover:text-brand-600 text-sm font-medium"
                >
                  Schedule your first review
                </button>
              </div>
            )}
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
            {displayKPIs ? (
              // Dynamic KPIs from API as checklist items
              displayKPIs.map((kpi, idx) => {
                const status = getKPIStatus(kpi);
                const isCompleted = status === 'on-track';
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isCompleted
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => {}}
                      className="w-5 h-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                    />
                    <div className="flex-1">
                      <span className={`text-sm ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                        {kpi.name} ({formatKPIValue(kpi.value, kpi.format)} / {formatKPITarget(kpi.target, kpi.format, !!kpi.lowerIsBetter)})
                      </span>
                      {kpi.category && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                          {kpi.category}
                        </span>
                      )}
                    </div>
                    {isCompleted && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                        Complete
                      </span>
                    )}
                    {!isCompleted && status === 'at-risk' && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                        At Risk
                      </span>
                    )}
                    {!isCompleted && status === 'behind' && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                        Behind
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              // No KPIs available
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No checklist items available.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Checklist items will appear here once KPIs are configured for your position.
                </p>
              </div>
            )}
          </div>

          {/* Digital Sign-off */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Digital Sign-Off
              </h4>
              {signOffStatus === 'success' && (
                <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Signed
                </span>
              )}
            </div>
            
            {signOffStatus === 'success' ? (
              // Success state - show confirmation
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Review Successfully Signed
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      Signed by <span className="font-semibold">{signature}</span> on {signedAt?.toLocaleDateString()} at {signedAt?.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Input state - show form
              <>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label htmlFor="electronic-signature" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Electronic Signature
                    </label>
                    <input
                      id="electronic-signature"
                      type="text"
                      value={signature}
                      onChange={handleSignatureChange}
                      placeholder={`Type your name to sign as ${config.displayName}`}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 transition-colors ${
                        signOffStatus === 'error' 
                          ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-200 dark:border-gray-700 focus:ring-brand-500 focus:border-brand-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={handleSignOff}
                      disabled={isSubmitting || !signature.trim()}
                      className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing...
                        </>
                      ) : (
                        'Sign & Submit'
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Error message */}
                {signOffStatus === 'error' && signOffError && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {signOffError}
                  </div>
                )}
                
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Electronic acknowledgment required within 24 hours
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Review History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Review History
          </h3>
          {isLoadingPastReviews && (
            <span className="text-sm text-gray-500">Loading...</span>
          )}
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Review</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {pastReviews.length > 0 ? (
                  pastReviews.map((review) => {
                    const scheduledDate = new Date(review.scheduledDateTime);
                    return (
                      <tr key={review.id}>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{review.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{review.reviewType}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            review.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            review.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            review.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {review.status.charAt(0).toUpperCase() + review.status.slice(1).replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            review.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            review.priority === 'low' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {review.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => openEditModal(review)}
                            className="text-brand-500 hover:underline text-sm"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No past reviews found. Reviews will appear here after their scheduled date has passed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Schedule Review Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isClosingModal ? 'opacity-0' : 'opacity-100'}`}
            onClick={closeScheduleModal}
            aria-hidden="true"
          ></div>

          {/* Modal panel - Bottom sheet on mobile, centered on desktop */}
          <div 
            className={`relative p-4 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-xl transform transition-all duration-300 ${
              isClosingModal 
                ? 'translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0' 
                : 'translate-y-0 sm:translate-y-0 sm:scale-100 sm:opacity-100'
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-review-title"
          >
            {/* Drag handle for mobile */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
              {/* Modal header */}
              <div className="flex items-center justify-between mb-4">
                <h3 id="schedule-review-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isEditMode ? 'Edit Review' : 'Schedule a Review'}
                </h3>
                <button
                  onClick={closeScheduleModal}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Success state */}
              {scheduleStatus === 'success' ? (
                <div className="py-8 text-center">
                  <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {isEditMode ? 'Review Updated Successfully' : 'Review Scheduled Successfully'}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isEditMode 
                      ? 'The review has been updated with your changes.'
                      : 'The review has been scheduled and reminders will be sent accordingly.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Form */}
                  <div className="space-y-4">
                    {/* Review Type */}
                    <div>
                      <label htmlFor="reviewType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Review Type
                      </label>
                      <input
                        type="text"
                        id="reviewType"
                        name="reviewType"
                        value={scheduleFormData.reviewType}
                        onChange={handleScheduleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                        placeholder="e.g., Monthly Performance Review"
                      />
                    </div>

                    {/* Title */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Review Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={scheduleFormData.title}
                        onChange={handleScheduleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                        placeholder="e.g., Q1 Performance Assessment"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={scheduleFormData.description}
                        onChange={handleScheduleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                        placeholder="Optional description or agenda for the review..."
                      />
                    </div>

                    {/* Related KPI */}
                    <div>
                      <label htmlFor="kpiId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Related KPI (Optional)
                      </label>
                      {isLoadingKpis ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading KPIs...
                        </div>
                      ) : kpiOptions.length > 0 ? (
                        <select
                          id="kpiId"
                          name="kpiId"
                          value={scheduleFormData.kpiId}
                          onChange={handleScheduleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                        >
                          <option value="">Select a KPI...</option>
                          {kpiOptions.map((kpi) => (
                            <option key={kpi.id} value={kpi.id}>
                              {kpi.name} ({kpi.category})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                          No KPIs available. Add KPIs in KPI Settings.
                        </p>
                      )}
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="scheduledDate"
                          name="scheduledDate"
                          value={scheduleFormData.scheduledDate}
                          onChange={handleScheduleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Time
                        </label>
                        <input
                          type="time"
                          id="scheduledTime"
                          name="scheduledTime"
                          value={scheduleFormData.scheduledTime}
                          onChange={handleScheduleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                        />
                      </div>
                    </div>

                    {/* Assignee and Priority */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Assignee
                        </label>
                        <input
                          type="text"
                          id="assignee"
                          name="assignee"
                          value={scheduleFormData.assignee}
                          onChange={handleScheduleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                          placeholder="Who will conduct the review"
                        />
                      </div>
                      <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Priority
                        </label>
                        <select
                          id="priority"
                          name="priority"
                          value={scheduleFormData.priority}
                          onChange={handleScheduleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    {/* Reminder Settings */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id="sendReminder"
                          name="sendReminder"
                          checked={scheduleFormData.sendReminder}
                          onChange={handleScheduleFormChange}
                          className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
                        />
                        <label htmlFor="sendReminder" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Send reminder before review
                        </label>
                      </div>
                      {scheduleFormData.sendReminder && (
                        <div className="ml-6">
                          <label htmlFor="reminderDaysBefore" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Days before review
                          </label>
                          <input
                            type="number"
                            id="reminderDaysBefore"
                            name="reminderDaysBefore"
                            min={1}
                            max={30}
                            value={scheduleFormData.reminderDaysBefore}
                            onChange={handleScheduleFormChange}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Error message */}
                    {scheduleStatus === 'error' && scheduleError && (
                      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {scheduleError}
                      </div>
                    )}
                  </div>

                  {/* Modal footer */}
                  <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={closeScheduleModal}
                      disabled={isScheduling}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={isEditMode ? handleUpdateReview : handleScheduleReview}
                      disabled={isScheduling}
                      className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isScheduling ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {isEditMode ? 'Updating...' : 'Scheduling...'}
                        </>
                      ) : (
                        isEditMode ? 'Update Review' : 'Schedule Review'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
      )}
    </div>
  );
}
