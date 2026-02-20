'use client';

import React, { useState, useEffect } from 'react';

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('architecture');

  useEffect(() => {
    // Scroll to top on section change
    window.scrollTo(0, 0);
  }, [activeSection]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          System Documentation
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Comprehensive documentation for the Leadership Management System (LMS)
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'architecture', label: 'Architecture' },
            { id: 'sequence', label: 'Sequence Diagrams' },
            { id: 'data-flow', label: 'Data Flow' },
            { id: 'scoring', label: 'Target Scoring' },
            { id: 'kpi', label: 'KPI Calculator' },
            { id: 'default-rate', label: 'Month-1 Default Rate' },
            { id: 'portfolio', label: 'Portfolio Update' },
            { id: 'risk', label: 'Risk & Alerts' },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeSection === section.id
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Section Content */}
      <div className="space-y-8">
        {activeSection === 'architecture' && <ArchitectureSection />}
        {activeSection === 'sequence' && <SequenceDiagramsSection />}
        {activeSection === 'data-flow' && <DataFlowSection />}
        {activeSection === 'scoring' && <TargetScoringSection />}
        {activeSection === 'kpi' && <KPICalculatorSection />}
        {activeSection === 'default-rate' && <Month1DefaultRateSection />}
        {activeSection === 'portfolio' && <PortfolioUpdateSection />}
        {activeSection === 'risk' && <RiskAndAlertsSection />}
      </div>
    </div>
  );
}

