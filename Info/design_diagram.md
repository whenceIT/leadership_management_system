Architecture Design Diagram
Loan Processing & Priority Actions System
================================================================================
                           ARCHITECTURE OVERVIEW
================================================================================

                    EXTERNAL SERVICES
                    ================
                           |
                           |  WebSocket Connection
                           |  (Socket.IO)
                           v
================================================================================
                    WEBSOCKET LAYER
================================================================================
+------------------------------------------------------------------------------+
|  src/lib/websocket.ts                                                        |
|  =====================                                                       |
|                                                                              |
|  RESPONSIBILITIES:                                                           |
|  - Socket.IO client connection management                                    |
|  - Event listening & dispatching                                            |
|  - Reconnection handling (max 5 attempts)                                   |
|                                                                              |
|  EXPORTS:                                                                   |
|  - connectWebSocket()     -> Initialize connection                          |
|  - subscribe(channel)     -> Subscribe to channel                           |
|  - on(event, callback)    -> Register event listener                        |
|  - off(event, callback)   -> Remove event listener                          |
|  - getConnectionStatus()  -> Check connection state                         |
|                                                                              |
|  EVENTS EMITTED:                                                             |
|  - 'connected'             -> Socket connected                              |
|  - 'disconnected'          -> Socket disconnected                           |
|  - 'loan.created'          -> New loan event from server                    |
|  - 'notification.created'  -> General notification                          |
+------------------------------------------------------------------------------+
                           |
                           |  Events: 'loan.created', 'connected', 'disconnected'
                           v
================================================================================
                    REACT HOOK LAYER
================================================================================
+------------------------------------------------------------------------------+
|  src/hooks/useLoanUpdates.ts                                                 |
|  ============================                                                |
|                                                                              |
|  RESPONSIBILITIES:                                                           |
|  - React hook for WebSocket integration                                      |
|  - Loan state management (latestLoan, loanHistory)                           |
|  - Event subscription setup/cleanup                                          |
|  - Delegates to PriorityActionService                                        |
|                                                                              |
|  IMPORTS:                                                                    |
|  - from '@/lib/websocket': connectWebSocket, subscribe, on, off             |
|  - PriorityActionService from '@/services/PriorityActionService'             |
|                                                                              |
|  EXPORTS:                                                                    |
|  - useLoanUpdates()         -> Basic hook                                    |
|  - useLoanUpdatesWithHistory() -> With history tracking                      |
|  - LoanData interface                                                        |
|                                                                              |
|  FLOW:                                                                       |
|  1. useEffect -> connectWebSocket()                                         |
|  2. on('connected') -> subscribe('loans')                                    |
|  3. on('loan.created') -> handleLoanCreated()                               |
|  4. handleLoanCreated() -> priorityActionService.processNewLoan(data)       |
+------------------------------------------------------------------------------+
                           |
                           |  LoanData
                           v
================================================================================
                    SERVICE LAYER (Singleton)
================================================================================
+------------------------------------------------------------------------------+
|  src/services/PriorityActionService.ts                                       |
|  =======================================                                     |
|                                                                              |
|  RESPONSIBILITIES:                                                           |
|  - State management (priorityActions, loanCount)                             |
|  - LocalStorage persistence (actions, cache)                                |
|  - Caching stale loans (10-hour TTL)                                        |
|  - Subscriber notification pattern                                           |
|  - Impersonation support                                                     |
|                                                                              |
|  IMPORTS:                                                                    |
|  - LoanData from '@/hooks/useLoanUpdates'                                   |
|  - generatePositionSpecificActions from '@/utils/loanActionGenerator'       |
|  - generateStaleLoanSummaryAction from '@/utils/loanActionGenerator'        |
|  - POSITION_IDS, LOAN_THRESHOLDS from '@/utils/loanActionGenerator'         |
|                                                                              |
|  EXPORTS:                                                                    |
|  - PriorityActionService class (Singleton)                                  |
|  - PriorityAction interface                                                  |
|  - PriorityActionResult interface                                            |
|  - POSITION_IDS (re-export)                                                  |
|  - LOAN_THRESHOLDS (re-export)                                               |
|                                                                              |
|  KEY METHODS:                                                                |
|  - processNewLoan(loanData)     -> Real-time loan processing                |
|  - checkStaleLoans()            -> Fetch & process stale loans              |
|  - subscribe(callback)          -> React component subscription             |
|  - refreshCurrentPosition()     -> Update for impersonation                 |
|                                                                              |
|  LOCALSTORAGE KEYS:                                                          |
|  - 'priority_actions'          -> Saved actions                             |
|  - 'loan_count'                -> Total loans processed                     |
|  - 'stale_loans_cache'         -> Cached stale loans                        |
|  - 'stale_loans_cache_timestamp' -> Cache timestamp                         |
+------------------------------------------------------------------------------+
                           |
                           |  LoanData + LoanActionContext
                           v
================================================================================
                    UTILITY LAYER (Pure Functions)
