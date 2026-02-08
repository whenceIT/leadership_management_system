'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserPosition, AVAILABLE_POSITIONS, PositionType } from './useUserPosition';

// ============================================
// EVENT TYPES & INTERFACES
// ============================================

export type EventType = 
  | 'ROLE_ACTION_COMPLETED'
  | 'KPI_IMPACT_UPDATED'
  | 'WORKFLOW_TRANSITION'
  | 'APPROVAL_REQUESTED'
  | 'APPROVAL_GRANTED'
  | 'APPROVAL_DENIED'
  | 'ESCALATION_TRIGGERED'
  | 'ISSUE_DETECTED'
  | 'ISSUE_RESOLVED'
  | 'HANDFOFF_INITIATED'
  | 'HANDFOFF_COMPLETED'
  | 'DEADLINE_EXCEEDED';

export type WorkflowState = 
  | 'ACTIVE'
  | 'PENDING_APPROVAL'
  | 'DELINQUENT'
  | 'COLLECTIONS'
  | 'RECOVERIES'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED';

export interface WorkflowEvent {
  id: string;
  type: EventType;
  timestamp: Date;
  sourceRole: string;
  targetRole?: string;
  payload: Record<string, unknown>;
  metadata?: {
    correlationId?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    slaMinutes?: number;
  };
}

export interface RoleDependency {
  upstreamRole: string;
  downstreamRole: string;
  dependencyType: 'kpi_impact' | 'action_required' | 'information_flow' | 'approval_chain';
  weight: number;
  description: string;
}

export interface WorkflowInstance {
  id: string;
  type: string;
  currentState: WorkflowState;
  assignedRole: string;
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
  metadata: Record<string, unknown>;
  history: WorkflowEvent[];
}

export interface EscalationRule {
  id: string;
  condition: (instance: WorkflowInstance) => boolean;
  escalationPath: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  autoResolve: boolean;
  description: string;
}

export interface HandoffConfig {
  triggerCondition: (event: WorkflowEvent) => boolean;
  sourceState: WorkflowState;
  targetState: WorkflowState;
  sourceRole: string;
  targetRole: string;
  requiredApprovals: string[];
  autoAssign: boolean;
  slaMinutes: number;
}

// ============================================
// ROLE DEPENDENCY GRAPH
// ============================================

