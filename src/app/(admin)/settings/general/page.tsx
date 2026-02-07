import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "General Settings | LMS - Leadership Management System",
  description: "General system settings and configuration",
};

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          General Settings
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Configure general system settings and preferences
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          General settings configuration coming soon...
        </p>
      </div>
    </div>
  );
}
