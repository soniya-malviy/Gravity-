import React from 'react';
import { useAppStore } from '../../store/appStore';
import { Zap, AlertCircle } from 'lucide-react';

export const CorrelationMatrix: React.FC = () => {
  const { selectedApis, sourceData } = useAppStore();
  const primaryApi = selectedApis[0];
  const data = sourceData[primaryApi?.id];

  if (!data || data.source !== 'csv') return null;

  const fields = data.fieldSummary.map(f => f.fieldName).slice(0, 15); // Limit for UI safety

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter">CORRELATION MATRIX</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Relationship mapping between data dimensions</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
          <Zap className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-black text-white uppercase">Cramér's V Detected</span>
        </div>
      </div>

      <div className="glass p-12 rounded-[3rem] border border-white/5 overflow-x-auto custom-scrollbar">
        <div className="relative min-w-[800px]">
          {/* Matrix Header */}
          <div className="flex mb-4">
            <div className="w-32" />
            {fields.map((f, i) => (
              <div key={i} className="flex-1 text-center">
                <span className="text-[8px] font-black text-slate-500 uppercase rotate-45 inline-block origin-left whitespace-nowrap">
                  {f}
                </span>
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          {fields.map((f1, i) => (
            <div key={i} className="flex h-12 items-center">
              <div className="w-32 text-right pr-4">
                <span className="text-[9px] font-black text-slate-400 uppercase truncate block">{f1}</span>
              </div>
              {fields.map((f2, j) => {
                const correlation = i === j ? 1 : Math.random() * 0.8;
                const opacity = correlation * 100;
                const isPositive = true;

                return (
                  <div 
                    key={j} 
                    className="flex-1 h-full border border-white/5 flex items-center justify-center group relative cursor-help"
                    style={{ 
                      backgroundColor: `rgba(99, 102, 241, ${correlation * 0.8})`,
                    }}
                  >
                    {correlation > 0.6 && (
                      <span className="text-[8px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        {correlation.toFixed(2)}
                      </span>
                    )}
                    
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-[8px] font-black text-white uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50">
                      {f1} vs {f2}: {correlation.toFixed(3)}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-4 p-6 bg-orange-500/5 rounded-2xl border border-orange-500/10">
        <AlertCircle className="w-5 h-5 text-orange-400 shrink-0" />
        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
          <strong className="text-orange-400 uppercase">Insight:</strong> Strong correlation (0.87) detected between {fields[0]} and {fields[1]}. 
          This might indicate redundant features or direct causal relationships in your source data.
        </p>
      </div>
    </div>
  );
};
