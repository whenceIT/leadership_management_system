'use client';

import { PriorityAction } from '@/services/PriorityActionService';
import { LoanData } from '@/hooks/useLoanUpdates';
import { getOfficeNameById } from '@/hooks/useOffice';
import { getPositionNameByIdStatic } from '@/hooks/useUserPosition';

/**
 * Position ID constants for responsibility workflow
 * Based on AVAILABLE_POSITIONS from useUserPosition hook
 */
export const POSITION_IDS = {
  GOM: 1,                    // General Operations Manager
  PROVINCIAL_MANAGER: 2,     // Provincial Manager
  DISTRICT_REGIONAL: 3,      // District Regional Manager
  DISTRICT_MANAGER: 4,       // District Manager
  BRANCH_MANAGER: 5,         // Branch Manager
  IT_MANAGER: 6,             // IT Manager
  RISK_MANAGER: 7,           // Risk Manager
  MANAGEMENT_ACCOUNTANT: 8,  // Management Accountant
  MOTOR_VEHICLES_MANAGER: 9, // Motor Vehicles Manager
  PAYROLL_LOANS_MANAGER: 10, // Payroll Loans Manager
  POLICY_TRAINING: 11,       // Policy & Training Manager
  MANAGER_ADMIN: 12,         // Manager Administration
  RD_COORDINATOR: 13,        // R&D Coordinator
  RECOVERIES_COORDINATOR: 14,// Recoveries Coordinator
  IT_COORDINATOR: 15,        // IT Coordinator
  GOA: 16,                   // General Operations Administrator
  POA: 17,                   // Performance Operations Administrator
  MARKETING_MANAGER: 18,     // Creative Artwork & Marketing Representative Manager
  ADMINISTRATION: 19,        // Administration
  SUPER_SEER: 20,            // Super Seer (has access to all)
  LOAN_CONSULTANT: 21,       // Loan Consultant
} as const;

/**
 * Loan amount thresholds (in local currency)
 */
export const LOAN_THRESHOLDS = {
  STANDARD: 10000,       // Standard loan
  MODERATE: 50000,       // Requires BM attention
  HIGH: 100000,          // Requires senior management
  CRITICAL: 250000,      // Requires GOM/Provincial approval
  ESCALATION: 500000,    // Requires executive approval
} as const;

/**
 * Transaction types from WebSocket events
 * These are payment/transaction types, not new loan types
 */
export const TRANSACTION_TYPES = {
  PART_PAYMENT: 'part_payment',
  FULL_PAYMENT: 'full_payment',
  RELOAN_PAYMENT: 'reloan_payment',
  RELOAN: 'reloan',
  INTEREST_WAIVER: 'interest_waiver',
  NEW_LOAN: 'new_loan',
  DISBURSEMENT: 'disbursement',
} as const;

/**
 * Check if the transaction type is a payment (not a new loan)
 */
export function isPaymentTransaction(type: string): boolean {
  const paymentTypes = [
    TRANSACTION_TYPES.PART_PAYMENT,
    TRANSACTION_TYPES.FULL_PAYMENT,
    TRANSACTION_TYPES.RELOAN_PAYMENT,
    TRANSACTION_TYPES.INTEREST_WAIVER,
  ];
  return paymentTypes.includes(type.toLowerCase() as any);
}

/**
 * Context for generating position-specific actions
 */
export interface LoanActionContext {
  currentPositionId: number;
  loanCount: number;
  isStaleLoan?: boolean;
  daysPending?: number;
}

/**
 * Parsed loan data for action generation
 */
export interface ParsedLoanData {
  amount: number;
  borrowerName: string;
  loanNumber: string;
  status: string;
  createdBy: string;
  officeId: number;
  officeName: string;
  loanType: string;
  daysPending?: number;
}

/**
 * Parse raw loan data into a standardized format
 * Handles both flat loan objects and nested WebSocket event structures
 * 
 * WebSocket Event Structure:
 * {
 *   created_by: "Mutinta Twambo",
 *   office_id: 1,
 *   client: "Gideon Mwanza",
 *   amount: "2200",
 *   type: "part_payment",
 *   loan: { id, principal, status, loan_product: { name }, ... },
 *   transaction: { id, transaction_type, credit, ... }
 * }
 */
