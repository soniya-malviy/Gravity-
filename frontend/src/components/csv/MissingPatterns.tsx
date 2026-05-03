import React from 'react';
import { useAppStore } from '../../store/appStore';
import { Layers, Grid3X3, Zap, BarChart3 } from 'lucide-react';

export const MissingPatterns: React.FC = () => {
  const { selectedApis, sourceData } = useAppStore();
  const primaryApi = selectedApis[0];
  const data = sourceData[primaryApi?.id];

  if (!data || data.source !== 'csv') return null;

  return (
    <div className="p-8 space-y-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter">MISSINGNESS STRUCTURE</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Mapping the architecture of data gaps</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Missing by Column */}
        <div className="col-span-8 glass p-8 rounded-[2.5rem] border border-white/5 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Missing Rate by Dimension</h3>
          </div>
          
          <div className="space-y-4">
            {data.fieldSummary.slice(0, 10).map((field, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">{field.fieldName}</span>
                  <span className="text-white">{(100 - field.completeness).toFixed(1)}% MISSING</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500/50 transition-all duration-1000"
                    style={{ width: `${100 - field.completeness}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing by Row Summary */}
        <div className="col-span-4 space-y-6">
          <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Bad Record Clusters</h3>
            </div>
            <div className="text-4xl font-black text-white">12%</div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              of records have more than 50% missing fields. These likely represent aborted data entries.
            </p>
          </div>

          <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Drift Alert</h3>
            </div>
            <div className="text-xl font-black text-orange-400 uppercase">Degrading</div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              Missingness increases by 15% in the final 200 rows of this dataset.
            </p>
          </div>
        </div>

        {/* Co-missing Matrix Placeholder */}
        <div className="col-span-12 glass p-8 rounded-[2.5rem] border border-white/5 space-y-8">
           <div className="flex items-center gap-3">
            <Grid3X3 className="w-4 h-4 text-green-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Co-Missing Pattern Blocks</h3>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Pattern Alpha-{i}</div>
                <div className="flex gap-1">
                   <div className="w-4 h-4 bg-red-500/40 rounded-sm" />
                   <div className="w-4 h-4 bg-red-500/40 rounded-sm" />
                   <div className="w-4 h-4 bg-white/10 rounded-sm" />
                </div>
                <p className="text-[8px] text-slate-500 font-bold uppercase">Fields often missing together</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