export const ROLE_DEPENDENCIES: RoleDependency[] = [
  { upstreamRole: 'Branch Manager', downstreamRole: 'District Manager', dependencyType: 'kpi_impact', weight: 0.8, description: 'Branch performance affects district KPIs' },
  { upstreamRole: 'Branch Manager', downstreamRole: 'Recoveries Coordinator', dependencyType: 'action_required', weight: 0.6, description: 'Delinquent loans escalate to recoveries' },
  { upstreamRole: 'Branch Manager', downstreamRole: 'Risk Manager', dependencyType: 'information_flow', weight: 0.5, description: 'Risk findings reported upstream' },
  { upstreamRole: 'District Manager', downstreamRole: 'Provincial Manager', dependencyType: 'kpi_impact', weight: 0.9, description: 'District aggregation affects provincial KPIs' },
  { upstreamRole: 'District Manager', downstreamRole: 'Branch Manager', dependencyType: 'action_required', weight: 0.7, description: 'District directives require branch action' },
  { upstreamRole: 'Provincial Manager', downstreamRole: 'Manager Administration', dependencyType: 'information_flow', weight: 0.6, description: 'Strategic alignment reporting' },
  { upstreamRole: 'Risk Manager', downstreamRole: 'Management Accountant', dependencyType: 'information_flow', weight: 0.7, description: 'Risk findings feed financial reports' },
  { upstreamRole: 'Risk Manager', downstreamRole: 'Branch Manager', dependencyType: 'action_required', weight: 0.5, description: 'Risk alerts require branch action' },
  { upstreamRole: 'Risk Manager', downstreamRole: 'District Manager', dependencyType: 'kpi_impact', weight: 0.6, description: 'Risk metrics affect district score' },
  { upstreamRole: 'IT Manager', downstreamRole: 'Branch Manager', dependencyType: 'action_required', weight: 0.4, description: 'System updates enable branch operations' },
  { upstreamRole: 'IT Manager', downstreamRole: 'Management Accountant', dependencyType: 'information_flow', weight: 0.5, description: 'System data feeds financial reporting' },
  { upstreamRole: 'IT Manager', downstreamRole: 'Recoveries Coordinator', dependencyType: 'action_required', weight: 0.3, description: 'Recovery tools and systems support' },
  { upstreamRole: 'Recoveries Coordinator', downstreamRole: 'Risk Manager', dependencyType: 'information_flow', weight: 0.6, description: 'Recovery outcomes feed risk models' },
  { upstreamRole: 'Recoveries Coordinator', downstreamRole: 'Branch Manager', dependencyType: 'kpi_impact', weight: 0.4, description: 'Recovery rates affect branch performance' },
  { upstreamRole: 'R&D Coordinator', downstreamRole: 'Provincial Manager', dependencyType: 'information_flow', weight: 0.5, description: 'Innovation pipeline feeds strategic planning' },
  { upstreamRole: 'R&D Coordinator', downstreamRole: 'Branch Manager', dependencyType: 'action_required', weight: 0.3, description: 'New products require branch adoption' },
  { upstreamRole: 'Policy & Training Manager', downstreamRole: 'Branch Manager', dependencyType: 'action_required', weight: 0.5, description: 'Policy updates require branch compliance' },
  { upstreamRole: 'Policy & Training Manager', downstreamRole: 'Risk Manager', dependencyType: 'information_flow', weight: 0.4, description: 'Policy breaches feed risk assessment' },
  { upstreamRole: 'Management Accountant', downstreamRole: 'Provincial Manager', dependencyType: 'kpi_impact', weight: 0.7, description: 'Financial metrics affect provincial KPIs' },
  { upstreamRole: 'Payroll Loans Manager', downstreamRole: 'Branch Manager', dependencyType: 'action_required', weight: 0.4, description: 'Payroll loan referrals from branches' },
  { upstreamRole: 'Motor Vehicles Manager', downstreamRole: 'Branch Manager', dependencyType: 'action_required', weight: 0.4, description: 'MV loan referrals from branches' },
  { upstreamRole: 'General Operations Manager (GOM)', downstreamRole: 'Branch Manager', dependencyType: 'action_required', weight: 0.5, description: 'Operational directives require branch action' },
  { upstreamRole: 'General Operations Administrator (GOA)', downstreamRole: 'Branch Manager', dependencyType: 'action_required', weight: 0.4, description: 'Administrative support enables branch ops' },
  { upstreamRole: 'Performance Operations Administrator (POA)', downstreamRole: 'Branch Manager', dependencyType: 'kpi_impact', weight: 0.5, description: 'Performance monitoring affects branch score' },
  { upstreamRole: 'Creative Artwork & Marketing Representative Manager', downstreamRole: 'Branch Manager', dependencyType: 'action_required', weight: 0.3, description: 'Marketing campaigns require branch execution' },
];

// ============================================
// AUTOMATED HANDOFF CONFIGURATIONS
// ============================================

