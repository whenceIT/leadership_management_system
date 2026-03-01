// {/* Province-by-Province Data */}
//         <div className="col-span-12 lg:col-span-6">
//           <CollapsibleCard title="Province-by-Province Performance">
//             {isLoading ? (
//               <div className="flex items-center justify-center h-32">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
//                 <span className="ml-3 text-gray-500">Loading provincial data...</span>
//               </div>
//             ) : provincialData.length > 0 ? (
//               <div className="space-y-4">
//                 {provincialData.map((province) => (
//                   <div key={province.province.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
//                     <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
//                       {provinceNames[province.province.id as keyof typeof provinceNames] || province.province.name}
//                     </h4>
//                     <div className="grid grid-cols-3 gap-4 text-sm">
//                       <div>
//                         <p className="text-gray-500 dark:text-gray-400">Net Contribution</p>
//                         <p className="font-semibold text-gray-900 dark:text-white">{province.province_summary.formatted_net_contribution}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 dark:text-gray-400">Branches</p>
//                         <p className="font-semibold text-gray-900 dark:text-white">{province.province_summary.total_branches}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 dark:text-gray-400">PAR Rate</p>
//                         <p className={`font-semibold ${
//                           province.province_summary.average_par_rate > 5 ? 'text-red-600 dark:text-red-400' : 
//                           province.province_summary.average_par_rate > 3 ? 'text-yellow-600 dark:text-yellow-400' : 
//                           'text-green-600 dark:text-green-400'
//                         }`}>{province.province_summary.average_par_rate}%</p>
//                       </div>
//                     </div>
//                     {province.branches.length > 0 && (
//                       <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
//                         <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Top Branches:</p>
//                         <div className="space-y-2">
//                           {province.branches.slice(0, 3).map((branch) => (
//                             <div key={branch.branch_id} className="flex justify-between text-xs">
//                               <span className="text-gray-600 dark:text-gray-300">{branch.branch_name}</span>
//                               <span className="font-semibold text-gray-900 dark:text-white">{branch.net_contribution}</span>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//                 <p>No provincial performance data available</p>
//               </div>
//             )}
//           </CollapsibleCard>

//           {/* Institutional Drill-down */}
//           <CollapsibleCard title="Institutional Drill-down">
//             {view === 'provinces' && renderProvinces()}
//             {view === 'districts' && renderDistricts()}
//             {view === 'branches' && renderBranches()}
//             {view === 'officers' && renderOfficers()}
//             {view === 'transactions' && renderTransactions()}
//           </CollapsibleCard>
//         </div>

//         {/* Branch-by-Branch Data - All Branches Overview */}
//         <div className="col-span-12 lg:col-span-6">
//           <CollapsibleCard title="Branch-by-Branch Overview">
//             {isLoading ? (
//               <div className="flex items-center justify-center h-32">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
//                 <span className="ml-3 text-gray-500">Loading branch data...</span>
//               </div>
//             ) : provincialData.length > 0 ? (
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//                   <thead className="bg-gray-50 dark:bg-gray-900">
//                     <tr>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Branch</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Province</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Net Contribution</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">PAR Rate</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Collection Rate</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//                     {provincialData.flatMap(province => 
//                       province.branches.slice(0, 5).map(branch => (
//                         <tr key={branch.branch_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
//                           <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{branch.branch_name}</td>
//                           <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
//                             {provinceNames[province.province.id as keyof typeof provinceNames] || province.province.name}
//                           </td>
//                           <td className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">{branch.net_contribution}</td>
//                           <td className={`px-4 py-2 text-sm font-semibold ${
//                             branch.par.rate > 5 ? 'text-red-600 dark:text-red-400' : 
//                             branch.par.rate > 3 ? 'text-yellow-600 dark:text-yellow-400' : 
//                             'text-green-600 dark:text-green-400'
//                           }`}>{branch.par.rate}%</td>
//                           <td className={`px-4 py-2 text-sm font-semibold ${
//                             branch.collections.rate < 90 ? 'text-yellow-600 dark:text-yellow-400' : 
//                             branch.collections.rate < 85 ? 'text-red-600 dark:text-red-400' : 
//                             'text-green-600 dark:text-green-400'
//                           }`}>{branch.collections.rate}%</td>
//                         </tr>
//                       ))
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//                 <p>No branch performance data available</p>
//               </div>
//             )}
//           </CollapsibleCard>
//         </div>