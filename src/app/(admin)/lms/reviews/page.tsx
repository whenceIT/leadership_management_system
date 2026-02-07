"use client";

// Mock review data
const reviews = [
  {
    id: 1,
    type: "Monthly Review",
    title: "January Performance Review",
    status: "Due in 2 days",
    assignee: "John M.",
    dueDate: "2024-02-15",
    progress: 0,
  },
  {
    id: 2,
    type: "Quarterly Assessment",
    title: "Q4 Progression Assessment",
    status: "In Progress",
    assignee: "Sarah K.",
    dueDate: "2024-02-20",
    progress: 45,
  },
  {
    id: 3,
    type: "Annual Evaluation",
    title: "2023 Annual Tier Evaluation",
    status: "Pending Acknowledgment",
    assignee: "Mike T.",
    dueDate: "2024-02-10",
    progress: 80,
  },
];

const pendingChecklists = [
  {
    id: 1,
    title: "Performance Data Verification",
    completed: true,
  },
  {
    id: 2,
    title: "KPI Threshold Review",
    completed: true,
  },
  {
    id: 3,
    title: "Development Action Items",
    completed: false,
  },
  {
    id: 4,
    title: "Career Progression Score",
    completed: false,
  },
  {
    id: 5,
    title: "Meeting Agenda Creation",
    completed: false,
  },
];

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Review & Progression
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Automated review scheduling and progression tracking
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors">
            Schedule New Review
          </button>
        </div>
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
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {review.type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        review.status === 'Due in 2 days'
                          ? 'bg-yellow-100 text-yellow-800'
                          : review.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {review.status}
                      </span>
                    </div>
                    <h4 className="mt-2 font-medium text-gray-900 dark:text-white">
                      {review.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Assigned to: {review.assignee} • Due: {review.dueDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${review.progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {review.progress}% complete
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Self-Populating Checklist */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Review Checklist - Q4 Progression Assessment
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Auto-populated with current performance data
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {pendingChecklists.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => {}}
                  className="w-5 h-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                <span className={`flex-1 ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                  {item.title}
                </span>
                {item.completed && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
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
                  placeholder="Type your name to sign"
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
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">December Monthly Review</td>
                  <td className="px-4 py-3 text-sm text-gray-500">2024-01-15</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span></td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">92/100</td>
                  <td className="px-4 py-3"><button className="text-brand-500 hover:underline text-sm">View</button></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Q3 Annual Evaluation</td>
                  <td className="px-4 py-3 text-sm text-gray-500">2023-10-30</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span></td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">88/100</td>
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
