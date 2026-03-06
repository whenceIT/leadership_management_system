<!-- {/* Grid layout for analysis sections */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Trend Analysis */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-200 dark:border-blue-800">
                                  <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">📉 TREND ANALYSIS (vs last month):</h4>
                                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                    <p>• Overall Score: ▼ 8.3% (from 68.5%)</p>
                                    <p>• Primary Declines: Risk Management (▼12%), LC Performance (▼9%)</p>
                                    <p>• Geographic Origin: 42% of decline from Eastern Province</p>
                                    <p>• Branch-Level: Branch X (Eastern) ▼31%, Branch Y (Eastern) ▼18%</p>
                                  </div>
                                </div>

                                {/* Root Cause Analysis */}
                                {(userLevel === 'branch' || userLevel === 'province' || userLevel === 'district') && (
                                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-200 dark:border-blue-800">
                                    <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">🔍 ROOT CAUSE ANALYSIS:</h4>
                                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                      <p>• Primary Driver: Month-1 Default (20.0/40pp) - 20pp shortfall</p>
                                      <p>• Secondary: 3-Month Recovery (12.9/30pp) - 17.1pp shortfall</p>
                                      <p>• Geographic Concentration:</p>
                                      <p className="ml-4"> - Eastern Province: 22% (vs 38% inst) - contributing 42% of problem</p>
                                      <p className="ml-4"> - Branch X (Eastern): 15% - contributing 60% of provincial problem</p>
                                      <p className="ml-4"> - LC Mukuka (Branch X): 8% - PAR 45%, Recovery 12%</p>
                                      <p className="ml-4"> - LC Banda (Branch X): 12% - PAR 38%, Recovery 18%</p>
                                    </div>
                                  </div>
                                )}

                                {/* Alerts */}
                                {userLevel === 'institution' && (
                                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-200 dark:border-blue-800">
                                    <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">⚠️ ALERTS:</h4>
                                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                      <p>🔴 CRITICAL: Risk Management (38%) - 37pp below target</p>
                                      <p>🟠 WARNING: LC Performance (47%) - 33pp below target</p>
                                      <p>🟢 GOOD: Branch Structure (82%) - Near target</p>
                                    </div>
                                  </div>
                                )}

                                {/* Recommended Actions */}
                                {(userLevel === 'branch' || userLevel === 'province') && (
                                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-200 dark:border-blue-800">
                                    <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">✅ RECOMMENDED ACTIONS:</h4>
                                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                      <p>• Immediate: Portfolio reassignment for LC Mukuka and LC Banda (per Section 11)</p>
                                      <p>• Within 7 days: Branch Manager intervention on 30-60 day delinquent accounts</p>
                                      <p>• Within 30 days: District Manager review of collection practices at Branch X</p>
                                    </div>
                                  </div>
                                )}

                                {/* Timeline Tracking */}
                                {(userLevel === 'branch' || userLevel === 'province') && (
                                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-200 dark:border-blue-800 md:col-span-2">
                                    <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">⏰ TIMELINE TRACKING:</h4>
                                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                      <p>• Performance Manager notified: 2024-07-15 09:34</p>
                                      <p>• Branch Manager acknowledged: 2024-07-15 14:20</p>
                                      <p>• Follow-up review scheduled: 2024-07-22</p>
                                    </div>
                                  </div>
                                )}
                              </div> -->