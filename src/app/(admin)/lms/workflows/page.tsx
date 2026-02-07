import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workflows | LMS - Leadership Management System",
  description: "Integrated workflow management and automated handoffs",
};

// Mock workflow data
const activeWorkflows = [
  {
    id: 1,
    title: "Collections to Recoveries Handoff",
    status: "Pending Approval",
    from: "Branch Manager",
    to: "Recoveries Coordinator",
    created: "2024-02-05",
    priority: "High",
    description: "Day 90 of delinquency - Loan #4521 requires recovery action",
  },
  {
    id: 2,
    title: "Loan Approval Escalation",
    status: "In Progress",
    from: "Loan Officer",
    to: "Branch Manager",
    created: "2024-02-06",
    priority: "Medium",
    description: "Loan application #8892 exceeds local approval limit",
  },
  {
    id: 3,
    title: "Risk Assessment Review",
    status: "Awaiting Review",
    from: "Risk Manager",
    to: "Provincial Manager",
    created: "2024-02-07",
    priority: "High",
    description: "Anomalous default pattern detected across 3 branches",
  },
];

const automatedHandoffs = [
  {
    id: 1,
    trigger: "Day 90 Delinquency",
    action: "Flag for Recoveries",
    status: "Active",
    successRate: 94,
  },
  {
    id: 2,
    trigger: "Default > 5%",
    action: "Alert District Manager",
    status: "Active",
    successRate: 98,
  },
  {
    id: 3,
    trigger: "Loan Approved",
    action: "Update Portfolio",
    status: "Active",
    successRate: 100,
  },
  {
    id: 4,
    trigger: "Staff Training Due",
    action: "Send Reminder",
    status: "Active",
    successRate: 87,
  },
];

export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Workflow Management
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Automated handoffs and cross-role dependency mapping
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Configure Workflows
          </button>
        </div>
      </div>

      {/* Cross-Role Dependency Map */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cross-Role Dependency Map
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="font-medium text-blue-800 dark:text-blue-300">Branch Manager</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400">Actions affect District Manager KPIs</p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="font-medium text-green-800 dark:text-green-300">Risk Manager</span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-400">Findings impact Accountant reporting</p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75 3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-medium text-purple-800 dark:text-purple-300">IT Manager</span>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-400">Updates enable all managers</p>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="font-medium text-orange-800 dark:text-orange-300">R&D Coordinator</span>
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-400">Creates future opportunities</p>
            </div>
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
          <div className="space-y-4">
            {activeWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      workflow.priority === 'High' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {workflow.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {workflow.from} → {workflow.to}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      workflow.status === 'Pending Approval'
                        ? 'bg-yellow-100 text-yellow-800'
                        : workflow.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {workflow.status}
                    </span>
                    <button className="px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm transition-colors">
                      Review
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {workflow.description}
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  Created: {workflow.created}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Automated Handoffs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Automated Handoffs
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {automatedHandoffs.map((handoff) => (
              <div
                key={handoff.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    {handoff.status}
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {handoff.successRate}%
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {handoff.trigger}
                </h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {handoff.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Intelligent Escalation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Intelligent Escalation System
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Issue Detected</p>
                <p className="text-sm text-gray-500">System identifies the issue</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">2</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Authority Check</p>
                <p className="text-sm text-gray-500">Is this within role's authority?</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">3</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Precedent Check</p>
                <p className="text-sm text-gray-500">Similar past decisions available?</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">4</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Auto-Escalate</p>
                <p className="text-sm text-gray-500">Time elapsed or pattern detected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