export const HANDOFF_CONFIGS: HandoffConfig[] = [
  {
    triggerCondition: (event) => event.type === 'ISSUE_DETECTED' && (event.payload.daysDelinquent as number) >= 90,
    sourceState: 'DELINQUENT',
    targetState: 'RECOVERIES',
    sourceRole: 'Branch Manager',
    targetRole: 'Recoveries Coordinator',
    requiredApprovals: ['Branch Manager'],
    autoAssign: true,
    slaMinutes: 24,
  },
  {
    triggerCondition: (event) => event.type === 'APPROVAL_REQUESTED' && (event.payload.approvalType as string) === 'loan_exceeds_limit',
    sourceState: 'ACTIVE',
    targetState: 'PENDING_APPROVAL',
    sourceRole: 'Branch Manager',
    targetRole: 'District Manager',
    requiredApprovals: ['District Manager'],
    autoAssign: false,
    slaMinutes: 48,
  },
  {
    triggerCondition: (event) => event.type === 'ISSUE_DETECTED' && (event.payload.riskLevel as string) === 'high',
    sourceState: 'ACTIVE',
    targetState: 'ESCALATED',
    sourceRole: 'Risk Manager',
    targetRole: 'Provincial Manager',
    requiredApprovals: ['Provincial Manager'],
    autoAssign: true,
    slaMinutes: 4,
  },
  {
    triggerCondition: (event) => event.type === 'DEADLINE_EXCEEDED',
    sourceState: 'PENDING_APPROVAL',
    targetState: 'ESCALATED',
    sourceRole: 'District Manager',
    targetRole: 'Provincial Manager',
    requiredApprovals: [],
    autoAssign: true,
    slaMinutes: 0,
  },
];

// ============================================
// ESCALATION RULES
// ============================================

export const ESCALATION_RULES: EscalationRule[] = [
  {
    id: 'sla_exceeded',
    condition: (instance) => {
      if (!instance.deadline) return false;
      return new Date() > instance.deadline && instance.currentState !== 'RESOLVED';
    },
    escalationPath: ['District Manager', 'Provincial Manager', 'Manager Administration'],
    priority: 'high',
    autoResolve: false,
    description: 'Auto-escalate when SLA deadline is exceeded',
  },
  {
    id: 'repeated_issue',
    condition: (instance) => {
      const similarCount = instance.history.filter(
        e => e.type === 'ISSUE_DETECTED' && 
             e.metadata?.correlationId === instance.metadata?.relatedIssueId
      ).length;
      return similarCount >= 3;
    },
    escalationPath: ['Provincial Manager', 'Manager Administration'],
    priority: 'critical',
    autoResolve: false,
    description: 'Escalate when same issue repeats 3+ times',
  },
  {
    id: 'high_risk_pattern',
    condition: (instance) => {
      return (instance.metadata?.riskLevel as string) === 'high' && 
             instance.currentState === 'ESCALATED';
    },
    escalationPath: ['Provincial Manager', 'Manager Administration'],
    priority: 'critical',
    autoResolve: false,
    description: 'Escalate high-risk patterns to executive',
  },
  {
    id: 'collection_stalled',
    condition: (instance) => {
      return instance.type === 'collection' && 
             instance.currentState === 'COLLECTIONS' &&
             instance.history.filter(e => e.type === 'DEADLINE_EXCEEDED').length >= 2;
    },
    escalationPath: ['Recoveries Coordinator', 'Risk Manager', 'Provincial Manager'],
    priority: 'high',
    autoResolve: true,
    description: 'Auto-escalate stalled collections after 2 missed deadlines',
  },
  {
    id: 'approval_timeout',
    condition: (instance) => {
      return instance.currentState === 'PENDING_APPROVAL' &&
             instance.history.some(
               e => e.type === 'APPROVAL_REQUESTED' && 
                    new Date().getTime() - new Date(e.timestamp).getTime() > 72 * 60 * 60 * 1000
             );
    },
    escalationPath: ['District Manager', 'Provincial Manager'],
    priority: 'medium',
    autoResolve: false,
    description: 'Escalate pending approvals after 72 hours',
  },
];

// ============================================
// WORKFLOW ENGINE (Singleton)
// ============================================

class WorkflowEngine {
  private listeners: Map<EventType, ((event: WorkflowEvent) => void)[]> = new Map();
  private workflowInstances: Map<string, WorkflowInstance> = new Map();
  private eventHistory: WorkflowEvent[] = [];

