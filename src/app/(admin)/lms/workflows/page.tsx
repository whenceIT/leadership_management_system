'use client';

import { useState, useEffect } from 'react';
import { useUserPosition, PositionType } from '@/hooks/useUserPosition';
import { 
  RoleDependency,
  ESCALATION_RULES,
  HANDOFF_CONFIGS,
  ROLE_DEPENDENCIES
} from '@/hooks/useWorkflowEngine';

// ============================================
// SCHEDULE REVIEW TYPES
// ============================================

interface ScheduleReviewData {
  title: string;
  reviewType: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  participants: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  notes: string;
  reminderMinutes: number;
}

interface ScheduleReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScheduleReviewData) => Promise<void>;
  position: PositionType | null;
}

// ============================================
// POSITION-SPECIFIC WORKFLOW CONFIGURATIONS
// ============================================

interface PositionWorkflowConfig {
  position: PositionType;
  displayName: string;
  workflowTypes: string[];
  pendingActions: PendingAction[];
  incomingHandoffs: HandoffItem[];
  escalationItems: EscalationItem[];
  kpiMetrics: KPIMetric[];
}

interface PendingAction {
  id: string;
  title: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
  workflowId?: string;
}

interface HandoffItem {
  id: string;
  fromRole: string;
  type: string;
  description: string;
  receivedAt: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface EscalationItem {
  id: string;
  fromRole: string;
  reason: string;
  escalatedAt: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  currentLevel: number;
}

interface KPIMetric {
  name: string;
  value: string;
  target: string;
  status: 'on-track' | 'at-risk' | 'behind';
  trend: 'up' | 'down' | 'stable';
}

// Branch Manager Workflows
const getBranchManagerWorkflows = (): PositionWorkflowConfig => ({
  position: 'Branch Manager',
  displayName: 'Branch Manager',
  workflowTypes: ['loan_approval', 'collection', 'disbursement', 'client_onboarding'],
  pendingActions: [
    { id: 'pa1', title: 'Approve Loan #8892 - K25,000', type: 'approval', priority: 'high', deadline: '2024-02-08', workflowId: 'wf_123' },
    { id: 'pa2', title: 'Review Collection Performance', type: 'review', priority: 'medium', deadline: '2024-02-10' },
    { id: 'pa3', title: 'Sign Off Daily Reports', type: 'signoff', priority: 'low' },
  ],
  incomingHandoffs: [
    { id: 'hh1', fromRole: 'Recoveries Coordinator', type: 'collection_handoff', description: 'Loan #4521 - Day 90 delinquent', receivedAt: '2024-02-05', status: 'pending' },
  ],
  escalationItems: [
    { id: 'es1', fromRole: 'District Manager', reason: 'Default rate exceeded 25%', escalatedAt: '2024-02-07', priority: 'high', currentLevel: 1 },
  ],
  kpiMetrics: [
    { name: 'Monthly Disbursement', value: 'K420,000', target: 'K450,000+', status: 'on-track', trend: 'up' },
    { name: 'Month-1 Default Rate', value: '26.5%', target: '≤25%', status: 'at-risk', trend: 'down' },
    { name: 'Recovery Rate', value: '62%', target: '≥65%', status: 'at-risk', trend: 'stable' },
  ],
});

// District Manager Workflows
const getDistrictManagerWorkflows = (): PositionWorkflowConfig => ({
  position: 'District Manager',
  displayName: 'District Manager',
  workflowTypes: ['district_oversight', 'branch_approval', 'performance_review', 'resource_allocation'],
  pendingActions: [
    { id: 'pa1', title: 'Approve District Budget Q1', type: 'approval', priority: 'high', deadline: '2024-02-15', workflowId: 'wf_456' },
    { id: 'pa2', title: 'Review Branch Performance Reports', type: 'review', priority: 'medium' },
    { id: 'pa3', title: 'Conduct DM Meeting', type: 'meeting', priority: 'medium', deadline: '2024-02-12' },
  ],
  incomingHandoffs: [
    { id: 'hh1', fromRole: 'Branch Manager', type: 'escalation', description: 'Branch A - Performance concerns', receivedAt: '2024-02-06', status: 'in_progress' },
  ],
  escalationItems: [
    { id: 'es1', fromRole: 'Provincial Manager', reason: 'District default rate review', escalatedAt: '2024-02-01', priority: 'medium', currentLevel: 2 },
  ],
  kpiMetrics: [
    { name: 'District Revenue', value: 'K1.2M', target: 'K1.16M', status: 'on-track', trend: 'up' },
    { name: 'Avg Default Rate', value: '26.8%', target: '≤25.36%', status: 'at-risk', trend: 'down' },
    { name: 'Branch Compliance', value: '100%', target: '100%', status: 'on-track', trend: 'stable' },
  ],
});

// Provincial Manager Workflows
const getProvincialManagerWorkflows = (): PositionWorkflowConfig => ({
  position: 'Provincial Manager',
  displayName: 'Provincial Manager',
  workflowTypes: ['provincial_strategy', 'district_oversight', 'policy_implementation', 'stakeholder_management'],
  pendingActions: [
    { id: 'pa1', title: 'Approve Provincial Strategy Q2', type: 'approval', priority: 'critical', deadline: '2024-02-20', workflowId: 'wf_789' },
    { id: 'pa2', title: 'Review District Performance', type: 'review', priority: 'high' },
    { id: 'pa3', title: 'Board Presentation Prep', type: 'planning', priority: 'high', deadline: '2024-02-25' },
  ],
  incomingHandoffs: [
    { id: 'hh1', fromRole: 'District Manager', type: 'quarterly_report', description: 'Q1 Performance Report', receivedAt: '2024-02-07', status: 'pending' },
  ],
  escalationItems: [
    { id: 'es1', fromRole: 'Executive', reason: 'Strategic initiative review', escalatedAt: '2024-02-05', priority: 'high', currentLevel: 1 },
  ],
  kpiMetrics: [
    { name: 'Provincial Revenue', value: 'K5.2M', target: 'K5.8M', status: 'at-risk', trend: 'up' },
    { name: 'Net Contribution', value: '22%', target: '+25%', status: 'at-risk', trend: 'stable' },
    { name: 'District Health Score', value: '78%', target: '≥85%', status: 'at-risk', trend: 'down' },
  ],
});

// Risk Manager Workflows
const getRiskManagerWorkflows = (): PositionWorkflowConfig => ({
  position: 'Risk Manager',
  displayName: 'Risk Manager',
  workflowTypes: ['risk_assessment', 'fraud_detection', 'compliance_review', 'audit_management'],
  pendingActions: [
    { id: 'pa1', title: 'Investigate Suspicious Activity #2024-089', type: 'investigation', priority: 'critical', deadline: '2024-02-08', workflowId: 'wf_101' },
    { id: 'pa2', title: 'Monthly Risk Report', type: 'reporting', priority: 'high', deadline: '2024-02-10' },
    { id: 'pa3', title: 'Update Fraud Detection Rules', type: 'configuration', priority: 'medium' },
  ],
  incomingHandoffs: [
    { id: 'hh1', fromRole: 'Branch Manager', type: 'risk_alert', description: 'Unusual default pattern detected', receivedAt: '2024-02-06', status: 'in_progress' },
  ],
  escalationItems: [
    { id: 'es1', fromRole: 'Provincial Manager', reason: 'Cross-branch fraud pattern', escalatedAt: '2024-02-07', priority: 'critical', currentLevel: 2 },
  ],
  kpiMetrics: [
    { name: 'Losses Prevented', value: 'K520,000', target: '≥K500,000', status: 'on-track', trend: 'up' },
    { name: 'Fraud Detection Rate', value: '92%', target: '≥90%', status: 'on-track', trend: 'stable' },
    { name: 'Avg Detection Time', value: '5 days', target: '≤7 days', status: 'on-track', trend: 'down' },
  ],
});

// Recoveries Coordinator Workflows
const getRecoveriesCoordinatorWorkflows = (): PositionWorkflowConfig => ({
  position: 'Recoveries Coordinator',
  displayName: 'Recoveries Coordinator',
  workflowTypes: ['recovery_operations', 'payment_negotiation', 'collateral_management', 'legal_coordination'],
  pendingActions: [
    { id: 'pa1', title: 'Process Payment Plan #5678', type: 'processing', priority: 'high', deadline: '2024-02-08', workflowId: 'wf_201' },
    { id: 'pa2', title: 'Review Day-90 Portfolio', type: 'review', priority: 'high' },
    { id: 'pa3', title: 'Coordinate Legal Action #3 Cases', type: 'legal', priority: 'medium' },
  ],
  incomingHandoffs: [
    { id: 'hh1', fromRole: 'Branch Manager', type: 'collection_handoff', description: '8 loans eligible for recovery', receivedAt: '2024-02-05', status: 'in_progress' },
    { id: 'hh2', fromRole: 'Branch Manager', type: 'collection_handoff', description: 'Loan #4521 - Full dossier', receivedAt: '2024-02-05', status: 'pending' },
  ],
  escalationItems: [
    { id: 'es1', fromRole: 'Risk Manager', reason: 'High-value fraud case', escalatedAt: '2024-02-06', priority: 'critical', currentLevel: 1 },
  ],
  kpiMetrics: [
    { name: 'Monthly Recoveries', value: 'K195,000', target: '≥K190,000', status: 'on-track', trend: 'up' },
    { name: 'Net Recovery Income', value: 'K156,000', target: '≥K152,000', status: 'on-track', trend: 'stable' },
    { name: 'Recovery Rate', value: '67%', target: '≥65%', status: 'on-track', trend: 'up' },
  ],
});

// Generic workflow config for other positions
const getGenericWorkflows = (position: string): PositionWorkflowConfig => ({
  position: position as PositionType,
  displayName: position,
  workflowTypes: ['general', 'reporting', 'approvals'],
  pendingActions: [
    { id: 'pa1', title: 'Review Pending Items', type: 'review', priority: 'medium' },
  ],
  incomingHandoffs: [],
  escalationItems: [],
  kpiMetrics: [
    { name: 'Performance', value: 'TBD', target: 'TBD', status: 'on-track', trend: 'stable' },
  ],
});

// ============================================
// GET POSITION-SPECIFIC CONFIG
// ============================================

function getPositionWorkflowConfig(position: PositionType | null): PositionWorkflowConfig {
  if (!position) return getGenericWorkflows('Branch Manager');
  
  switch (position) {
    case 'Branch Manager':
      return getBranchManagerWorkflows();
    case 'District Manager':
      return getDistrictManagerWorkflows();
    case 'Provincial Manager':
      return getProvincialManagerWorkflows();
    case 'Risk Manager':
      return getRiskManagerWorkflows();
    case 'Recoveries Coordinator':
      return getRecoveriesCoordinatorWorkflows();
    default:
      return getGenericWorkflows(position);
  }
}

// ============================================
// DEPENDENCY MAPPING BY POSITION
// ============================================

function getPositionDependencies(position: string): { upstream: RoleDependency[]; downstream: RoleDependency[] } {
  const upstream = ROLE_DEPENDENCIES.filter((d: RoleDependency) => d.downstreamRole === position);
  const downstream = ROLE_DEPENDENCIES.filter((d: RoleDependency) => d.upstreamRole === position);
  
  return { upstream, downstream };
}

// ============================================
// SCHEDULE REVIEW MODAL COMPONENT
// ============================================

const REVIEW_TYPES = [
  { value: 'performance', label: 'Performance Review' },
  { value: 'loan_approval', label: 'Loan Approval Review' },
  { value: 'collection', label: 'Collection Review' },
  { value: 'compliance', label: 'Compliance Review' },
  { value: 'risk_assessment', label: 'Risk Assessment Review' },
  { value: 'branch_audit', label: 'Branch Audit Review' },
  { value: 'quarterly_business', label: 'Quarterly Business Review' },
  { value: 'staff_development', label: 'Staff Development Review' },
  { value: 'other', label: 'Other' },
];

const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

const REMINDER_OPTIONS = [
  { value: 0, label: 'No reminder' },
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
];

function ScheduleReviewModal({ isOpen, onClose, onSubmit, position }: ScheduleReviewModalProps) {
  const [formData, setFormData] = useState<ScheduleReviewData>({
    title: '',
    reviewType: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 30,
    participants: [],
    priority: 'medium',
    location: '',
    notes: '',
    reminderMinutes: 15,
  });
  const [participantInput, setParticipantInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof ScheduleReviewData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const addParticipant = () => {
    if (participantInput.trim() && !formData.participants.includes(participantInput.trim())) {
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, participantInput.trim()],
      }));
      setParticipantInput('');
    }
  };

  const removeParticipant = (email: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p !== email),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.reviewType) {
      setError('Review type is required');
      return;
    }
    if (!formData.scheduledDate) {
      setError('Scheduled date is required');
      return;
    }
    if (!formData.scheduledTime) {
      setError('Scheduled time is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        title: '',
        reviewType: '',
        description: '',
        scheduledDate: '',
        scheduledTime: '',
        duration: 30,
        participants: [],
        priority: 'medium',
        location: '',
        notes: '',
        reminderMinutes: 15,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity" 
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Schedule Review
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create a new review meeting or session
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Review Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Q1 Performance Review - Branch A"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Review Type & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Review Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.reviewType}
                  onChange={(e) => handleInputChange('reviewType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select review type</option>
                  {REVIEW_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide details about the review agenda and objectives..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            {/* Date, Time & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {DURATION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location / Meeting Link
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Conference Room A or https://zoom.us/j/..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Participants
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={participantInput}
                  onChange={(e) => setParticipantInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addParticipant())}
                  placeholder="Enter email or name and press Enter"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addParticipant}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.participants.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.participants.map((participant, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 rounded-full text-sm"
                    >
                      {participant}
                      <button
                        type="button"
                        onClick={() => removeParticipant(participant)}
                        className="hover:text-brand-600 dark:hover:text-brand-400"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Reminder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reminder
              </label>
              <select
                value={formData.reminderMinutes}
                onChange={(e) => handleInputChange('reminderMinutes', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {REMINDER_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes or preparation requirements..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            {/* Position Info */}
            {position && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Scheduling as:</span> {position}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Schedule Review
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT
// ============================================

export default function WorkflowsPage() {
  const { positionName: rawPosition, isLoading: isUserLoading, refreshPosition } = useUserPosition();
  const [config, setConfig] = useState<PositionWorkflowConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'workflows' | 'dependencies' | 'handoffs' | 'escalations'>('workflows');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && rawPosition) {
      const normalizedPosition = rawPosition as PositionType;
      setConfig(getPositionWorkflowConfig(normalizedPosition));
    }
  }, [rawPosition, isUserLoading]);

  // API call to schedule review
  const scheduleReview = async (data: ScheduleReviewData): Promise<void> => {
    const API_BASE_URL = 'https://smartbackend.whencefinancesystem.com';
    
    // Combine date and time into a single datetime
    const scheduledDateTime = `${data.scheduledDate}T${data.scheduledTime}:00`;
    
    const payload = {
      title: data.title,
      review_type: data.reviewType,
      description: data.description,
      scheduled_date: data.scheduledDate,
      scheduled_time: data.scheduledTime,
      scheduled_datetime: scheduledDateTime,
      duration_minutes: data.duration,
      participants: data.participants,
      priority: data.priority,
      location: data.location,
      notes: data.notes,
      reminder_minutes: data.reminderMinutes,
      position: rawPosition,
      created_at: new Date().toISOString(),
    };

    const response = await fetch(`${API_BASE_URL}/api/reviews/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to schedule review: ${response.status}`);
    }

    setSubmitSuccess('Review scheduled successfully!');
    setTimeout(() => setSubmitSuccess(null), 5000);
  };

  if (isUserLoading || !config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const { upstream, downstream } = getPositionDependencies(config.position as string);

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {submitSuccess && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-green-700 dark:text-green-400">{submitSuccess}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Workflow Management
            </h1>
            <span className="px-3 py-1 text-sm font-medium bg-brand-100 text-brand-800 rounded-full">
              {config.displayName}
            </span>
          </div>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Cross-role dependency mapping and automated workflow orchestration
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => refreshPosition(true)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Refresh Position
          </button>
          <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Configure Workflows
          </button>
          <button 
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Schedule Review
          </button>
          <button className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors">
            Create Workflow
          </button>
        </div>
      </div>

      {/* Schedule Review Modal */}
      <ScheduleReviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSubmit={scheduleReview}
        position={rawPosition as PositionType}
      />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6">
          {[
            { id: 'workflows', label: 'Active Workflows' },
            { id: 'dependencies', label: 'Role Dependencies' },
            { id: 'handoffs', label: 'Automated Handoffs' },
            { id: 'escalations', label: 'Escalations' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'workflows' && (
        <div className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {config.kpiMetrics.map((metric, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{metric.name}</p>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    metric.status === 'on-track' ? 'bg-green-100 text-green-800' :
                    metric.status === 'at-risk' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {metric.status === 'on-track' ? '✓' : metric.status === 'at-risk' ? '⚠' : '✗'} {metric.status.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Target: {metric.target}</p>
              </div>
            ))}
          </div>

          {/* Pending Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pending Actions
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {config.pendingActions.map((action) => (
                  <div key={action.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            action.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            action.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            action.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {action.priority}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            {action.type}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{action.title}</h4>
                        {action.deadline && (
                          <p className="text-sm text-gray-500 mt-1">Deadline: {action.deadline}</p>
                        )}
                      </div>
                      <button className="px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm transition-colors">
                        Action
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Workflows */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Active Workflows
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {config.workflowTypes.map((type) => (
                  <div key={type} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                      <span className="text-xs text-gray-500">0 pending</span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white capitalize">{type.replace('_', ' ')}</h4>
                    <p className="text-xs text-gray-500 mt-1">No active instances</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dependencies' && (
        <div className="space-y-6">
          {/* Dependency Map */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cross-Role Dependency Map
              </h3>
              <p className="text-sm text-gray-500 mt-1">How your actions impact other roles and vice versa</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Downstream Dependencies (Roles YOU affect) */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    Downstream Dependencies
                    <span className="text-xs font-normal text-gray-500">(Roles you impact)</span>
                  </h4>
                  <div className="space-y-3">
                    {downstream.map((dep, idx) => (
                      <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-blue-800 dark:text-blue-300">{dep.downstreamRole}</span>
                          <span className="text-xs px-2 py-0.5 bg-blue-200 text-blue-800 rounded">{dep.dependencyType.replace('_', ' ')}</span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-400">{dep.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${dep.weight * 100}%` }}></div>
                          </div>
                          <span className="text-xs text-blue-600">{Math.round(dep.weight * 100)}% impact</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upstream Dependencies (Roles that affect YOU) */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    Upstream Dependencies
                    <span className="text-xs font-normal text-gray-500">(Roles that impact you)</span>
                  </h4>
                  <div className="space-y-3">
                    {upstream.map((dep, idx) => (
                      <div key={idx} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-green-800 dark:text-green-300">{dep.upstreamRole}</span>
                          <span className="text-xs px-2 py-0.5 bg-green-200 text-green-800 rounded">{dep.dependencyType.replace('_', ' ')}</span>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-400">{dep.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-green-200 dark:bg-green-800 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: `${dep.weight * 100}%` }}></div>
                          </div>
                          <span className="text-xs text-green-600">{Math.round(dep.weight * 100)}% impact</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'handoffs' && (
        <div className="space-y-6">
          {/* Incoming Handoffs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Incoming Handoffs
              </h3>
              <p className="text-sm text-gray-500 mt-1">Automated transfers from other roles</p>
            </div>
            <div className="p-6">
              {config.incomingHandoffs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending handoffs</p>
              ) : (
                <div className="space-y-4">
                  {config.incomingHandoffs.map((handoff) => (
                    <div key={handoff.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                              handoff.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              handoff.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {handoff.status.replace('_', ' ')}
                            </span>
                            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                              {handoff.type.replace('_', ' ')}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{handoff.description}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            From: {handoff.fromRole} • Received: {handoff.receivedAt}
                          </p>
                        </div>
                        <button className="px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm transition-colors">
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Automated Handoff Configurations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Automated Handoff Rules
              </h3>
              <p className="text-sm text-gray-500 mt-1">Configured handoff triggers and workflows</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {HANDOFF_CONFIGS.slice(0, 4).map((handoff, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                      <span className="text-xs text-gray-500">{handoff.slaMinutes}h SLA</span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {handoff.sourceState} → {handoff.targetState}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {handoff.sourceRole} → {handoff.targetRole}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Required approvals: {handoff.requiredApprovals.join(', ') || 'None'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'escalations' && (
        <div className="space-y-6">
          {/* Escalation Items */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Active Escalations
              </h3>
              <p className="text-sm text-gray-500 mt-1">Issues requiring your attention or escalation</p>
            </div>
            <div className="p-6">
              {config.escalationItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No active escalations</p>
              ) : (
                <div className="space-y-4">
                  {config.escalationItems.map((escalation) => (
                    <div key={escalation.id} className={`p-4 border rounded-lg ${
                      escalation.priority === 'critical' ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' :
                      escalation.priority === 'high' ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20' :
                      'border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                              escalation.priority === 'critical' ? 'bg-red-200 text-red-800' :
                              escalation.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                              'bg-gray-200 text-gray-800'
                            }`}>
                              {escalation.priority}
                            </span>
                            <span className="text-xs text-gray-500">Level {escalation.currentLevel}</span>
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{escalation.reason}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            From: {escalation.fromRole} • Escalated: {escalation.escalatedAt}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors">
                            Resolve
                          </button>
                          <button className="px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm transition-colors">
                            Escalate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Escalation Rules */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Escalation Rules
              </h3>
              <p className="text-sm text-gray-500 mt-1">Configured rules for automatic escalation</p>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {ESCALATION_RULES.slice(0, 4).map((rule, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        rule.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        rule.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        rule.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        {rule.autoResolve ? 'Auto-resolve' : 'Manual resolution'}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{rule.description}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Path: {rule.escalationPath.join(' → ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Intelligent Escalation System */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Intelligent Escalation System</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Authority Check</span>
                </div>
                <p className="text-sm text-purple-100">Automatically evaluates if issues are within assigned role's authority</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Time-Based</span>
                </div>
                <p className="text-sm text-purple-100">Escalates automatically when SLA deadlines are exceeded</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-medium">Pattern Detection</span>
                </div>
                <p className="text-sm text-purple-100">Identifies recurring issues and triggers proactive escalation</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
