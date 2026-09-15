'use client';

import React, { useState } from 'react';
import { ExecutiveCashHealthData, CashHealthProvince, CashHealthDistrict, CashHealthOffice } from '@/services/CashPositionService';
import { getOfficeNameById } from '@/hooks/useOffice';
import { useOffice } from '@/hooks/useOffice';
import CashHealthOfficePopup from './CashHealthOfficePopup';

interface CashHealthDrillTableProps {
  data: ExecutiveCashHealthData | null;
  drillLevel: 'province' | 'district' | 'office' | null;
  selectedProvince: number | null;
  selectedDistrict: number | null;
  onProvinceClick: (provinceId: number) => void;
  onDistrictClick: (districtId: number) => void;
  onBack: () => void;
}

function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) return '--';
  return new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW', maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number | undefined): string {
  if (value === undefined || value === null) return '--';
  return value.toLocaleString();
}

function getScoreBadge(score: number | undefined, status?: string): React.ReactNode {
  if (score === undefined || score === null) return <span className="text-gray-400">--</span>;
  
  let colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  if (status === 'GREEN' || (status === undefined && score >= 80)) {
    colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  } else if (status === 'AMBER' || (status === undefined && score >= 60)) {
    colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  } else if (status === 'RED' || (status === undefined && score < 60)) {
    colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  }
  
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colorClass}`}>
      {score}
    </span>
  );
}

function ProvinceRow({ 
  province, 
  onClick, 
  showReason
}: { 
  province: CashHealthProvince; 
  onClick: () => void;
  showReason?: boolean;
}) {
  const scores = province.scores || {};
  const financials = province.financials || {};
  const overallScore = scores.overall;
  const status = scores.status;
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={onClick}>
      <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
        {province.province_name || `Province ${province.province_id}`}
      </td>
      <td className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 font-semibold">
        {province.office_count || 0}
      </td>
      <td className="px-4 py-2 text-sm text-green-600 dark:text-green-400 font-semibold">
        {formatCurrency(financials.residual_cash)}
      </td>
      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
        {formatCurrency(financials.net_cash_position)}
      </td>
      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
        {formatCurrency(financials.minimum_loan_target)}
      </td>
       <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
         {formatCurrency(financials.defaults)}
       </td>
       <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
         {formatCurrency(financials.irregular_cost_reserve)}
       </td>
       <td className="px-4 py-2 text-center">
         {getScoreBadge(overallScore, status)}
       </td>
       {showReason && (
         <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={province.reason}>
           {province.reason || '--'}
         </td>
       )}
     </tr>
   );
}

function DistrictRow({ 
  district, 
  onClick, 
  showReason
}: { 
  district: CashHealthDistrict; 
  onClick: () => void;
  showReason?: boolean;
}) {
  const scores = district.scores || {};
  const financials = district.financials || {};
  const overallScore = scores.overall;
  const status = scores.status;
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={onClick}>
      <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white pl-8">
        {district.district_name || `District ${district.district_id}`}
      </td>
      <td className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 font-semibold">
        {district.office_count || 0}
      </td>
      <td className="px-4 py-2 text-sm text-green-600 dark:text-green-400 font-semibold">
        {formatCurrency(financials.residual_cash)}
      </td>
      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
        {formatCurrency(financials.net_cash_position)}
      </td>
      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
        {formatCurrency(financials.minimum_loan_target)}
      </td>
       <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
         {formatCurrency(financials.defaults)}
       </td>
       <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
         {formatCurrency(financials.irregular_cost_reserve)}
       </td>
       <td className="px-4 py-2 text-center">
         {getScoreBadge(overallScore, status)}
       </td>
       {showReason && (
         <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={district.reason}>
           {district.reason || '--'}
         </td>
       )}
     </tr>
   );
}

function OfficeRow({
  office, 
  showReason,
  onReasonClick,
  offices
}: { 
  office: CashHealthOffice; 
  showReason?: boolean;
  onReasonClick?: (office: CashHealthOffice) => void;
  offices?: any[];
}) {
  const scores = office.scores || {};
  const financials = office.financials || {};
  const overallScore = scores.overall;
  const status = scores.status;
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
        <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white pl-12">
          {office.office_name || (office.office_id ? getOfficeNameById(office.office_id, offices) : undefined) || '-'}
        </td>
       <td className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 font-semibold">
         {formatNumber(office.disbursed)}
       </td>
       <td className="px-4 py-2 text-sm text-green-600 dark:text-green-400 font-semibold">
         {formatNumber(office.collected)}
       </td>
       <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
         {formatCurrency(financials.residual_cash)}
       </td>
       <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
         {formatCurrency(financials.net_cash_position)}
       </td>
       <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
         {formatCurrency(financials.minimum_loan_target)}
       </td>
       <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
         {formatCurrency(financials.defaults)}
       </td>
       <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
         {formatCurrency(financials.irregular_cost_reserve)}
       </td>
       <td className="px-4 py-2 text-center">
         {getScoreBadge(overallScore, status)}
       </td>
      {showReason && (
        <td className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline max-w-xs truncate" title={office.reason} onClick={(e) => {
          e.stopPropagation();
          onReasonClick?.(office);
        }}>
          {office.reason || '--'}
        </td>
      )}
    </tr>
  );
}

export function CashHealthDrillTable({ 
  data, 
  drillLevel, 
  selectedProvince, 
  selectedDistrict,
  onProvinceClick, 
  onDistrictClick, 
  onBack 
}: CashHealthDrillTableProps) {
  const [showReason, setShowReason] = useState(false);
  const [officePopup, setOfficePopup] = useState<CashHealthOffice | null>(null);
  const { offices } = useOffice();
  
  const handleReasonClick = (office: CashHealthOffice) => {
    setOfficePopup(office);
  };
  
  if (!data || !data.provinces || data.provinces.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No cash health data available
      </div>
    );
  }

  const provinces = data.provinces;

  // Province level view
  if (drillLevel === 'province' || drillLevel === null) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">National Cash Health - Provinces</h3>
          <button
            onClick={() => setShowReason(!showReason)}
            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {showReason ? 'Hide' : 'Show'} Reasons
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Province</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Offices</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Residual Cash</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Net Cash Position</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Min Loan Target</th>
                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Defaults</th>
                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Irregular Costs</th>
                 <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Overall Score</th>
                 {showReason && (
                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                 )}
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
               {provinces.map((province) => (
                <ProvinceRow
                  key={province.province_id}
                  province={province}
                  onClick={() => onProvinceClick(province.province_id!)}
                  showReason={showReason}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // District level view
  if (drillLevel === 'district' && selectedProvince) {
    const province = provinces.find(p => p.province_id === selectedProvince);
    if (!province || !province.districts || province.districts.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No districts found for this province
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
              title="Back to Provinces"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {province.province_name || `Province ${province.province_id}`} - Districts
            </h3>
          </div>
          <button
            onClick={() => setShowReason(!showReason)}
            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {showReason ? 'Hide' : 'Show'} Reasons
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Offices</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Residual Cash</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Net Cash Position</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Min Loan Target</th>
                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Defaults</th>
                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Irregular Costs</th>
                 <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Overall Score</th>
                 {showReason && (
                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                 )}
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
               {province.districts.map((district) => (
                <DistrictRow
                  key={district.district_id}
                  district={district}
                  onClick={() => onDistrictClick(district.district_id!)}
                  showReason={showReason}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Office level view
  if (drillLevel === 'office' && selectedProvince && selectedDistrict) {
    const province = provinces.find(p => p.province_id === selectedProvince);
    const district = province?.districts?.find(d => d.district_id === selectedDistrict);
    
    if (!district || !district.offices || district.offices.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No offices found for this district
        </div>
      );
    }

    return (
      <>
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
              title="Back to Districts"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {district.district_name || `District ${district.district_id}`} - Branches/Offices
            </h3>
          </div>
          <button
            onClick={() => setShowReason(!showReason)}
            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {showReason ? 'Hide' : 'Show'} Reasons
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Office</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Disbursed</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Collected</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Residual Cash</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Net Cash Position</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Min Loan Target</th>
                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Defaults</th>
                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Irregular Costs</th>
                 <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Overall Score</th>
                 {showReason && (
                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                 )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {district.offices.map((office) => (
                  <OfficeRow
                  key={office.office_id}
                  office={office}
                  showReason={showReason}
                  onReasonClick={handleReasonClick}
                  offices={offices}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {officePopup && (
        <CashHealthOfficePopup
          office={officePopup}
          onClose={() => setOfficePopup(null)}
        />
      )}
      </>
    );
  }

  return null;
}