  private generateId(): string {
    return 'wf_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  subscribe(eventType: EventType, callback: (event: WorkflowEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
    
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
      }
    };
  }

  emit(event: WorkflowEvent): void {
    this.eventHistory.unshift(event);
    if (this.eventHistory.length > 1000) this.eventHistory.pop();

    // Store event in workflow history
    if (event.metadata?.correlationId) {
      const instance = this.workflowInstances.get(event.metadata.correlationId);
      if (instance) {
        instance.history.push(event);
        instance.updatedAt = new Date();
      }
    }

    // Notify listeners
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      callbacks.forEach(cb => cb(event));
    }

    // Check handoff conditions
    this.checkHandoffConditions(event);
  }

  private checkHandoffConditions(event: WorkflowEvent): void {
    for (const handoff of HANDOFF_CONFIGS) {
      if (handoff.triggerCondition(event)) {
        const correlationId = event.metadata?.correlationId || this.generateId();
        this.createHandoffWorkflow(event, handoff, correlationId);
      }
    }
  }

  private createHandoffWorkflow(event: WorkflowEvent, handoff: HandoffConfig, correlationId: string): void {
    const newWorkflow: WorkflowInstance = {
      id: this.generateId(),
      type: 'HANDFOFF',
      currentState: handoff.targetState,
      assignedRole: handoff.targetRole,
      createdAt: new Date(),
      updatedAt: new Date(),
      deadline: new Date(Date.now() + handoff.slaMinutes * 60 * 1000),
      metadata: {
        sourceWorkflowId: correlationId,
        sourceRole: handoff.sourceRole,
        handoffType: handoff.sourceState + '_TO_' + handoff.targetState,
        autoAssigned: handoff.autoAssign,
      },
      history: [event],
    };

    this.workflowInstances.set(newWorkflow.id, newWorkflow);

    // Emit handoff initiated event
    this.emit({
      id: this.generateId(),
      type: 'HANDFOFF_INITIATED',
      timestamp: new Date(),
      sourceRole: handoff.sourceRole,
      targetRole: handoff.targetRole,
      payload: {
        workflowId: newWorkflow.id,
        handoffType: newWorkflow.metadata.handoffType as string,
      },
      metadata: { correlationId: newWorkflow.id, priority: 'high' },
    });
  }

  createWorkflow(type: string, initialState: WorkflowState, role: string, metadata: Record<string, unknown> = {}): WorkflowInstance {
    const workflow: WorkflowInstance = {
      id: this.generateId(),
      type,
      currentState: initialState,
      assignedRole: role,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata,
      history: [],
    };

    this.workflowInstances.set(workflow.id, workflow);
    return workflow;
  }

  getWorkflow(id: string): WorkflowInstance | undefined {
    return this.workflowInstances.get(id);
  }

  updateWorkflowState(id: string, newState: WorkflowState, event: WorkflowEvent): void {
    const workflow = this.workflowInstances.get(id);
    if (workflow) {
      workflow.currentState = newState;
      workflow.updatedAt = new Date();
      workflow.history.push(event);
    }
  }

  getWorkflowsByRole(role: string): WorkflowInstance[] {
    return Array.from(this.workflowInstances.values())
      .filter(w => w.assignedRole === role);
  }

  getAllWorkflows(): WorkflowInstance[] {
    return Array.from(this.workflowInstances.values());
  }

  getEventHistory(): WorkflowEvent[] {
    return this.eventHistory;
  }
}

// Singleton instance
export const workflowEngine = new WorkflowEngine();

// ============================================
// USE WORKFLOW ENGINE HOOK
// ============================================

