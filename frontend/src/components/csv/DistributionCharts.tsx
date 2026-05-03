import React, { useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { Activity, TrendingUp } from 'lucide-react';

export const DistributionCharts: React.FC = () => {
  const { selectedApis, sourceData } = useAppStore();
  const primaryApi = selectedApis[0];
  const data = sourceData[primaryApi?.id];

  const distributions = useMemo(() => {
    if (!data?.rawData) return [];

    return data.fieldSummary.map(field => {
      const values = data.rawData.map(row => row[field.fieldName]).filter(v => v !== null && v !== undefined);
      
      // Calculate frequencies
      const freqMap: Record<string, number> = {};
      values.forEach(v => {
        const key = String(v);
        freqMap[key] = (freqMap[key] || 0) + 1;
      });

      // Get top 10 values for the chart
      const sortedFreq = Object.entries(freqMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

      const maxFreq = Math.max(...sortedFreq.map(f => f[1]), 1);

      // Simple stats for numeric
      const numericValues = values.filter(v => typeof v === 'number') as number[];
      const mean = numericValues.length ? (numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(1) : 'N/A';
      
      return {
        fieldName: field.fieldName,
        type: field.type,
        data: sortedFreq,
        maxFreq,
        mean,
        count: values.length,
        unique: Object.keys(freqMap).length
      };
    });
  }, [data]);

  if (!data || data.source !== 'csv') {
    return (
      <div className="p-20 text-center space-y-4">
        <TrendingUp className="w-12 h-12 text-slate-700 mx-auto" />
        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Select a CSV source to view distributions</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">VALUE DISTRIBUTIONS</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Statistical spread across dataset dimensions</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {distributions.map((dist, i) => (
          <div key={i} className="glass p-8 rounded-[3rem] border border-white/5 space-y-8 hover:border-indigo-500/20 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-500/20 transition-all">
                  <Activity className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tighter">{dist.fieldName}</h3>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{dist.type}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{dist.unique} UNIQUE</span>
              </div>
            </div>

            <div className="h-56 flex items-end gap-2 px-2">
              {dist.data.length > 0 ? dist.data.map(([val, freq], bi) => (
                <div key={bi} className="flex-1 group/bar relative flex flex-col justify-end h-full">
                  <div 
                    className="w-full bg-indigo-500/40 group-hover/bar:bg-indigo-500/80 rounded-t-xl transition-all duration-500 relative"
                    style={{ height: `${(freq / dist.maxFreq) * 100}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 border border-white/10 px-2 py-1 rounded text-[8px] font-black text-white whitespace-nowrap z-10 shadow-2xl">
                      {val}: {freq}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="w-full h-full flex items-center justify-center border border-dashed border-white/5 rounded-2xl">
                  <span className="text-[10px] text-slate-600 font-black uppercase">No Data Patterns</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5 text-center">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Mean/Avg</p>
                <p className="text-sm font-black text-white">{dist.mean}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Density</p>
                <p className="text-sm font-black text-white">{((dist.count / (data.rawData.length || 1)) * 100).toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Entropy</p>
                <p className="text-sm font-black text-white">{(dist.unique / (dist.count || 1)).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