================================================================================
+------------------------------------------------------------------------------+
|  src/utils/loanActionGenerator.ts                                            |
|  ==================================                                          |
|                                                                              |
|  RESPONSIBILITIES:                                                           |
|  - Position-specific action generation (Pure functions)                     |
|  - Loan data parsing & normalization                                         |
|  - Label formatting                                                          |
|  - Threshold constants                                                       |
|                                                                              |
|  IMPORTS:                                                                    |
|  - PriorityAction from '@/services/PriorityActionService'                   |
|  - LoanData from '@/hooks/useLoanUpdates'                                   |
|  - getOfficeNameById from '@/hooks/useOffice'                               |
|  - getPositionNameByIdStatic from '@/hooks/useUserPosition'                 |
|                                                                              |
|  EXPORTS:                                                                    |
|  - POSITION_IDS              -> Position ID constants (1-21)                |
|  - LOAN_THRESHOLDS           -> Amount thresholds                           |
|  - formatLabel()             -> snake_case -> Title Case                    |
|  - parseLoanData()           -> Normalize loan data                         |
|  - isPositionAllowed()       -> Check position access                       |
|  - generatePositionSpecificActions() -> Main action generator               |
|  - generateStaleLoanSummaryAction() -> Summary action                       |
|                                                                              |
|  POSITION-SPECIFIC ACTIONS:                                                  |
|  - Branch Manager (5)        -> Review, approval, stale alerts              |
|  - Risk Manager (7)          -> Risk assessment, collateral                  |
|  - District Manager (4)      -> Escalation, oversight                        |
|  - Provincial Manager (2)    -> Regional decisions                           |
|  - GOM (1)                   -> Executive approval                           |
|  - Management Accountant (8) -> Disbursement tracking                        |
|  - Loan Consultant (21)     -> Processing, follow-up                       |
|  - GOA/POA (16,17)           -> Operations admin                             |
|  - Super Seer (20)           -> Full access to all                          |
+------------------------------------------------------------------------------+
Data Flow Diagram
                    NOTIFICATION SERVER
                    (notifications.whencefinancesystem.com)
                           |
                           | Socket.IO Event: 'loan.created'
                           v
                    +--------------+
                    |  websocket   |  <- Socket.IO Client
                    |     .ts      |     - connectWebSocket()
                    +--------------+     - on('loan.created')
                           |
                           | triggerEvent('loan.created', loanData)
                           v
                    +--------------+
                    | useLoan      |  <- React Hook
                    |  Updates.ts  |     - useState, useEffect
                    +--------------+     - Event listeners
                           |
                           | priorityActionService.processNewLoan(loanData)
                           v
                    +--------------+
                    | Priority     |  <- Singleton Service
                    | Action       |     - State management
                    | Service.ts   |     - LocalStorage sync
                    +--------------+     - Cache management
                           |
                           | generatePositionSpecificActions(loan, context)
                           v
                    +--------------+
                    | loanAction   |  <- Pure Functions
                    | Generator.ts |     - Position-specific logic
                    +--------------+     - Threshold checks
                           |
                           | PriorityAction[]
                           v
                    +--------------+
                    | React UI     |  <- Leadership Assistant
                    | Component    |     - useLoanUpdates()
                    +--------------+     - subscribe() to service
Cache & Storage Flow
                    +-------------------+
                    |   LocalStorage    |
                    +-------------------+
                    |                   |
    +---------------+ priority_actions  +---------------+
    |               | loan_count        |               |
    |               | stale_loans_cache |               |
    |               | cache_timestamp   |               |
    |               +-------------------+               |
    |                                                   |
    |  saveToStorage()          initializeFromStorage() |
    |         ^                           |              |
    |         |                           v              |
    |   +---------------------------------------+        |
    |   |         PriorityActionService         |        |
    +---+---------------------------------------+--------+
        |                                       |
        | fetchStaleLoans()                      |
        |         |                              |
        |         v                              |
        |   +-----------+    +----------------+  |
        |   | API Call  |--->| Cache Check    |  |
        |   +-----------+    +----------------+  |
        |         |                |              |
        |         |                v              |
        |         |         getCachedStaleLoans() |
        |         |                |              |
        |         v                v              |
        |   +-----------------------------------+ |
        |   | saveStaleLoansToCache()           | |
        |   | (10-hour TTL)                     | |
        |   +-----------------------------------+ |
        +---------------------------------------+
Key Interfaces
// LoanData - Shared across all layers
interface LoanData {
  id?: number;
  loan_number?: string;
  borrower_name?: string;
  client?: string;
  amount?: number | string;
  status?: string;
  type?: string;
  created_by?: string;
  office_id?: number;
  created_at?: string;
}

// PriorityAction - Output format
interface PriorityAction {
  action: string;           // Action description
  due: string;              // Due date/details
  urgent: boolean;          // Priority flag
  positionSpecific?: boolean;
  targetPositionIds?: number[];
}

// LoanActionContext - Generator context
interface LoanActionContext {
  currentPositionId: number;
  loanCount: number;
  isStaleLoan?: boolean;
  daysPending?: number;
}