export function useWorkflowEngine() {
  const { position: currentPosition, isLoading } = useUserPosition();
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [escalations, setEscalations] = useState<WorkflowInstance[]>([]);

  // Initialize workflows based on current position
  useEffect(() => {
    if (!isLoading && currentPosition) {
      const roleWorkflows = workflowEngine.getWorkflowsByRole(currentPosition);
      setWorkflows(roleWorkflows);

      const activeEscalations = workflowEngine.getAllWorkflows()
        .filter(w => w.currentState === 'ESCALATED');
      setEscalations(activeEscalations);
    }
  }, [currentPosition, isLoading]);

  // Subscribe to events
  useEffect(() => {
    const eventTypes: EventType[] = [
      'WORKFLOW_TRANSITION',
      'ESCALATION_TRIGGERED',
      'HANDFOFF_INITIATED',
      'HANDFOFF_COMPLETED',
    ];

    const unsubscribes = eventTypes.map(eventType => 
      workflowEngine.subscribe(eventType, (event) => {
        setEvents(prev => [event, ...prev].slice(0, 100));
        
        if (currentPosition) {
          const roleWorkflows = workflowEngine.getWorkflowsByRole(currentPosition);
          setWorkflows(roleWorkflows);
        }
      })
    );

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [currentPosition]);

  const createWorkflow = useCallback((type: string, initialState: WorkflowState, metadata: Record<string, unknown> = {}): WorkflowInstance => {
    const workflow = workflowEngine.createWorkflow(type, initialState, currentPosition || 'Branch Manager', metadata);
    
    workflowEngine.emit({
      id: workflow.id,
      type: 'WORKFLOW_TRANSITION',
      timestamp: new Date(),
      sourceRole: currentPosition || 'Branch Manager',
      payload: { workflowId: workflow.id, type, initialState },
      metadata: { correlationId: workflow.id },
    });

    return workflow;
  }, [currentPosition]);

  const transitionState = useCallback((workflowId: string, newState: WorkflowState, payload: Record<string, unknown> = {}): void => {
    const event: WorkflowEvent = {
      id: workflowEngine['generateId']() || 'evt_' + Date.now().toString(36),
      type: 'WORKFLOW_TRANSITION',
      timestamp: new Date(),
      sourceRole: currentPosition || 'Branch Manager',
      payload,
      metadata: { correlationId: workflowId },
    };

    workflowEngine.updateWorkflowState(workflowId, newState, event);
    workflowEngine.emit(event);

    // Check escalation rules after transition
    const workflow = workflowEngine.getWorkflow(workflowId);
    if (workflow) {
      for (const rule of ESCALATION_RULES) {
        if (rule.condition(workflow)) {
          const escalationEvent: WorkflowEvent = {
            id: 'esc_' + Date.now().toString(36),
            type: 'ESCALATION_TRIGGERED',
            timestamp: new Date(),
            sourceRole: currentPosition || 'Branch Manager',
            targetRole: rule.escalationPath[0],
            payload: { 
              workflowId, 
              ruleId: rule.id, 
              ruleDescription: rule.description,
              escalationPath: rule.escalationPath 
            },
            metadata: { 
              correlationId: workflowId, 
              priority: rule.priority,
            },
          };
          
          workflow.currentState = 'ESCALATED';
          workflow.history.push(escalationEvent);
          workflowEngine.emit(escalationEvent);
          break;
        }
      }
    }
  }, [currentPosition]);

  const emitEvent = useCallback((type: EventType, payload: Record<string, unknown>, options?: { priority?: 'low' | 'medium' | 'high' | 'critical', targetRole?: string }): void => {
    const event: WorkflowEvent = {
      id: 'evt_' + Date.now().toString(36),
      type,
      timestamp: new Date(),
      sourceRole: currentPosition || 'Branch Manager',
      targetRole: options?.targetRole,
      payload,
      metadata: { 
        correlationId: (payload.workflowId as string) || (payload.correlationId as string),
        priority: options?.priority || 'medium',
      },
    };

    workflowEngine.emit(event);
  }, [currentPosition]);

  const getDownstreamDependencies = useCallback((role: string): RoleDependency[] => {
    return ROLE_DEPENDENCIES.filter(d => d.upstreamRole === role);
  }, []);

  const getUpstreamDependencies = useCallback((role: string): RoleDependency[] => {
    return ROLE_DEPENDENCIES.filter(d => d.downstreamRole === role);
  }, []);

  return {
    currentPosition,
    isLoading,
    workflows,
    events,
    escalations,
    createWorkflow,
    transitionState,
    emitEvent,
    getDownstreamDependencies,
    getUpstreamDependencies,
    ROLE_DEPENDENCIES,
    ESCALATION_RULES,
    HANDOFF_CONFIGS,
    workflowEngine,
  };
}

export default useWorkflowEngine;