// Architecture Design Diagram Section
function ArchitectureSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Architecture Design Diagram
      </h2>

      {/* Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          System Overview
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          The Leadership Management System (LMS) is a comprehensive leadership automation framework built to transform operations at Whence Financial Services.
        </p>

        {/* Architecture Layers */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            Core Architecture Layers
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                Frontend Layer
              </h5>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Next.js 14 with TypeScript</li>
                <li>• Tailwind CSS for styling</li>
                <li>• Client-side hooks architecture</li>
                <li>• Responsive dashboard design</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h5 className="font-medium text-green-800 dark:text-green-300 mb-2">
                Services Layer
              </h5>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• PriorityActionService</li>
                <li>• AlertService</li>
                <li>• WebSocket connection management</li>
                <li>• LocalStorage persistence</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <h5 className="font-medium text-purple-800 dark:text-purple-300 mb-2">
                Backend Integration
              </h5>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• RESTful APIs</li>
                <li>• WebSocket notifications</li>
                <li>• External LMS integration</li>
                <li>• Database connectivity</li>
              </ul>
            </div>
          </div>
        </div>

        {/* System Components */}
        <div className="mt-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Key System Components
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Component
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    File Location
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    DashboardWrapper
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    Dynamic dashboard loading based on user position
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">
                    src/components/dashboards/DashboardWrapper.tsx
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    useUserPosition
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    User position management and impersonation
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">
                    src/hooks/useUserPosition.ts
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    PriorityActionService
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    Real-time loan processing and action generation
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">
                    src/services/PriorityActionService.ts
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    AlertService
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    Notification and alert management
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">
                    src/services/AlertService.ts
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    loanActionGenerator
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    Position-specific action generation
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">
                    src/utils/loanActionGenerator.ts
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Module Architecture */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          5 Core Modules Architecture
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Job Description Engine */}
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">
              📋 Job Description Engine
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Digital role cards for 26 leadership positions</li>
              <li>• Automated responsibility assignment</li>
              <li>• Decision authority matrix</li>
              <li>• Real-time updates</li>
            </ul>
          </div>

          {/* KPI Tracker */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
              📊 KPI Tracker
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Real-time KPI calculation</li>
              <li>• Personalized dashboards</li>
              <li>• Exception-based reporting</li>
              <li>• Predictive analytics</li>
            </ul>
          </div>

          {/* Review Automation */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
              🎯 Review Automation
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Scheduled review triggers</li>
              <li>• Self-populating checklists</li>
              <li>• Digital sign-off & tracking</li>
              <li>• Succession planning</li>
            </ul>
          </div>

          {/* Workflow Integrator */}
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
              🔄 Workflow Integrator
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Cross-role dependency mapping</li>
              <li>• Automated handoffs & approvals</li>
              <li>• Intelligent escalation system</li>
              <li>• Process automation</li>
            </ul>
          </div>

          {/* Intelligent Assistant */}
          <div className="p-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg">
            <h4 className="font-semibold text-pink-800 dark:text-pink-300 mb-2">
              🤖 Intelligent Assistant
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Daily guidance engine</li>
              <li>• Decision support system</li>
              <li>• Learning & development integration</li>
              <li>• Performance coaching</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sequence Diagrams Section
function SequenceDiagramsSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Sequence Diagrams
      </h2>

      {/* Impersonation Flow */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Impersonation Flow
        </h3>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="font-mono text-sm text-gray-900 dark:text-white space-y-2">
            <div className="flex items-center">
              <span className="w-32 font-medium">User</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">Navigate to /settings/impersonate</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">User</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">Select position and user</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">User</span>
              <span className="w-20 text-center">→</span>
               <span className="flex-1">Click &quot;Start Impersonation&quot;</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">useUserPosition</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">startImpersonation()</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">LocalStorage</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">Store impersonationData & original user</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">Custom Event</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">dispatch(IMPERSONATION_STARTED_EVENT)</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">DashboardWrapper</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">handleImpersonationChange()</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">PriorityActionService</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">Refresh for new position</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">UI</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">Render new dashboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Processing Flow */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Loan Processing Flow
        </h3>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="font-mono text-sm text-gray-900 dark:text-white space-y-2">
            <div className="flex items-center">
              <span className="w-32 font-medium">WebSocket</span>
              <span className="w-20 text-center">→</span>
               <span className="flex-1">Receive &#39;loan.created&#39; event</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">useLoanUpdates</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">handleLoanCreated()</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">PriorityActionService</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">processNewLoan()</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">loanActionGenerator</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">generatePositionSpecificActions()</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">LocalStorage</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">Save new actions</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">React UI</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">Update Leadership Assistant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Data Flow Section
function DataFlowSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Data Flow Diagrams
      </h2>

      {/* Data Flow Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          System Data Flow
        </h3>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="font-mono text-sm text-gray-900 dark:text-white space-y-2">
            <div className="flex items-center">
              <span className="w-32 font-medium">External APIs</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">API endpoints: /staffbyPosition, /smart-loans</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">WebSocket</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">notifications.whencefinancesystem.com</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">Next.js API</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">API routes: /api/auth, /api/users, /api/kpi</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">Services</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">PriorityActionService, AlertService</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">Hooks</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">useUserPosition, useLoanUpdates, useUserKPI</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">UI Components</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">Dashboards, Leadership Assistant, KPI Dashboard</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">Storage</span>
              <span className="w-20 text-center">→</span>
              <span className="flex-1">LocalStorage: thisUser, impersonationData, priority_actions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Target Scoring Section
function TargetScoringSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Target Scoring System
      </h2>

      {/* Target Scoring Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Overview
        </h3>
         <p className="text-gray-600 dark:text-gray-300 mb-4">
          The target scoring system is designed to evaluate leadership performance against predefined KPI targets aligned with the institution&#39;s $100M valuation goal.
        </p>

        {/* Scoring Methodology */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            Scoring Methodology
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                Performance Categories
              </h5>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Financial KPIs (25-30% weight)</li>
                <li>• Operational KPIs (20-25% weight)</li>
                <li>• Team Development (15-20% weight)</li>
                <li>• Strategic Contribution (15-20% weight)</li>
                <li>• Risk & Compliance (10-15% weight)</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h5 className="font-medium text-green-800 dark:text-green-300 mb-2">
                Performance Levels
              </h5>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Exceeds Expectations: ≥90%</li>
                <li>• Meets Expectations: 70-90%</li>
                <li>• Below Expectations: 50-70%</li>
                <li>• Fails Expectations: &lt;50%</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Example: Branch Manager Scoring */}
        <div className="mt-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Example: Branch Manager Score Calculation
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    KPI
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actual
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    Monthly Disbursement
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    K450,000+
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    K480,000
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    20%
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    20
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    Net Contribution
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    K324,000+
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    K340,000
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    25%
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    25
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    Month-1 Default Rate
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    ≤25%
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    23%
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    20%
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    20
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    Recovery Rate
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    ≥65%
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    62%
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    15%
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    14
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    Total Score
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300"></td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300"></td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300"></td>
                  <td className="px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                    79%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Performance Level: <span className="font-medium">Meets Expectations</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// KPI Calculator Section
function KPICalculatorSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        KPI Calculator
      </h2>

      {/* KPI Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          KPI Categories
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
              Financial KPIs
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Monthly Disbursement Volume</li>
              <li>• Branch Net Contribution</li>
              <li>• Cost-to-Income Ratio</li>
              <li>• Recovery Rate</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
              Operational KPIs
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Default Rates</li>
              <li>• Collection Efficiency</li>
              <li>• Process Compliance</li>
              <li>• Resource Utilization</li>
            </ul>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">
              Team KPIs
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Staff Performance</li>
              <li>• Training Completion</li>
              <li>• Turnover Rate</li>
              <li>• Client Satisfaction</li>
            </ul>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-2">
              Strategic KPIs
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Product Adoption</li>
              <li>• Market Expansion</li>
              <li>• Process Innovation</li>
              <li>• Regulatory Compliance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Calculator Example */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          KPI Calculation Example
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Branch Manager KPIs
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Monthly Disbursement Target: K450,000+
                </label>
                <input
                  type="number"
                  defaultValue={480000}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Month-1 Default Rate Target: ≤25%
                </label>
                <input
                  type="number"
                  defaultValue={23}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Recovery Rate Target: ≥65%
                </label>
                <input
                  type="number"
                  defaultValue={62}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
                Calculate Score
              </button>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Results
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Overall Score:
                </span>
                <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  79%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Performance Level:
                </span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Meets Expectations
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Exceeds Targets:
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  3 of 4
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                  style={{ width: '79%' }}
                ></div>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  💡 Recovery rate is slightly below target. Consider implementing
                  additional collection strategies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Month-1 Default Rate Section
function Month1DefaultRateSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Month-1 Default Rate
      </h2>

      {/* Definition */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Definition
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          The Month-1 Default Rate measures the percentage of loans that enter default status within the first 30 days of disbursement. It is a critical KPI for evaluating credit risk and underwriting quality.
        </p>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
            Formula
          </h4>
          <div className="font-mono text-sm text-gray-900 dark:text-white p-3 bg-white dark:bg-gray-800 rounded">
            Month-1 Default Rate = (Number of loans defaulting in Month 1) / (Total loans disbursed in Month 1) × 100
          </div>
        </div>
      </div>

      {/* Targets by Position */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Targets by Position
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Baseline
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Weight
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  Branch Manager
                </td>
                <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium">
                  ≤25%
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  28.36%
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  20%
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  District Manager
                </td>
                <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium">
                  ≤23%
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  27%
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  20%
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  Provincial Manager
                </td>
                <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium">
                  ≤22%
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  26%
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  20%
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  Risk Manager
                </td>
                <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium">
                  ≤20%
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  25%
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  25%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Portfolio Update Section
function PortfolioUpdateSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Portfolio Update Mechanism
      </h2>

      {/* Process */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Portfolio Update Process
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
              1. Data Collection
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Loan status updates from LMS API</li>
              <li>• Payment history from accounting system</li>
              <li>• Client information from CRM</li>
              <li>• Collection efforts from recoveries department</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
              2. Data Processing
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Normalization and validation</li>
              <li>• Status categorization (current, delinquent, default)</li>
              <li>• Risk scoring update</li>
              <li>• Performance metric calculation</li>
            </ul>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">
              3. Portfolio Analysis
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Portfolio quality assessment</li>
              <li>• Default rate calculation</li>
              <li>• Recovery rate tracking</li>
              <li>• Risk exposure analysis</li>
            </ul>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-2">
              4. Dashboard Update
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Real-time KPI refresh</li>
              <li>• Performance chart updates</li>
              <li>• Alert generation for exceptions</li>
              <li>• User notification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Risk and Alerts Section
function RiskAndAlertsSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Risk and Alerts System
      </h2>

      {/* Alert Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Alert Categories
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
              🔥 Critical
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Immediate attention required. Loan default risk is high.
            </p>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
              ⚠️ Warning
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Potential issue detected. Monitor closely.
            </p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
              ℹ️ Info
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              General information about portfolio status.
            </p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
              ✅ Success
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Positive performance or resolved issues.
            </p>
          </div>
        </div>
      </div>

      {/* Alert Types */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Alert Types
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Alert Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                  Default Risk
                </td>
                <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  Risk
                </td>
                <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  Critical
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  Loan showing high default probability based on payment history and risk score.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                  Delinquent Payment
                </td>
                <td className="px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">
                  Payment
                </td>
                <td className="px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">
                  Warning
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  Payment overdue by more than 30 days.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                  Portfolio Growth
                </td>
                <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400">
                  Performance
                </td>
                <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400">
                  Success
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  Portfolio has grown by more than 10% this month.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                  Collection Efficiency
                </td>
                <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400">
                  Operational
                </td>
                <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400">
                  Info
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  Collection rate is 5% above target.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Animation Design */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Alert Animation Design
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Entry Animation
            </h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p>• Fade in from 0% to 100% opacity</p>
              <p>• Slide in from bottom (10px) to final position</p>
              <p>• Scale from 0.95 to 1.0</p>
              <p>• Duration: 0.3 seconds</p>
              <p>• Easing: ease-out</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Exit Animation
            </h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p>• Fade out from 100% to 0% opacity</p>
              <p>• Slide down (10px)</p>
              <p>• Scale from 1.0 to 0.95</p>
              <p>• Duration: 0.2 seconds</p>
              <p>• Easing: ease-in</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Interactive States
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                Hover
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Slight scale to 1.02, shadow enhancement
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <h5 className="font-medium text-purple-800 dark:text-purple-300 mb-2">
                Click
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Scale to 0.98, immediate feedback
              </p>
            </div>
          </div>
         </div>
      </div>
    </div>
  );
}
