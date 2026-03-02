'use client';

import React, { useState } from 'react';

interface ConstituentDetailProps {
  constituent: {
    name: string;
    score: number;
    weight: number;
    actual: string;
    target: string;
    instAvg?: string;
  };
  onClose: () => void;
}

export function ConstituentDetailView({ constituent, onClose }: ConstituentDetailProps) {
  const [expanded, setExpanded] = useState(false);

  const ppContribution = (constituent.score / 100) * constituent.weight;
  const maxPP = constituent.weight;
  const isOverachieving = ppContribution > maxPP;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{constituent.name}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-blue-200">Score</p>
              <p className="text-3xl font-bold">{constituent.score}%</p>
            </div>
            <div>
              <p className="text-sm text-blue-200">Weight</p>
              <p className="text-2xl font-bold">{constituent.weight}%</p>
            </div>
            <div>
              <p className="text-sm text-blue-200">Contribution</p>
              <p className={`text-2xl font-bold ${isOverachieving ? 'text-green-400' : 'text-blue-300'}`}>
                {ppContribution.toFixed(1)}pp
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Performance Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Actual</p>
                <p className="text-sm font-medium text-gray-900">{constituent.actual}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Target</p>
                <p className="text-sm font-medium text-gray-900">{constituent.target}</p>
              </div>
              {constituent.instAvg && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Inst Avg</p>
                  <p className="text-sm font-medium text-gray-900">{constituent.instAvg}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Analysis</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-700">
                  {isOverachieving ? 'Overachieving' : 'Meeting target'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-sm text-gray-700">
                  {constituent.score >= 70 ? 'Strong performance' : 'Moderate performance'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm text-gray-700">
                  {constituent.score < 50 ? 'Needs improvement' : 'On track'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Impact</h3>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                This constituent contributes {ppContribution.toFixed(1)} percentage points to the overall index score.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Max possible contribution: {maxPP}pp</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverachieving ? 'bg-green-500' : constituent.score >= 70 ? 'bg-blue-500' : constituent.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((ppContribution / maxPP) * 100, 150)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Recommendations</h3>
            <div className="space-y-2">
              {constituent.score < 50 && (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <strong>Urgent attention needed:</strong> Performance is significantly below target. Consider immediate intervention.
                  </div>
                </div>
              )}
              {constituent.score >= 50 && constituent.score < 70 && (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <strong>Monitor closely:</strong> Performance is below optimal but within acceptable range.
                  </div>
                </div>
              )}
              {constituent.score >= 70 && (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <strong>Good performance:</strong> Consider best practices from this area to improve other constituents.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              {expanded ? 'Hide Details' : 'Show More Details'}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="p-6 bg-gray-50 rounded-tl-xl rounded-tr-xl">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">Detailed Breakdown</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Score Range</p>
                <p className="text-sm text-gray-700">0-100%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Weight Range</p>
                <p className="text-sm text-gray-700">0-100%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Contribution Range</p>
                <p className="text-sm text-gray-700">0-{maxPP}pp</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Performance Level</p>
                <p className={`text-sm font-medium ${
                  constituent.score >= 70 ? 'text-green-600' : constituent.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {constituent.score >= 70 ? 'Excellent' : constituent.score >= 50 ? 'Good' : 'Poor'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}