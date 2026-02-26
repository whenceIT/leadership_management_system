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
import { useUserKPI } from '@/hooks/useUserKPI';
import ProvincialDataService, { ProvincialPerformanceData } from '@/services/ProvincialDataService';

export default function SuperSeerDashboard({ userTier }: { userTier?: string }) {
  const [provincialData, setProvincialData] = useState<ProvincialPerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const jobInfo = {
    department: "Executive Leadership",
    reportsTo: "Board of Directors",
    directReports: "All Management Positions",
    location: "Headquarters"
  };

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



  // Headline figures - institution-wide metrics
  const institutionMetrics = [
    {
      title: "Total Branches",
      value: "42",
      change: "+3 new this year",
      changeType: "positive" as const,
      icon: (
        <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      title: "Total Staff",
      value: "245",
      change: "+12% this year",
      changeType: "positive" as const,
      icon: (
        <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: "Active Loans",
      value: "3,245",
      change: "+8.5% growth",
      changeType: "positive" as const,
      icon: (
        <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Portfolio Value",
      value: "K45M",
      change: "+15% YoY",
      changeType: "positive" as const,
      icon: (
        <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Average Loan Size",
      value: "K3,850",
      change: "+5.2% increase",
      changeType: "positive" as const,
      icon: (
        <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Collection Rate",
      value: "91.2%",
      change: "+3.2% improvement",
      changeType: "positive" as const,
      icon: (
        <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "M1 Default Rate",
      value: "3.8%",
      change: "-1.2% improvement",
      changeType: "positive" as const,
      icon: (
        <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      title: "Net Profit Margin",
      value: "34.1%",
      change: "+2.3% improvement",
      changeType: "positive" as const,
      icon: (
        <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
  ];

  // Province data
  const provinceNames = {
    1: "Lusaka Province",
    2: "Copperbelt Province",
    3: "Southern Province",
    4: "Eastern Province",
    5: "Northern Province"
  };



  return (
    <DashboardBase
      title="Super Seer Dashboard"
      subtitle="Comprehensive organizational oversight and executive decision support"
      userTier={userTier}
    >

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
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: '91.6%' }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">91.6% of K50M target</p>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Profit Margin</h5>
                <div className="text-2xl font-bold text-brand-500 mb-1">34.1%</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: '85.25%' }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">85.25% of 40% target</p>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Portfolio Growth</h5>
                <div className="text-2xl font-bold text-brand-500 mb-1">+15.3%</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: '102%' }}
                  ></div>
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
          <CollapsibleCard title="Institution Metrics - Headline Figures">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {institutionMetrics.map((metric, index) => (
                <div key={index} className="text-center">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {metric.icon}
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{metric.title}</p>
                    <p className={`text-xs mt-1 ${
                      metric.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 
                      metric.changeType === 'negative' ? 'text-red-600 dark:text-red-400' : 
                      'text-gray-500 dark:text-gray-400'
                    }`}>{metric.change}</p>
                  </div>
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
