'use client';

import React, { useState, useEffect } from 'react';
import {
  DashboardBase,
  KPICard,
  AlertCard,
  SectionCard,
  QuickInfoBar,
  KPIMetricsCard,
  CollapsibleCard
} from './DashboardBase';

import { InstitutionalHealthSummary, getInstitutionalSummaryData } from './InstitutionalHealthSummary';
import { useUserKPI } from '@/hooks/useUserKPI';
import ProvincialDataService, { ProvincialPerformanceData } from '@/services/ProvincialDataService';

export default function ExecutiveChairpersonDashboard({ userTier }: { userTier?: string }) {
  const [provincialData, setProvincialData] = useState<ProvincialPerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get user-specific KPI data
  const { processedKPIs, isLoading: isKpiLoading, error: kpiError } = useUserKPI();
  
  // Build KPIs from user-specific KPI data
  const kpis = processedKPIs.length > 0 ? processedKPIs.map(kpi => ({
    name: kpi.name,
    baseline: kpi.baseline.toString(),
    target: kpi.target.toString(),
    weight: `${kpi.weight}%`
  })) : [];

  // Fetch provincial performance data
  useEffect(() => {
    const fetchProvincialData = async () => {
      try {
        setIsLoading(true);
        const data: ProvincialPerformanceData[] = [];
        
        // Fetch data for all provinces (simulated)
        const provinces = [1, 2, 3, 4, 5]; // Lusaka, Copperbelt, Southern, Eastern, Northern
        for (const provinceId of provinces) {
          const service = ProvincialDataService.getInstance();
          const provinceData = await service.fetchProvincialPerformance({
            province_id: provinceId,
            include_details: true,
          });
          if (provinceData) {
            data.push(provinceData);
          }
        }
        
        setProvincialData(data);
      } catch (error) {
        console.error('Error fetching provincial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvincialData();
  }, []);

  // Province data
  const provinceNames = {
    1: "Lusaka Province",
    2: "Copperbelt Province",
    3: "Southern Province",
    4: "Eastern Province",
    5: "Northern Province"
  };

  // Drill-down states
  const [view, setView] = useState<'provinces' | 'districts' | 'branches' | 'officers' | 'transactions'>('provinces');
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<number | null>(null);

  

  // Mock data
  const mockProvinces = Array.from({length: 10}, (_, i) => ({
    id: i + 1,
    name: `Province ${i + 1}`,
    avgDefaultRate: (25 + Math.random() * 10).toFixed(2),
    avgRecoveryRate: (50 + Math.random() * 20).toFixed(2),
  }));

  const mockDistricts = (provinceId: number) => Array.from({length: 3}, (_, i) => ({
    id: i + 1,
    name: `District ${i + 1} in Province ${provinceId}`,
    avgDefaultRate: (25 + Math.random() * 10).toFixed(2),
  }));

  const mockBranches = (districtId: number) => Array.from({length: 5}, (_, i) => ({
    id: i + 1,
    name: `Branch ${i + 1} in District ${districtId}`,
    avgDefaultRate: (25 + Math.random() * 10).toFixed(2),
  }));

  const mockOfficers = (branchId: number) => Array.from({length: 10}, (_, i) => ({
    id: i + 1,
    name: `Officer ${i + 1} in Branch ${branchId}`,
    performance: (70 + Math.random() * 30).toFixed(2),
  }));

  const mockTransactions = (officerId: number) => Array.from({length: 20}, (_, i) => ({
    id: i + 1,
    amount: (1000 + Math.random() * 9000).toFixed(2),
    status: ['Active', 'Defaulted', 'Recovered'][Math.floor(Math.random() * 3)],
  }));

  // Render functions
  const renderProvinces = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {mockProvinces.map(province => (
        <div
          key={province.id}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md border border-gray-100 dark:border-gray-700 hover:border-blue-300 transition-all"
          onClick={() => {
            setSelectedProvince(province.id);
            setView('districts');
          }}
        >
          <h3 className="font-bold text-gray-900 dark:text-white">{province.name}</h3>
          <p className="text-sm text-gray-500 mt-1">Default Rate: <span className="font-semibold text-red-600">{province.avgDefaultRate}%</span></p>
          <p className="text-sm text-gray-500">Recovery Rate: <span className="font-semibold text-green-600">{province.avgRecoveryRate}%</span></p>
          <p className="text-xs text-blue-500 mt-2">Click to drill down →</p>
        </div>
      ))}
    </div>
  );

  const renderDistricts = () => {
    if (!selectedProvince) return null;
    const districts = mockDistricts(selectedProvince);
    return (
      <div>
        <button onClick={() => setView('provinces')} className="mb-4 text-blue-500 hover:underline flex items-center gap-1">
          ← Back to Provinces
        </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {districts.map(district => (
            <div
              key={district.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md border border-gray-100 dark:border-gray-700 hover:border-blue-300 transition-all"
              onClick={() => {
                setSelectedDistrict(district.id);
                setView('branches');
              }}
            >
              <h3 className="font-bold text-gray-900 dark:text-white">{district.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Default Rate: <span className="font-semibold text-red-600">{district.avgDefaultRate}%</span></p>
              <p className="text-xs text-blue-500 mt-2">Click to drill down →</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBranches = () => {
    if (!selectedDistrict) return null;
    const branches = mockBranches(selectedDistrict);
    return (
      <div>
        <button onClick={() => setView('districts')} className="mb-4 text-blue-500 hover:underline flex items-center gap-1">
          ← Back to Districts
        </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branches.map(branch => (
            <div
              key={branch.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md border border-gray-100 dark:border-gray-700 hover:border-blue-300 transition-all"
              onClick={() => {
                setSelectedBranch(branch.id);
                setView('officers');
              }}
            >
              <h3 className="font-bold text-gray-900 dark:text-white">{branch.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Default Rate: <span className="font-semibold text-red-600">{branch.avgDefaultRate}%</span></p>
              <p className="text-xs text-blue-500 mt-2">Click to drill down →</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOfficers = () => {
    if (!selectedBranch) return null;
    const officers = mockOfficers(selectedBranch);
    return (
      <div>
        <button onClick={() => setView('branches')} className="mb-4 text-blue-500 hover:underline flex items-center gap-1">
          ← Back to Branches
        </button>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {officers.map(officer => (
            <div
              key={officer.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md border border-gray-100 dark:border-gray-700 hover:border-blue-300 transition-all"
              onClick={() => {
                setSelectedOfficer(officer.id);
                setView('transactions');
              }}
            >
              <h3 className="font-bold text-gray-900 dark:text-white">{officer.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Performance: <span className="font-semibold text-green-600">{officer.performance}%</span></p>
              <p className="text-xs text-blue-500 mt-2">Click to view loans →</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTransactions = () => {
    if (!selectedOfficer) return null;
    const transactions = mockTransactions(selectedOfficer);
    return (
      <div>
        <button onClick={() => setView('officers')} className="mb-4 text-blue-500 hover:underline flex items-center gap-1">
          ← Back to Officers
        </button>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">#{transaction.id}</td>
                  <td className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">K{transaction.amount}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      transaction.status === 'Active' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'Defaulted' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>{transaction.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const summaryData = getInstitutionalSummaryData('institution', 'Whence Financial Services — Institutional View');

  // Institution metrics
  const institutionMetrics = [
    { title: "Total Branches", value: "42", change: "+3 new this year", changeType: "positive" as const },
    { title: "Total Staff", value: "245", change: "+12% this year", changeType: "positive" as const },
    { title: "Active Loans", value: "3,245", change: "+8.5% growth", changeType: "positive" as const },
    { title: "Portfolio Value", value: "K45M", change: "+15% YoY", changeType: "positive" as const },
    { title: "Collection Rate", value: "91.2%", change: "+3.2% improvement", changeType: "positive" as const },
    { title: "M1 Default Rate", value: "3.8%", change: "-1.2% improvement", changeType: "positive" as const },
    { title: "Net Profit Margin", value: "34.1%", change: "+2.3% improvement", changeType: "positive" as const },
    { title: "Avg Loan Size", value: "K3,850", change: "+5.2% increase", changeType: "positive" as const }
  ];

  return (
    <DashboardBase
      title="Executive Chairperson Dashboard"
      subtitle="Comprehensive organizational oversight and executive decision support"
    >
      {/* Institutional Health Summary - Landing Page View */}
      <InstitutionalHealthSummary
        userLevel="institution"
        userLevelLabel="Whence Financial Services — Institutional View"
        parameters={summaryData.parameters}
        recentActivities={summaryData.recentActivities}
        overallScore={summaryData.overallScore}
        overallInstAvg={summaryData.overallInstAvg}
        overallTarget={summaryData.overallTarget}
      />
    
    

      <div className="grid grid-cols-12 gap-4 md:gap-6 mt-6">
        {/* Institution Metrics - Headline Figures */}
        <div className="col-span-12">
          <CollapsibleCard title="Institution Metrics — Headline Figures">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {institutionMetrics.map((metric, index) => (
                <div key={index} className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metric.title}</p>
                  <p className={`text-xs mt-1 ${metric.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{metric.change}</p>
                </div>
              ))}
            </div>
          </CollapsibleCard>
        </div>


        {/* Average Loan Rates by Cycle */}
        <div className="col-span-12">
          <CollapsibleCard title="Average Loan Rates by Cycle">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { cycle: "Current", rate: "18.5%", change: "-0.5% from last cycle" },
                { cycle: "Last Month", rate: "19.0%", change: "+1.2% from previous" },
                { cycle: "Last Quarter", rate: "18.8%", change: "Stable" },
                { cycle: "Year to Date", rate: "18.7%", change: "-0.3% improvement" }
              ].map((period, index) => (
                <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{period.cycle}</h4>
                  <div className="text-3xl font-bold text-brand-500 mb-1">{period.rate}</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{period.change}</p>
                </div>
              ))}
            </div>
          </CollapsibleCard>
        </div>
      </div>
    </DashboardBase>
  );
}
