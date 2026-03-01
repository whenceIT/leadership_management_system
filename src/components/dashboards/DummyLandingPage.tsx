'use client';

import React, { useState } from 'react';
import { DashboardBase, KPICard, CollapsibleCard } from './DashboardBase';

// Dummy data
const dummyProvinces = Array.from({length: 10}, (_, i) => ({
  id: i + 1,
  name: `Province ${i + 1}`,
  avgDefaultRate: (25 + Math.random() * 10).toFixed(2),
  avgRecoveryRate: (50 + Math.random() * 20).toFixed(2),
  // Add more stats
}));

const dummyBranches = (provinceId: number) => Array.from({length: 5}, (_, i) => ({
  id: i + 1,
  name: `Branch ${i + 1} in Province ${provinceId}`,
  avgDefaultRate: (25 + Math.random() * 10).toFixed(2),
  // Add more
}));

const dummyStaffs = (branchId: number) => Array.from({length: 10}, (_, i) => ({
  id: i + 1,
  name: `Staff ${i + 1} in Branch ${branchId}`,
  performance: (70 + Math.random() * 30).toFixed(2),
  // Add more
}));

const dummyLoans = (staffId: number) => Array.from({length: 20}, (_, i) => ({
  id: i + 1,
  amount: (1000 + Math.random() * 9000).toFixed(2),
  status: ['Active', 'Defaulted', 'Recovered'][Math.floor(Math.random() * 3)],
  // Add more
}));

const headlineParameters = [
  {
    title: 'Branch Structure and Staffing',
    institutionalAvg: '85%',
    current: '82%',
    target: '≥90%',
    variance: '-8%',
    trend: '↓',
  },
  {
    title: 'Loan Consultant Performance',
    institutionalAvg: '75%',
    current: '78%',
    target: '≥80%',
    variance: '-2%',
    trend: '↑',
  },
  {
    title: 'Loan Products and Interest Rates',
    institutionalAvg: '65%',
    current: '68%',
    target: '≥70%',
    variance: '-2%',
    trend: '→',
  },
  {
    title: 'Risk Management and Defaults',
    institutionalAvg: '28.36%',
    current: '30%',
    target: '≤27%',
    variance: '+3%',
    trend: '↑',
  },
  {
    title: 'Revenue and Performance Metrics',
    institutionalAvg: 'K1.2M',
    current: 'K1.1M',
    target: '≥K1.5M',
    variance: '-26%',
    trend: '↓',
  },
];

export default function DummyLandingPage() {
  const [view, setView] = useState<'provinces' | 'branches' | 'staffs' | 'loans'>('provinces');
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);

  const renderHeadlineParameters = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {headlineParameters.map((param, index) => (
        <KPICard
          key={index}
          title={param.title}
          value={param.current}
          change={`${param.variance} from target ${param.target} (Inst. Avg: ${param.institutionalAvg}) ${param.trend}`}
          changeType={param.variance.startsWith('+') ? 'negative' : 'positive'}
        />
      ))}
    </div>
  );

  const renderProvinces = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {dummyProvinces.map(province => (
        <div
          key={province.id}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md"
          onClick={() => {
            setSelectedProvince(province.id);
            setView('branches');
          }}
        >
          <h3 className="font-bold">{province.name}</h3>
          <p>Default Rate: {province.avgDefaultRate}%</p>
          <p>Recovery Rate: {province.avgRecoveryRate}%</p>
          {/* Add more stats */}
        </div>
      ))}
    </div>
  );

  const renderBranches = () => {
    if (!selectedProvince) return null;
    const branches = dummyBranches(selectedProvince);
    return (
      <div>
        <button onClick={() => setView('provinces')} className="mb-4 text-blue-500">Back to Provinces</button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branches.map(branch => (
            <div
              key={branch.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md"
              onClick={() => {
                setSelectedBranch(branch.id);
                setView('staffs');
              }}
            >
              <h3 className="font-bold">{branch.name}</h3>
              <p>Default Rate: {branch.avgDefaultRate}%</p>
              {/* Add more stats */}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStaffs = () => {
    if (!selectedBranch) return null;
    const staffs = dummyStaffs(selectedBranch);
    return (
      <div>
        <button onClick={() => setView('branches')} className="mb-4 text-blue-500">Back to Branches</button>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {staffs.map(staff => (
            <div
              key={staff.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md"
              onClick={() => {
                setSelectedStaff(staff.id);
                setView('loans');
              }}
            >
              <h3 className="font-bold">{staff.name}</h3>
              <p>Performance: {staff.performance}%</p>
              {/* Add more stats */}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLoans = () => {
    if (!selectedStaff) return null;
    const loans = dummyLoans(selectedStaff);
    return (
      <div>
        <button onClick={() => setView('staffs')} className="mb-4 text-blue-500">Back to Staffs</button>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th>ID</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.map(loan => (
                <tr key={loan.id}>
                  <td>{loan.id}</td>
                  <td>K{loan.amount}</td>
                  <td>{loan.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <DashboardBase title="Dummy SLMS Landing Page" subtitle="Dummy UI Flow for Drill-down">
      {renderHeadlineParameters()}
      <CollapsibleCard title="Drill-down View">
        {view === 'provinces' && renderProvinces()}
        {view === 'branches' && renderBranches()}
        {view === 'staffs' && renderStaffs()}
        {view === 'loans' && renderLoans()}
      </CollapsibleCard>
    </DashboardBase>
  );
}