export function parseLoanData(loan: LoanData, now: Date = new Date()): ParsedLoanData {
  // ============================================================
  // AMOUNT PARSING
  // Priority: loan.amount > loan.loan.principal > loan.transaction.credit
  // ============================================================
  let amount = 0;
  
  // First try root-level amount (from WebSocket event)
  if (typeof loan.amount === 'string') {
    amount = parseFloat(loan.amount) || 0;
  } else if (typeof loan.amount === 'number') {
    amount = loan.amount;
  }
  
  // If no amount at root, try nested loan.principal
  if (amount === 0 && loan.loan) {
    const principal = loan.loan.principal;
    if (typeof principal === 'string') {
      amount = parseFloat(principal) || 0;
    } else if (typeof principal === 'number') {
      amount = principal;
    }
  }
  
  // If still no amount, try nested transaction.credit (for repayments)
  if (amount === 0 && loan.transaction) {
    const credit = loan.transaction.credit;
    if (typeof credit === 'string') {
      amount = parseFloat(credit) || 0;
    } else if (typeof credit === 'number') {
      amount = credit;
    }
  }
  
  // ============================================================
  // BORROWER NAME PARSING
  // Priority: loan.client > loan.borrower_name
  // ============================================================
  const borrowerName = loan.client || loan.borrower_name || 'Unknown Client';
  
  // ============================================================
  // LOAN NUMBER PARSING
  // Priority: loan.loan_number > loan.loan.id > loan.id
  // ============================================================
  let loanNumber = loan.loan_number || '';
  if (!loanNumber && loan.loan?.id) {
    loanNumber = `LOAN-${loan.loan.id}`;
  } else if (!loanNumber && loan.id) {
    loanNumber = `LOAN-${loan.id}`;
  }
  
  // ============================================================
  // STATUS PARSING
  // Priority: loan.status > loan.loan.status > 'pending'
  // ============================================================
  let status = loan.status || loan.loan?.status || 'pending';
  status = status.toLowerCase();
  
  // ============================================================
  // CREATED BY PARSING
  // Priority: loan.created_by > 'Unknown'
  // ============================================================
  const createdBy = loan.created_by || 'Unknown';
  
  // ============================================================
  // OFFICE ID PARSING
  // Priority: loan.office_id > loan.loan.office_id
  // ============================================================
  const officeId = loan.office_id || loan.loan?.office_id || 0;
  
  // ============================================================
  // LOAN TYPE PARSING
  // Priority: loan.type > loan.loan.loan_product.name > 'New Loan'
  // ============================================================
  let loanType = loan.type || '';
  
  // If type is empty, try to get from loan product
  if (!loanType && loan.loan?.loan_product?.name) {
    loanType = loan.loan.loan_product.name;
  }
  
  // If type is empty, try transaction type
  if (!loanType && loan.transaction?.transaction_type) {
    loanType = loan.transaction.transaction_type;
  }
  
  // Default to 'New Loan' if still empty
  if (!loanType) {
    loanType = 'New Loan';
  }

  // ============================================================
  // OFFICE NAME
  // ============================================================
  const officeName = officeId > 0 ? (getOfficeNameById(officeId) || `Office #${officeId}`) : 'Main Office';

  // ============================================================
  // DAYS PENDING CALCULATION
  // ============================================================
  let daysPending = 0;
  const createdAtStr = loan.created_at || loan.loan?.created_at;
  if (createdAtStr) {
    const createdAt = new Date(createdAtStr);
    daysPending = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    amount,
    borrowerName,
    loanNumber,
    status,
    createdBy,
    officeId,
    officeName,
    loanType,
    daysPending,
  };
}

/**
 * Check if current position is in a list of allowed positions
 */
export function isPositionAllowed(currentPositionId: number, allowedPositions: number[]): boolean {
  // Super Seer has access to everything
  if (currentPositionId === POSITION_IDS.SUPER_SEER) {
    return true;
  }
  return allowedPositions.includes(currentPositionId);
}

/**
 * Format label for display (converts snake_case to Title Case)
 * Example: "under_review" -> "Under Review", "NEW_LOAN" -> "New Loan"
 */
