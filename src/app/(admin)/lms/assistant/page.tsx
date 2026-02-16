"use client";

import { useState, useEffect } from 'react';
import PriorityActionService, { PriorityAction } from '@/services/PriorityActionService';
import { useUserData } from '@/hooks/useUserSync';
import { useLoanUpdates } from '@/hooks/useLoanUpdates';
import { useOffice } from '@/hooks/useOffice';

// Static alerts that don't change
const alerts = [
  { type: "warning", message: "Branch B showing rising Month-1 defaults - investigation suggested" },
  { type: "info", message: "Staff training completion rate below target - intervention needed" },
  { type: "success", message: "Cross-branch best practice sharing opportunity identified" },
];

// Static decision support data
const decisionSupport = [
  {
    category: "Loan Approval",
    question: "How should I handle a loan application from a client with 30% debt-to-income ratio?",
    precedents: [
      { decision: "Approved with collateral", outcome: "Fully repaid within 18 months", date: "2024-01-15" },
      { decision: "Declined - high risk", outcome: "N/A - application withdrawn", date: "2024-01-10" },
    ],
    policy: "Maximum DTI ratio is 40% without additional security",
    riskScore: "72/100 - Moderate Risk",
  },
];

export default function AssistantPage() {
  const [priorityActions, setPriorityActions] = useState<PriorityAction[]>([]);
  const [teamSnapshot, setTeamSnapshot] = useState({
    totalStaff: 24,
    onLeave: 2,
    pendingTasks: 0,
    completedToday: 0,
  });
  const [greeting, setGreeting] = useState("Good morning");
  const [date, setDate] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Get WebSocket connection status (similar to LoanWebSocketDebug)
  const { latestLoan, isConnected, error, reconnect } = useLoanUpdates();

  // Get user data hook
  const { getUserData } = useUserData();
  
  // Get office hook for office name lookup
  const { getOfficeName } = useOffice();

  // Helper function to get user's full name
  const getUserName = () => {
    const user = getUserData();
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.name) {
      return user.name;
    }
    return 'User';
  };

  useEffect(() => {
    setIsClient(true);
    
    // Initialize date and greeting
    const now = new Date();
    const hour = now.getHours();
    let greetingText = 'Good morning';
    if (hour >= 12 && hour < 17) greetingText = 'Good afternoon';
    else if (hour >= 17) greetingText = 'Good evening';
    
    // Get user's name
    const userName = getUserName();
    setGreeting(`${greetingText}, ${userName}`);
    
    setDate(now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));

    // Get PriorityActionService instance and load initial priority actions
    const service = PriorityActionService.getInstance();
    const actions = service.getPriorityActions();
    setPriorityActions(actions);
    setTeamSnapshot(prev => ({
      ...prev,
      pendingTasks: actions.length,
    }));

    // Subscribe to real-time priority action updates
    const unsubscribeFn = service.subscribe((updatedActions) => {
      console.log('📋 AssistantPage: Received priority action update, count:', updatedActions.length);
      setPriorityActions(updatedActions);
      setTeamSnapshot(prev => ({
        ...prev,
        pendingTasks: updatedActions.length,
      }));
    });

    // Check for stale loans (pending > 3 days) and add to priority actions
    service.checkStaleLoans().then((count) => {
      console.log('📋 AssistantPage: Added', count, 'stale loan actions');
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeFn) {
        unsubscribeFn();
      }
    };
  }, []);

  // Handle marking an action as completed
  const handleCompleteAction = (index: number) => {
    const service = PriorityActionService.getInstance();
    service.markAsCompleted(index);
    const updatedActions = service.getPriorityActions();
    setPriorityActions(updatedActions);
    setTeamSnapshot(prev => ({
      ...prev,
      pendingTasks: updatedActions.length,
      completedToday: prev.completedToday + 1,
    }));
  };

  if (!isClient) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="space-y-6">
      {/* Connection Status - Similar to LoanWebSocketDebug */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700 dark:text-gray-300">WebSocket:</span>
          {isConnected ? (
            <span className="text-green-600 font-bold">🟢 Connected</span>
          ) : (
            <span className="text-red-600 font-bold">🔴 Disconnected</span>
          )}
        </div>
        {!isConnected && (
          <button
            onClick={reconnect}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
          >
            Reconnect
          </button>
        )}
        {latestLoan && (
          <span className="text-sm text-gray-500">
            Last loan: {latestLoan.client || latestLoan.borrower_name || 'Unknown'}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Leadership Assistant
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Daily guidance engine and decision support system
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Feedback
          </button>
        </div>
      </div>

      {/* Morning Brief */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{greeting}</h2>
            <p className="text-white/80">{date}</p>
          </div>
        </div>

        {/* Today's Priority Actions - Dynamic from PriorityActionService */}
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Today's Priority Actions</h3>
          <div className="space-y-2">
            {priorityActions.length === 0 ? (
              <div className="p-3 rounded-lg bg-white/10 text-center">
                <p className="text-sm text-white/70">No pending priority actions</p>
              </div>
            ) : (
              priorityActions.map((action, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    action.urgent ? 'bg-white/20' : 'bg-white/10'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${action.urgent ? 'bg-red-400' : 'bg-green-400'}`} />
                  <div className="flex-1">
                    <p className="font-medium">{action.action}</p>
                    <p className="text-xs text-white/70">{action.due}</p>
                  </div>
                  {action.urgent && (
                    <span className="px-2 py-1 bg-red-500/30 text-xs font-medium rounded">
                      Urgent
                    </span>
                  )}
                  <button
                    onClick={() => handleCompleteAction(index)}
                    className="px-2 py-1 bg-white/20 hover:bg-white/30 text-xs font-medium rounded transition-colors"
                    title="Mark as completed"
                  >
                    ✓
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Snapshot */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{teamSnapshot.totalStaff}</p>
            <p className="text-xs text-white/70">Total Staff</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{teamSnapshot.onLeave}</p>
            <p className="text-xs text-white/70">On Leave</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{teamSnapshot.pendingTasks}</p>
            <p className="text-xs text-white/70">Pending Tasks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{teamSnapshot.completedToday}</p>
            <p className="text-xs text-white/70">Completed</p>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              alert.type === 'warning'
                ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                : alert.type === 'success'
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
            }`}
          >
            <div className="flex items-start gap-2">
              <svg
                className={`w-5 h-5 flex-shrink-0 ${
                  alert.type === 'warning'
                    ? 'text-yellow-600'
                    : alert.type === 'success'
                    ? 'text-green-600'
                    : 'text-blue-600'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Decision Support */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Decision Support System
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Historical precedents and policy recommendations
          </p>
        </div>
        <div className="p-6">
          {/* Question Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ask a question
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g., How should I handle a loan application with..."
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
              />
              <button className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-colors">
                Ask
              </button>
            </div>
          </div>

          {/* Sample Decision Support */}
          <div className="space-y-4">
            {decisionSupport.map((support, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {support.category}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  "{support.question}"
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Policy Reference</p>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      {support.policy}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-xs text-red-600 dark:text-red-400 mb-1">Risk Assessment</p>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      {support.riskScore}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">Approval Workflow</p>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Requires District Manager approval
                    </p>
                  </div>
                </div>

                {/* Historical Precedents */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Historical Precedents
                  </h5>
                  <div className="space-y-2">
                    {support.precedents.map((precedent, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {precedent.decision}
                          </p>
                          <p className="text-xs text-gray-500">{precedent.date}</p>
                        </div>
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          {precedent.outcome}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning & Development */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Learning & Development
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Recommended based on your performance gaps
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">Risk Assessment</h4>
              <p className="mt-1 text-sm text-gray-500">Online course • 4 hours</p>
              <button className="mt-3 w-full py-2 border border-brand-500 text-brand-500 rounded-lg text-sm font-medium hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                Start
              </button>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">Team Leadership</h4>
              <p className="mt-1 text-sm text-gray-500">Workshop • 2 hours</p>
              <button className="mt-3 w-full py-2 border border-brand-500 text-brand-500 rounded-lg text-sm font-medium hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                Schedule
              </button>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">Compliance Training</h4>
              <p className="mt-1 text-sm text-gray-500">Mandatory • 1 hour</p>
              <button className="mt-3 w-full py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors">
                Begin
              </button>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">Mentorship Program</h4>
              <p className="mt-1 text-sm text-gray-500">Connect with senior manager</p>
              <button className="mt-3 w-full py-2 border border-brand-500 text-brand-500 rounded-lg text-sm font-medium hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
