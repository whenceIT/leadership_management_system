import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Role Cards | LMS - Leadership Management System",
  description: "Digital Role Cards for all leadership positions",
};

// Mock data for role cards
const roleCards = [
  {
    id: 1,
    position: "Branch Manager",
    responsibilities: [
      "Approve loan applications up to ZMW 50,000",
      "Monitor branch performance metrics",
      "Ensure collections compliance",
      "Manage branch staff performance",
    ],
    authority: ["Loan approvals", "Staff hiring recommendations", "Budget allocation"],
    escalation: ["District Manager", "Risk Manager"],
    competencies: ["Leadership", "Financial Analysis", "Risk Assessment"],
    metrics: ["Default Rate", "Recovery Rate", "Staff Productivity"],
  },
  {
    id: 2,
    position: "District Manager",
    responsibilities: [
      "Oversee multiple branch operations",
      "Cross-branch performance analysis",
      "Resource allocation across branches",
      "Talent pipeline management",
    ],
    authority: ["Branch transfers", "Regional budget reallocation", "Promotion recommendations"],
    escalation: ["Provincial Manager", "Risk Manager"],
    competencies: ["Strategic Planning", "Team Management", "Performance Analysis"],
    metrics: ["Cross-Branch Default Reduction", "District Recovery Rate", "Issue Resolution Time"],
  },
  {
    id: 3,
    position: "Risk Manager",
    responsibilities: [
      "Assess loan portfolio risk",
      "Flag high-risk applications",
      "Monitor default patterns",
      "Recommend risk mitigation strategies",
    ],
    authority: ["Reject high-risk loans", "Escalate to senior management", "Freeze accounts"],
    escalation: ["Provincial Manager", "GOM"],
    competencies: ["Risk Analysis", "Fraud Detection", "Regulatory Compliance"],
    metrics: ["Portfolio Quality Score", "Default Rate", "Fraud Prevention"],
  },
];

export default function RoleCardsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Digital Role Cards
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Automated Role Cards containing key responsibilities, decision authority, and success metrics
          </p>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roleCards.map((role) => (
          <div
            key={role.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {role.position}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Key Responsibilities */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Key Responsibilities
                </h4>
                <ul className="space-y-1">
                  {role.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <svg className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Decision Authority */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Decision Authority
                </h4>
                <div className="flex flex-wrap gap-2">
                  {role.authority.map((auth, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full"
                    >
                      {auth}
                    </span>
                  ))}
                </div>
              </div>

              {/* Escalation Paths */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Escalation Paths
                </h4>
                <div className="flex flex-wrap gap-2">
                  {role.escalation.map((esc, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-full"
                    >
                      → {esc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Success Metrics */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Success Metrics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {role.metrics.map((metric, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
              <button className="w-full py-2 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors">
                View Full Role Card
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