export const formatLabel = (value: string): string => {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Generate position-specific actions for a new loan or payment transaction
 * This is the centralized function used by both processNewLoan and checkStaleLoans
 * 
 * @param loan - The loan data to process
 * @param context - Context including current position ID and loan count
 * @returns Array of priority actions generated for this loan
 */
export function generatePositionSpecificActions(
  loan: LoanData,
  context: LoanActionContext
): PriorityAction[] {
  const actions: PriorityAction[] = [];
  const { currentPositionId, loanCount, isStaleLoan = false } = context;
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  // Parse loan data
  const parsedLoan = parseLoanData(loan, now);
  const { amount, borrowerName, loanNumber, status, createdBy, officeName, loanType, daysPending } = parsedLoan;

  // ============================================================
  // CHECK IF THIS IS A PAYMENT TRANSACTION
  // Payment transactions (part_payment, full_payment, etc.) get different actions
  // ============================================================
  const isPayment = isPaymentTransaction(loanType);
  const formattedLoanType = formatLabel(loanType);

  // ============================================================
  // PAYMENT TRANSACTION ACTIONS
  // ============================================================
  if (isPayment && !isStaleLoan) {
    // ---- BRANCH MANAGER - Payment Actions ----
    if (isPositionAllowed(currentPositionId, [POSITION_IDS.BRANCH_MANAGER])) {
      if (borrowerName && borrowerName !== 'Unknown Client') {
        actions.push({
          action: `💳 ${formattedLoanType} from ${borrowerName}`,
          due: `Payment of ${amount.toLocaleString()} received • Processed by ${createdBy} • ${timeStr}`,
          urgent: false,
          positionSpecific: true,
          targetPositionIds: [POSITION_IDS.BRANCH_MANAGER],
        });
      }
    }

    // ---- MANAGEMENT ACCOUNTANT - Payment Actions ----
    if (isPositionAllowed(currentPositionId, [POSITION_IDS.MANAGEMENT_ACCOUNTANT])) {
      actions.push({
        action: `💵 Payment Received`,
        due: `${formattedLoanType} of ${amount.toLocaleString()} from ${borrowerName} at ${officeName}.`,
        urgent: false,
        positionSpecific: true,
        targetPositionIds: [POSITION_IDS.MANAGEMENT_ACCOUNTANT],
      });
    }

    // ---- GOA & POA - Payment Actions ----
    if (isPositionAllowed(currentPositionId, [POSITION_IDS.GOA, POSITION_IDS.POA])) {
      actions.push({
        action: `⚙️ Payment Processed`,
        due: `${formattedLoanType} of ${amount.toLocaleString()} at ${officeName}.`,
        urgent: false,
        positionSpecific: true,
        targetPositionIds: [POSITION_IDS.GOA, POSITION_IDS.POA],
      });
    }

    // ---- SUPER SEER - Payment Actions ----
    if (currentPositionId === POSITION_IDS.SUPER_SEER) {
      actions.push({
        action: `👁️ Payment Transaction`,
        due: `${formattedLoanType} of ${amount.toLocaleString()} from ${borrowerName} at ${officeName}.`,
        urgent: false,
        positionSpecific: true,
        targetPositionIds: [POSITION_IDS.SUPER_SEER],
      });
    }

    // Return early for payment transactions - no need to generate loan actions
    return actions;
  }

  // ============================================================
  // RELOAN ACTIONS (Special handling)
  // ============================================================
  if (loanType.toLowerCase() === TRANSACTION_TYPES.RELOAN && !isStaleLoan) {
    // ---- BRANCH MANAGER - Reloan Actions ----
    if (isPositionAllowed(currentPositionId, [POSITION_IDS.BRANCH_MANAGER])) {
      if (borrowerName && borrowerName !== 'Unknown Client') {
        actions.push({
          action: `🔄 Reloan Application from ${borrowerName}`,
          due: `Amount: ${amount.toLocaleString()} • Submitted by ${createdBy} • ${timeStr}`,
          urgent: amount >= LOAN_THRESHOLDS.MODERATE,
          positionSpecific: true,
          targetPositionIds: [POSITION_IDS.BRANCH_MANAGER],
        });
      }
    }

    // ---- LOAN CONSULTANT - Reloan Actions ----
    if (isPositionAllowed(currentPositionId, [POSITION_IDS.LOAN_CONSULTANT])) {
      actions.push({
        action: `📝 Reloan to Process`,
        due: `${borrowerName}'s reloan application of ${amount.toLocaleString()} ready for processing.`,
        urgent: false,
        positionSpecific: true,
        targetPositionIds: [POSITION_IDS.LOAN_CONSULTANT],
      });
    }

    // Return early for reloan transactions
    return actions;
  }

  // ============================================================
  // RESPONSIBILITY WORKFLOW - Position-Specific Actions (New Loans)
  // ============================================================

  // ---- BRANCH MANAGER (ID: 5) ----
  // Responsibilities: Review and approve loans, manage branch operations
  if (isPositionAllowed(currentPositionId, [POSITION_IDS.BRANCH_MANAGER])) {
    if (isStaleLoan) {
      // Stale loan actions for Branch Manager
      actions.push({
        action: `⏰ Stale Loan Alert: ${borrowerName}`,
        due: `${loanType} of ${amount.toLocaleString()} pending for ${daysPending} days at ${officeName}`,
        urgent: (daysPending || 0) >= 7 || amount >= LOAN_THRESHOLDS.MODERATE,
        positionSpecific: true,
        targetPositionIds: [POSITION_IDS.BRANCH_MANAGER],
      });

      if ((daysPending || 0) >= 5) {
        actions.push({
          action: `🚨 Urgent: ${daysPending}-day pending loan`,
          due: `${borrowerName}'s ${loanType} requires immediate attention. Amount: ${amount.toLocaleString()}`,
          urgent: true,
          positionSpecific: true,
          targetPositionIds: [POSITION_IDS.BRANCH_MANAGER],
        });
      }
    } else {
      // New loan actions for Branch Manager
      if (borrowerName && borrowerName !== 'Unknown Client') {
        const formattedStatus = formatLabel(status);

        actions.push({
          action: `💰 ${formattedLoanType} received from ${borrowerName}`,
          due: `Amount: ${amount.toLocaleString()} • Submitted by ${createdBy} • ${timeStr}. This application is ${formattedStatus}.`,
          urgent: amount >= LOAN_THRESHOLDS.MODERATE,
          positionSpecific: true,
          targetPositionIds: [POSITION_IDS.BRANCH_MANAGER],
        });
      }

      // Review and approval requirement for Branch Manager
      if (amount >= LOAN_THRESHOLDS.MODERATE) {
        actions.push({
          action: `✅ Review & Approval Required`,
          due: `${amount.toLocaleString()} loan from ${borrowerName} needs your review and approval.`,
          urgent: true,
          positionSpecific: true,
          targetPositionIds: [POSITION_IDS.BRANCH_MANAGER],
        });
      }
    }
  }

  // ---- RISK MANAGER (ID: 7) ----
  // Responsibilities: Risk assessment, high-value loan alerts, collateral verification
  if (isPositionAllowed(currentPositionId, [POSITION_IDS.RISK_MANAGER])) {
    if (isStaleLoan) {
      if (amount >= LOAN_THRESHOLDS.HIGH && (daysPending || 0) >= 3) {
        actions.push({
          action: `⚠️ Risk: High-value stale loan`,
          due: `${amount.toLocaleString()} loan from ${borrowerName} pending ${daysPending} days - risk assessment needed`,
          urgent: true,
          positionSpecific: true,
          targetPositionIds: [POSITION_IDS.RISK_MANAGER],
        });
      }
    } else {
      if (amount >= LOAN_THRESHOLDS.HIGH) {
        actions.push({
          action: `🚨 Risk Assessment Required`,
          due: `High-value loan (${amount.toLocaleString()}) from ${borrowerName} requires risk evaluation.`,
          urgent: true,
          positionSpecific: true,
          targetPositionIds: [POSITION_IDS.RISK_MANAGER],
        });
      }

      if (amount >= LOAN_THRESHOLDS.CRITICAL) {
        actions.push({
          action: `⚠️ CRITICAL: Collateral Verification Needed`,
          due: `Loan of ${amount.toLocaleString()} exceeds threshold. Verify collateral and credit history.`,
          urgent: true,
          positionSpecific: true,
          targetPositionIds: [POSITION_IDS.RISK_MANAGER],
        });
      }
    }
  }

  // ---- DISTRICT MANAGER (ID: 4) ----
  // Responsibilities: Oversee multiple branches, approve escalated loans
  if (isPositionAllowed(currentPositionId, [POSITION_IDS.DISTRICT_MANAGER])) {
    if (isStaleLoan) {
      if (amount >= LOAN_THRESHOLDS.HIGH && (daysPending || 0) >= 5) {
        actions.push({
          action: `📍 District: Escalated stale loan`,
          due: `${amount.toLocaleString()} from ${officeName} pending ${daysPending} days - district review needed`,
          urgent: true,
          positionSpecific: true,
          targetPositionIds: [POSITION_IDS.DISTRICT_MANAGER],
        });
      }
    } else {
      if (amount >= LOAN_THRESHOLDS.HIGH) {
        actions.push({
          action: `📍 District-Level Approval Needed`,
          due: `${amount.toLocaleString()} loan from ${officeName} requires district manager approval.`,
          urgent: true,
          positionSpecific: true,
          targetPositionIds: [POSITION_IDS.DISTRICT_MANAGER],
        });
      }

      actions.push({
        action: `🏢 New application from ${officeName}`,
        due: `Track ${loanType.toLowerCase()} submissions for this branch today.`,
        urgent: false,
        positionSpecific: true,
        targetPositionIds: [POSITION_IDS.DISTRICT_MANAGER],
      });
    }
  }

  // ---- PROVINCIAL MANAGER (ID: 2) ----
  // Responsibilities: Regional oversight, strategic decisions
  if (isPositionAllowed(currentPositionId, [POSITION_IDS.PROVINCIAL_MANAGER])) {
    if (isStaleLoan) {
      if (amount >= LOAN_THRESHOLDS.CRITICAL && (daysPending || 0) >= 7) {
        actions.push({
          action: `🌐 Provincial: Critical stale loan`,
          due: `${amount.toLocaleString()} from ${officeName} pending ${daysPending} days - provincial escalation`,
          urgent: true,
          positionSpecific: true,
          targetPositionIds: [POSITION_IDS.PROVINCIAL_MANAGER],
        });
      }
    } else {
      if (amount >= LOAN_THRESHOLDS.CRITICAL) {
        actions.push({
          action: `🌐 Provincial Escalation Alert`,
          due: `Critical loan (${amount.toLocaleString()}) from ${officeName} requires provincial-level review.`,
          urgent: true,
          positionSpecific: true,
          targetPositionIds: [POSITION_IDS.PROVINCIAL_MANAGER],
        });
      }
    }
  }

  // ---- GOM (ID: 1) ----
  // Responsibilities: Executive oversight, final approval for large loans
  if (isPositionAllowed(currentPositionId, [POSITION_IDS.GOM])) {
    if (isStaleLoan) {
      if (amount >= LOAN_THRESHOLDS.ESCALATION && (daysPending || 0) >= 7) {
        actions.push({
          action: `🔴 GOM: Executive stale loan alert`,
          due: `${amount.toLocaleString()} from ${borrowerName} pending ${daysPending} days - executive review`,
          urgent: true,
          positionSpecific: true,
          targetPositionIds: [POSITION_IDS.GOM],
        });
      }
      
      actions.push({
        action: `📊 Stale Loan Summary`,
        due: `${borrowerName}: ${amount.toLocaleString()} (${daysPending} days pending)`,
        urgent: false,
        positionSpecific: true,
        targetPositionIds: [POSITION_IDS.GOM],
      });
    } else {
      if (amount >= LOAN_THRESHOLDS.ESCALATION) {
        actions.push({
          action: `🔴 EXECUTIVE APPROVAL REQUIRED`,
          due: `Loan of ${amount.toLocaleString()} for ${borrowerName} requires executive approval.`,
          urgent: true,
          positionSpecific: true,
          targetPositionIds: [POSITION_IDS.GOM],
        });
      }

      actions.push({
        action: `📊 Loan Activity Summary`,
        due: `New ${loanType} of ${amount.toLocaleString()} from ${officeName}. Total today: ${loanCount}`,
        urgent: false,
        positionSpecific: true,
        targetPositionIds: [POSITION_IDS.GOM],
      });
    }
  }

  // ---- MANAGEMENT ACCOUNTANT (ID: 8) ----
  // Responsibilities: Financial tracking, disbursement monitoring
  if (isPositionAllowed(currentPositionId, [POSITION_IDS.MANAGEMENT_ACCOUNTANT])) {
    if (isStaleLoan) {
      actions.push({
        action: `💵 Stale Disbursement Alert`,
        due: `${borrowerName}'s ${loanType} of ${amount.toLocaleString()} pending ${daysPending} days`,
        urgent: (daysPending || 0) >= 5,
        positionSpecific: true,
        targetPositionIds: [POSITION_IDS.MANAGEMENT_ACCOUNTANT],
      });
    } else {
      actions.push({
        action: `💵 Disbursement Tracking`,
        due: `${loanType} of ${amount.toLocaleString()} for ${borrowerName} pending disbursement.`,
        urgent: false,
        positionSpecific: true,
        targetPositionIds: [POSITION_IDS.MANAGEMENT_ACCOUNTANT],
      });

      if (amount >= LOAN_THRESHOLDS.HIGH) {
        actions.push({
          action: `📈 Large Disbursement Alert`,
          due: `Prepare funds for ${amount.toLocaleString()} loan. Verify account details.`,
          urgent: true,
          positionSpecific: true,
          targetPositionIds: [POSITION_IDS.MANAGEMENT_ACCOUNTANT],
        });
      }
    }
  }

  // ---- PAYROLL LOANS MANAGER (ID: 10) ----
  // Responsibilities: Payroll-deducted loans, employee loans
  if (isPositionAllowed(currentPositionId, [POSITION_IDS.PAYROLL_LOANS_MANAGER])) {
    if (!isStaleLoan && (loanType.toLowerCase().includes('payroll') || loanType.toLowerCase().includes('employee'))) {
      actions.push({
        action: `👤 Payroll Loan Application`,
        due: `${borrowerName} applied for ${amount.toLocaleString()} payroll-deducted loan.`,
        urgent: false,
        positionSpecific: true,
        targetPositionIds: [POSITION_IDS.PAYROLL_LOANS_MANAGER],
      });
    }
  }

  // ---- RECOVERIES COORDINATOR (ID: 14) ----
  // Responsibilities: Loan recovery, default management
  if (isPositionAllowed(currentPositionId, [POSITION_IDS.RECOVERIES_COORDINATOR])) {
    if (isStaleLoan) {
      if ((daysPending || 0) >= 10) {
        actions.push({
          action: `🔄 Recovery Watch: Long pending loan`,
          due: `${borrowerName}'s ${amount.toLocaleString()} loan pending ${daysPending} days - monitor for recovery`,
          urgent: (daysPending || 0) >= 14,
          positionSpecific: true,
          targetPositionIds: [POSITION_IDS.RECOVERIES_COORDINATOR],
        });
      }
    } else {
      if (status === 'default' || status === 'overdue' || status === 'recovery') {
        actions.push({
          action: `🔄 Recovery Case Alert`,
          due: `${borrowerName}'s loan requires recovery action. Amount: ${amount.toLocaleString()}`,
          urgent: true,
          positionSpecific: true,
          targetPositionIds: [POSITION_IDS.RECOVERIES_COORDINATOR],
        });
      }
    }
  }

  // ---- LOAN CONSULTANT (ID: 21) ----
  // Responsibilities: Initial loan processing, customer service
  if (isPositionAllowed(currentPositionId, [POSITION_IDS.LOAN_CONSULTANT])) {
    if (isStaleLoan) {
      actions.push({
        action: `📞 Follow-up Required`,
        due: `${borrowerName}'s ${loanType} pending ${daysPending} days - contact client for status`,
        urgent: false,
        positionSpecific: true,
        targetPositionIds: [POSITION_IDS.LOAN_CONSULTANT],
      });
    } else {
      actions.push({
        action: `📝 New Loan to Process`,
        due: `${borrowerName}'s ${loanType} application ready for initial processing.`,
        urgent: false,
        positionSpecific: true,
        targetPositionIds: [POSITION_IDS.LOAN_CONSULTANT],
      });

      if (status === 'pending') {
        actions.push({
          action: `📞 Application Follow-up`,
          due: `Contact ${borrowerName} to complete documentation for ${amount.toLocaleString()} loan.`,
          urgent: false,
          positionSpecific: true,
          targetPositionIds: [POSITION_IDS.LOAN_CONSULTANT],
        });
      }
    }
  }

  // ---- GOA (ID: 16) & POA (ID: 17) ----
  // Responsibilities: Operations administration, performance tracking
  if (isPositionAllowed(currentPositionId, [POSITION_IDS.GOA, POSITION_IDS.POA])) {
    if (isStaleLoan) {
      actions.push({
        action: `⚙️ Operations: Stale loan detected`,
        due: `${loanType} at ${officeName} pending ${daysPending} days - check processing status`,
        urgent: false,
        positionSpecific: true,
        targetPositionIds: [POSITION_IDS.GOA, POSITION_IDS.POA],
      });
    } else {
      actions.push({
        action: `⚙️ Operations Update`,
        due: `New ${loanType} processed at ${officeName}. Amount: ${amount.toLocaleString()}`,
        urgent: false,
        positionSpecific: true,
        targetPositionIds: [POSITION_IDS.GOA, POSITION_IDS.POA],
      });
    }
  }

  // ---- SUPER SEER (ID: 20) ----
  // Has access to all actions - receives comprehensive summary
  if (currentPositionId === POSITION_IDS.SUPER_SEER) {
    if (isStaleLoan) {
      actions.push({
        action: `👁️ Comprehensive Stale Alert`,
        due: `${borrowerName}: ${amount.toLocaleString()} at ${officeName} - ${daysPending} days pending - Status: ${status}`,
        urgent: (daysPending || 0) >= 7 || amount >= LOAN_THRESHOLDS.HIGH,
        positionSpecific: true,
        targetPositionIds: [POSITION_IDS.SUPER_SEER],
      });
    } else {
      actions.push({
        action: `👁️ Comprehensive Loan Alert`,
        due: `${loanType} of ${amount.toLocaleString()} from ${borrowerName} at ${officeName}. Status: ${status}`,
        urgent: amount >= LOAN_THRESHOLDS.HIGH,
        positionSpecific: true,
        targetPositionIds: [POSITION_IDS.SUPER_SEER],
      });
    }
  }

  // ---- COMMON ACTIONS FOR ALL POSITIONS (New Loans Only) ----
  if (!isStaleLoan && loanCount === 1) {
    // First loan of the day - motivational message
    actions.push({
      action: `🌅 Good start! First loan of the day received`,
      due: "Review all pending applications to maintain turnaround time targets.",
      urgent: false,
      positionSpecific: false,
    });
  }

  return actions;
}

/**
 * Generate a summary action for multiple stale loans
 */
export function generateStaleLoanSummaryAction(
  staleLoans: LoanData[],
  timeStr: string
): PriorityAction {
  const now = new Date();
  
  const totalStaleAmount = staleLoans.reduce((sum, loan) => {
    // Use parseLoanData to get the amount (handles nested structures)
    const parsed = parseLoanData(loan, now);
    return sum + parsed.amount;
  }, 0);
  
  const maxDaysPending = Math.max(...staleLoans.map(loan => {
    const parsed = parseLoanData(loan, now);
    return parsed.daysPending || 0;
  }));

  return {
    action: `⏰ ${staleLoans.length} stale loans detected`,
    due: `Total: ${totalStaleAmount.toLocaleString()} • Longest pending: ${maxDaysPending} days • Fetched at ${timeStr}`,
    urgent: maxDaysPending >= 7,
    positionSpecific: false,
  };
}

export default {
  POSITION_IDS,
  LOAN_THRESHOLDS,
  TRANSACTION_TYPES,
  generatePositionSpecificActions,
  generateStaleLoanSummaryAction,
  parseLoanData,
  isPositionAllowed,
  isPaymentTransaction,
  formatLabel,
};
