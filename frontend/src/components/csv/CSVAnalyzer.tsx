import React, { useState } from 'react';
import { LayoutGrid, BarChart3, Grid3X3, Layers, FileText, ClipboardList, ArrowLeftRight } from 'lucide-react';
import { Heatmap } from '../Heatmap';
import { ColumnProfiles } from './ColumnProfiles';
import { DistributionCharts } from './DistributionCharts';
import { CorrelationMatrix } from './CorrelationMatrix';
import { MissingPatterns } from './MissingPatterns';
import { DataQualityReport } from './DataQualityReport';
import { ComparisonView } from './ComparisonView';
import { useAppStore } from '../../store/appStore';

export const CSVAnalyzer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('heatmap');
  const { selectedApis, sourceData } = useAppStore();
  
  const primaryApi = selectedApis[0];
  const data = sourceData[primaryApi?.id];

  if (!data || data.source !== 'csv') return <Heatmap />;

  const tabs = [
    { id: 'heatmap', label: 'Heatmap', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'profiles', label: 'Profiles', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'dist', label: 'Distribution', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'corr', label: 'Correlation', icon: <Grid3X3 className="w-4 h-4" /> },
    { id: 'missing', label: 'Missing Patterns', icon: <Layers className="w-4 h-4" /> },
    { id: 'report', label: 'Quality Report', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* CSV Tab Bar */}
      <div className="px-8 bg-slate-900/40 border-b border-white/5 flex items-center justify-between">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                activeTab === tab.id ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              )}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">CSV Source Active</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'heatmap' && <Heatmap hideToolbar={true} />}
        {activeTab === 'profiles' && <ColumnProfiles />}
        {activeTab === 'dist' && <DistributionCharts />}
        {activeTab === 'corr' && <CorrelationMatrix />}
        {activeTab === 'missing' && <MissingPatterns />}
        {activeTab === 'report' && <DataQualityReport />}
      </div>
    </div>
  );
};
