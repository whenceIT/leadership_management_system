"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  getUserPosition, 
  getUserPositionId,
  getPositionNameByIdStatic 
} from '@/hooks/useUserPosition';
import { 
  getAllKPIs, 
  getKPIsByPosition, 
  KpiMetric, 
  KPI_CATEGORIES 
} from '@/data/role-cards-data';
import { AVAILABLE_POSITIONS, PositionType } from '@/hooks/useUserPosition';

// Icons
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const LoadingIcon = () => (
  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Category badge component
function CategoryBadge({ category }: { category: string }) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  };

  // Category mapping for API values (handles case-insensitive matching)
  const categoryMap: Record<string, { label: string; color: string }> = {
    'financial': { label: 'Financial', color: 'green' },
    'operational': { label: 'Operational', color: 'blue' },
    'team': { label: 'Team & Development', color: 'purple' },
    'team & development': { label: 'Team & Development', color: 'purple' },
    'strategic': { label: 'Strategic', color: 'orange' },
    'compliance': { label: 'Compliance & Risk', color: 'red' },
    'compliance & risk': { label: 'Compliance & Risk', color: 'red' },
    'technical': { label: 'Technical', color: 'cyan' },
    'risk': { label: 'Risk', color: 'red' },
  };
  
  // Normalize category to lowercase for matching
  const normalizedCategory = category?.toLowerCase().trim() || '';
  const cat = categoryMap[normalizedCategory] || KPI_CATEGORIES[normalizedCategory as keyof typeof KPI_CATEGORIES];
  
  // If category doesn't exist in mapping, show a default badge with the raw category value
  if (!cat) {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses.blue}`}>
        {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Unknown'}
      </span>
    );
  }
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses[cat.color] || colorClasses.blue}`}>
      {cat.label}
    </span>
  );
}

