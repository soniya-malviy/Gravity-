import React from 'react';
import { useAppStore } from '../../store/appStore';
import { ArrowRight, ArrowLeftRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const ComparisonView: React.FC = () => {
  const { selectedApis, sourceData } = useAppStore();

  if (selectedApis.length < 2) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4 py-20">
        <ArrowLeftRight className="w-12 h-12 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Select two datasets to enable comparison</p>
      </div>
    );
  }

  const apiA = selectedApis[0];
  const apiB = selectedApis[1];
  const dataA = sourceData[apiA.id];
  const dataB = sourceData[apiB.id];

  if (!dataA || !dataB) return null;

  // Match columns by name
  const allFields = Array.from(new Set([
    ...dataA.fieldSummary.map(f => f.fieldName),
    ...dataB.fieldSummary.map(f => f.fieldName)
  ])).sort();

  return (
    <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter">CROSS-SOURCE COMPARISON</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
            Comparing {apiA.name} vs {apiB.name}
          </p>
        </div>
      </div>

      <div className="glass rounded-[3rem] border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <th className="px-8 py-6 text-left">Dimension</th>
              <th className="px-8 py-6 text-center">{apiA.name}</th>
              <th className="px-8 py-6 text-center">Delta</th>
              <th className="px-8 py-6 text-center">{apiB.name}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {allFields.map((field, i) => {
              const compA = dataA.fieldSummary.find(f => f.fieldName === field)?.completeness || 0;
              const compB = dataB.fieldSummary.find(f => f.fieldName === field)?.completeness || 0;
              const delta = compB - compA;

              return (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-4">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">{field}</span>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className="text-xs font-black text-slate-400">{compA.toFixed(1)}%</span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {delta > 0 ? <TrendingUp className="w-3 h-3 text-green-400" /> : 
                       delta < 0 ? <TrendingDown className="w-3 h-3 text-red-400" /> : 
                       <Minus className="w-3 h-3 text-slate-600" />}
                      <span className={`text-[10px] font-black ${
                        delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-slate-600'
                      }`}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className="text-xs font-black text-white">{compB.toFixed(1)}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
