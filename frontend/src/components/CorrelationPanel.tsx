import React from 'react';
import { useAppStore } from '../store/appStore';
import { Link2, ZapOff } from 'lucide-react';

export const CorrelationPanel: React.FC = () => {
  const { selectedApis, sourceData } = useAppStore();

  const allCorrelations = selectedApis.flatMap(api => {
    const data = sourceData[api.id];
    return (data?.correlations || []).map(c => ({ ...c, apiName: api.name }));
  });

  if (allCorrelations.length === 0) return null;

  return (
    <div className="mt-8 glass p-8 rounded-[2rem] border border-white/5 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-white tracking-tighter">FIELD CORRELATIONS</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Co-null Pattern Analysis</p>
        </div>
        <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
          <ZapOff className="w-5 h-5 text-orange-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allCorrelations.slice(0, 9).map((corr, i) => (
          <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-orange-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{corr.apiName}</span>
              <span className="text-[10px] font-black text-orange-400">{(corr.correlation * 100).toFixed(0)}% Match</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 text-xs font-mono font-bold text-white truncate">{corr.fieldA}</div>
              <Link2 className="w-4 h-4 text-slate-600 group-hover:text-orange-500 transition-colors" />
              <div className="flex-1 text-xs font-mono font-bold text-white truncate text-right">{corr.fieldB}</div>
            </div>
            <div className="mt-3 h-1 w-full bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all duration-1000" 
                style={{ width: `${corr.correlation * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {allCorrelations.length > 9 && (
        <p className="mt-4 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          + {allCorrelations.length - 9} more patterns detected
        </p>
      )}
    </div>
  );
};
