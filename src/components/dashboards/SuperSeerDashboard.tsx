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
import { HeadlineParameterCard } from './HeadlineParameterCard';
import { getHeadlineParameters } from '@/data/headline-parameters-mock';
import { InstitutionalHealthSummary, getInstitutionalSummaryData } from './InstitutionalHealthSummary';
import { useUserKPI } from '@/hooks/useUserKPI';
import ProvincialDataService, { ProvincialPerformanceData } from '@/services/ProvincialDataService';

export default function SuperSeerDashboard({ userTier }: { userTier?: string }) {
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

  // Headline parameters using composite index approach
  const headlineParameters = getHeadlineParameters({
    onStaffRatiosDrillDown: () => setView('provinces')
  });

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
      title="Super Seer Dashboard"
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
      

      {/* Institution's Target Evaluation Tracker */}
      <div className="mt-6">
        <CollapsibleCard title="Institution's Valuation Target Tracker">
          <div className="space-y-6">
            {/* Valuation Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">Current Valuation</h4>
                <div className="text-right">
                  <p className="text-2xl font-bold text-brand-500">K85.2M</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+15% from last quarter</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-brand-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: '85.2%' }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0M</span>
                <span>Target: K100M</span>
                <span>Current: K85.2M</span>
                <span>Progress: 85.2%</span>
              </div>
            </div>

            {/* Target Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Revenue Target</h5>
                <div className="text-2xl font-bold text-brand-500 mb-1">K45.8M</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '91.6%' }}></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">91.6% of K50M target</p>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Profit Margin</h5>
                <div className="text-2xl font-bold text-brand-500 mb-1">34.1%</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85.25%' }}></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">85.25% of 40% target</p>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Portfolio Growth</h5>
                <div className="text-2xl font-bold text-brand-500 mb-1">+15.3%</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">102% of 15% target</p>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Key Milestones</h5>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Q1: Branch Expansion</span>
                      <span className="text-sm text-green-600 dark:text-green-400">Completed</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Opened 3 new branches in Lusaka and Copperbelt</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Q2: Digital Transformation</span>
                      <span className="text-sm text-yellow-600 dark:text-yellow-400">In Progress</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mobile app and online banking portal development</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Q3: Market Penetration</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Pending</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Expand into 2 new provinces in Southern Zambia</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h5 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Risk Factors</h5>
              <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                <p>• Economic volatility affecting loan repayment rates</p>
                <p>• Regulatory changes pending in financial sector</p>
                <p>• Competition from new microfinance entrants</p>
              </div>
            </div>
          </div>
        </CollapsibleCard>
      </div>

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

        {/* Province-by-Province Data */}
        <div className="col-span-12 lg:col-span-6">
          <CollapsibleCard title="Province-by-Province Performance">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                <span className="ml-3 text-gray-500">Loading provincial data...</span>
              </div>
            ) : provincialData.length > 0 ? (
              <div className="space-y-4">
                {provincialData.map((province) => (
                  <div key={province.province.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {provinceNames[province.province.id as keyof typeof provinceNames] || province.province.name}
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Net Contribution</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{province.province_summary.formatted_net_contribution}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Branches</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{province.province_summary.total_branches}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">PAR Rate</p>
                        <p className={`font-semibold ${
                          province.province_summary.average_par_rate > 5 ? 'text-red-600 dark:text-red-400' : 
                          province.province_summary.average_par_rate > 3 ? 'text-yellow-600 dark:text-yellow-400' : 
                          'text-green-600 dark:text-green-400'
                        }`}>{province.province_summary.average_par_rate}%</p>
                      </div>
                    </div>
                    {province.branches.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Top Branches:</p>
                        <div className="space-y-2">
                          {province.branches.slice(0, 3).map((branch) => (
                            <div key={branch.branch_id} className="flex justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-300">{branch.branch_name}</span>
                              <span className="font-semibold text-gray-900 dark:text-white">{branch.net_contribution}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No provincial performance data available</p>
              </div>
            )}
          </CollapsibleCard>
        </div>

        {/* Branch-by-Branch Data - All Branches Overview */}
        <div className="col-span-12 lg:col-span-6">
          <CollapsibleCard title="Branch-by-Branch Overview">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                <span className="ml-3 text-gray-500">Loading branch data...</span>
              </div>
            ) : provincialData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Branch</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Province</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Net Contribution</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">PAR Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Collection Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {provincialData.flatMap(province => 
                      province.branches.slice(0, 5).map(branch => (
                        <tr key={branch.branch_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{branch.branch_name}</td>
                          <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                            {provinceNames[province.province.id as keyof typeof provinceNames] || province.province.name}
                          </td>
                          <td className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">{branch.net_contribution}</td>
                          <td className={`px-4 py-2 text-sm font-semibold ${
                            branch.par.rate > 5 ? 'text-red-600 dark:text-red-400' : 
                            branch.par.rate > 3 ? 'text-yellow-600 dark:text-yellow-400' : 
                            'text-green-600 dark:text-green-400'
                          }`}>{branch.par.rate}%</td>
                          <td className={`px-4 py-2 text-sm font-semibold ${
                            branch.collections.rate < 90 ? 'text-yellow-600 dark:text-yellow-400' : 
                            branch.collections.rate < 85 ? 'text-red-600 dark:text-red-400' : 
                            'text-green-600 dark:text-green-400'
                          }`}>{branch.collections.rate}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No branch performance data available</p>
              </div>
            )}
          </CollapsibleCard>
        </div>

        {/* Institutional Drill-down */}
        <div className="col-span-12">
          <CollapsibleCard title="Institutional Drill-down (Province → District → Branch → Officer → Transactions)">
            {view === 'provinces' && renderProvinces()}
            {view === 'districts' && renderDistricts()}
            {view === 'branches' && renderBranches()}
            {view === 'officers' && renderOfficers()}
            {view === 'transactions' && renderTransactions()}
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