// Add KPI Modal
function AddKpiModal({ 
  positionId,
  onSave, 
  onCancel 
}: { 
  positionId: number;
  onSave: (kpi: Partial<KpiMetric>) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target: '',
    category: 'operational',
    weight: '10',
    scoring: 'percentage',
    role: 1,
    position_id: positionId,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onCancel();
    }, 300);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('KPI name is required');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: formData.name,
        description: formData.description,
        target: formData.target,
        category: formData.category as any,
        weight: parseInt(formData.weight) || 10,
        scoring: formData.scoring as any,
        position_id: positionId,
      } as any);
      handleClose();
    } catch (error) {
      console.error('Error saving KPI:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* Bottom Sheet */}
      <div 
        className={`relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-lg shadow-2xl transform transition-transform duration-300 ease-out ${
          isClosing ? 'translate-y-full sm:translate-y-10 sm:opacity-95' : 'translate-y-0'
        }`}
        style={{ maxHeight: '90vh' }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add New KPI
          </h3>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                KPI Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter KPI name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter KPI description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target
                </label>
                <input
                  type="text"
                  value={formData.target}
                  onChange={(e) => handleChange('target', e.target.value)}
                  placeholder="e.g., 50000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Weight (%)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  min={0}
                  max={100}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Scoring Type
                </label>
                <select
                  value={formData.scoring}
                  onChange={(e) => handleChange('scoring', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="percentage">Percentage</option>
                  <option value="count">Count</option>
                  <option value="value">Value</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {Object.entries(KPI_CATEGORIES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Position Info */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This KPI will be assigned to Position ID: <span className="font-medium text-gray-900 dark:text-white">{positionId}</span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl sm:rounded-lg">
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !formData.name.trim()}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? <LoadingIcon /> : null}
            {isSaving ? 'Saving...' : 'Add KPI'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit KPI Modal - Bottom Sheet Slide Up
function EditKpiModal({ 
  kpi, 
  onSave, 
  onCancel 
}: { 
  kpi: KpiMetric; 
  onSave: (kpi: KpiMetric) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<KpiMetric>({ ...kpi });
  const [isClosing, setIsClosing] = useState(false);

  const handleChange = (field: keyof KpiMetric, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onCancel();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* Bottom Sheet */}
      <div 
        className={`relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-lg shadow-2xl transform transition-transform duration-300 ease-out ${
          isClosing ? 'translate-y-full sm:translate-y-10 sm:opacity-95' : 'translate-y-0'
        }`}
        style={{ maxHeight: '90vh' }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit KPI
          </h3>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                KPI Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target
                </label>
                <input
                  type="text"
                  value={formData.target}
                  onChange={(e) => handleChange('target', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Baseline
                </label>
                <input
                  type="text"
                  value={formData.baseline}
                  onChange={(e) => handleChange('baseline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Weight (%)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', parseInt(e.target.value))}
                  min={0}
                  max={100}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="percent">Percent</option>
                  <option value="ZMW">ZMW</option>
                  <option value="count">Count</option>
                  <option value="days">Days</option>
                  <option value="hours">Hours</option>
                  <option value="score">Score</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {Object.entries(KPI_CATEGORIES).map(([key, val]: [string, any]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                KPI is Active
              </label>
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl sm:rounded-lg">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(formData);
              handleClose();
            }}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// KPI Settings Page
export default function KpiSettingsPage() {
  // Get user position synchronously without API calls to avoid over-polling
  const currentUserPosition = getUserPosition();
  const currentUserPositionId = getUserPositionId();
  const [selectedPosition, setSelectedPosition] = useState<PositionType>('Branch Manager');
  const [selectedPositionId, setSelectedPositionId] = useState<number>(5);
  const [kpis, setKpis] = useState<KpiMetric[]>([]);
  const [editingKpi, setEditingKpi] = useState<KpiMetric | null>(null);
  const [addingKpi, setAddingKpi] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize selected position from user data only once on mount
  useEffect(() => {
    if (!isInitialized) {
      const positionId = getUserPositionId();
      const positionName = getPositionNameByIdStatic(positionId);
      setSelectedPositionId(positionId);
      setSelectedPosition(positionName as PositionType);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Fetch KPIs from API when position changes (with caching)
  useEffect(() => {
    let isMounted = true;
    
    const fetchKpis = async () => {
      setIsLoading(true);
      try {
        // Fetch all KPIs (cached on server)
        const response = await fetch('/api/kpi/all');

        if (!isMounted) return;

        const data = await response.json();

        if (response.ok) {
          // Filter KPIs by selected position_id on client side
          const allKpis = Array.isArray(data) ? data : [];
          
          // Transform API data to KpiMetric format
          const transformedKpis: KpiMetric[] = allKpis
            .filter((kpi: any) => kpi.position_id === selectedPositionId)
            .map((kpi: any, index: number) => ({
              id: kpi.id?.toString() || `kpi-${index}`,
              name: kpi.name || '',
              description: kpi.description || '',
              category: (kpi.category || 'operational') as any,
              position: selectedPosition,
              target: kpi.target?.toString() || '',
              baseline: kpi.baseline?.toString() || '',
              weight: parseInt(kpi.weight) || 0,
              unit: 'percent',
              frequency: 'monthly',
              isActive: true,
              lastUpdated: new Date().toISOString().split('T')[0],
              createdBy: 'API',
            }));
          
          setKpis(transformedKpis);
        } else {
          // Fallback to local KPIs if API fails
          const localKpis = getKPIsByPosition(selectedPosition);
          setKpis(localKpis);
        }
      } catch (error) {
        console.error('Error fetching KPIs:', error);
        // Fallback to local KPIs on error
        const localKpis = getKPIsByPosition(selectedPosition);
        setKpis(localKpis);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (isInitialized) {
      fetchKpis();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedPositionId, selectedPosition, isInitialized]);

  // Show notification
  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Add new KPI via API
  const handleAddKpi = useCallback(async (kpiData: Partial<KpiMetric>) => {
    try {
      const response = await fetch('/api/kpi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 1,
          position_id: selectedPositionId,
          name: kpiData.name,
          description: kpiData.description,
          target: kpiData.target,
          category: kpiData.category,
          weight: kpiData.weight?.toString() || '10',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add the new KPI to the local state
        const newKpi: KpiMetric = {
          id: data.kpiId?.toString() || `kpi-${Date.now()}`,
          name: kpiData.name || '',
          description: kpiData.description || '',
          category: (kpiData.category as any) || 'operational',
          position: selectedPosition,
          target: kpiData.target?.toString() || '',
          baseline: '',
          weight: kpiData.weight || 10,
          unit: 'percent',
          frequency: 'monthly',
          isActive: true,
          lastUpdated: new Date().toISOString().split('T')[0],
          createdBy: 'API',
        };

        setKpis(prev => [...prev, newKpi]);
        showNotification('success', 'KPI added successfully');
      } else {
        showNotification('error', data.error || 'Failed to add KPI');
      }
    } catch (error) {
      console.error('Error adding KPI:', error);
      showNotification('error', 'Failed to add KPI');
    }
  }, [selectedPositionId, selectedPosition, showNotification]);

  // Toggle KPI active status
  const toggleKpiActive = useCallback((kpiId: string) => {
    setKpis(prev => prev.map(kpi => 
      kpi.id === kpiId 
        ? { ...kpi, isActive: !kpi.isActive, lastUpdated: new Date().toISOString().split('T')[0] }
        : kpi
    ));
    showNotification('success', 'KPI status updated successfully');
  }, [showNotification]);

  // Save edited KPI
  const handleSaveKpi = useCallback(async (updatedKpi: KpiMetric) => {
    try {
      const response = await fetch(`/api/kpi/${updatedKpi.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 1,
          position_id: selectedPositionId,
          name: updatedKpi.name,
          description: updatedKpi.description,
          target: updatedKpi.target,
          category: updatedKpi.category,
          weight: updatedKpi.weight.toString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the KPI in local state
        setKpis(prev => prev.map(kpi => 
          kpi.id === updatedKpi.id 
            ? { ...updatedKpi, lastUpdated: new Date().toISOString().split('T')[0] }
            : kpi
        ));
        setEditingKpi(null);
        showNotification('success', 'KPI updated successfully');
      } else {
        showNotification('error', data.error || 'Failed to update KPI');
      }
    } catch (error) {
      console.error('Error updating KPI:', error);
      showNotification('error', 'Failed to update KPI');
    }
  }, [selectedPositionId, showNotification]);

  // Delete KPI
  const handleDeleteKpi = useCallback(async (kpiId: string) => {
    if (!confirm('Are you sure you want to delete this KPI?')) {
      return;
    }

    try {
      const response = await fetch(`/api/kpi/${kpiId}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Remove the KPI from local state
        setKpis(prev => prev.filter(kpi => kpi.id !== kpiId));
        showNotification('success', 'KPI deleted successfully');
      } else {
        showNotification('error', data.error || 'Failed to delete KPI');
      }
    } catch (error) {
      console.error('Error deleting KPI:', error);
      showNotification('error', 'Failed to delete KPI');
    }
  }, [showNotification]);

  // Filter KPIs
  const filteredKpis = kpis.filter(kpi => {
    const matchesCategory = filterCategory === 'all' || kpi.category === filterCategory;
    const matchesActive = filterActive === 'all' || 
      (filterActive === 'active' && kpi.isActive) ||
      (filterActive === 'inactive' && !kpi.isActive);
    const matchesSearch = searchQuery === '' || 
      kpi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kpi.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesActive && matchesSearch;
  });

  // Calculate summary stats
  const totalWeight = kpis.filter(k => k.isActive).reduce((sum, k) => sum + k.weight, 0);
  const activeCount = kpis.filter(k => k.isActive).length;
  const totalCount = kpis.length;

  // Show loading only if KPIs are loading
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                KPI Metrics Settings
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Configure and manage Key Performance Indicators for all leadership positions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Logged in as: <span className="font-medium text-gray-900 dark:text-white">{currentUserPosition}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total KPIs</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Active KPIs</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{activeCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Inactive KPIs</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{totalCount - activeCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Weight</p>
            <p className={`text-3xl font-bold mt-2 ${
              totalWeight === 100 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {totalWeight}%
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Position Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Position
              </label>
              <select
                value={selectedPositionId}
                onChange={(e) => {
                  const newId = Number(e.target.value);
                  setSelectedPositionId(newId);
                  setSelectedPosition(getPositionNameByIdStatic(newId) as PositionType);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {AVAILABLE_POSITIONS.map((pos, index) => (
                  <option key={pos} value={index + 1}>{pos} (ID: {index + 1})</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {Object.entries(KPI_CATEGORIES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search KPIs..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            <span className="ml-3 text-gray-500 dark:text-gray-400">Loading KPIs...</span>
          </div>
        )}

        {/* KPI Table */}
        {!isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      KPI Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Weight
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredKpis.map((kpi) => (
                    <tr key={kpi.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {kpi.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {kpi.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CategoryBadge category={kpi.category} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {kpi.target || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {kpi.weight}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleKpiActive(kpi.id)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            kpi.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {kpi.isActive ? (
                            <>
                              <CheckIcon />
                              <span className="ml-1">Active</span>
                            </>
                          ) : (
                            <>
                              <XIcon />
                              <span className="ml-1">Inactive</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setEditingKpi(kpi)}
                          className="text-brand-500 hover:text-brand-600 dark:text-brand-400 mr-3"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDeleteKpi(kpi.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredKpis.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">No KPIs found matching your filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Add New KPI Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setAddingKpi(true)}
            className="inline-flex items-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            <PlusIcon />
            <span className="ml-2">Add New KPI</span>
          </button>
        </div>
      </div>

      {/* Add KPI Modal */}
      {addingKpi && (
        <AddKpiModal
          positionId={selectedPositionId}
          onSave={handleAddKpi}
          onCancel={() => setAddingKpi(false)}
        />
      )}

      {/* Edit KPI Modal */}
      {editingKpi && (
        <EditKpiModal
          kpi={editingKpi}
          onSave={handleSaveKpi}
          onCancel={() => setEditingKpi(null)}
        />
      )}
    </div>
  );
}
