import React from 'react';
import { useAppStore } from '../store/appStore';
import { X, Database } from 'lucide-react';

export const FieldInspector: React.FC = () => {
  const { selectedCell, sourceData, selectCell } = useAppStore();

  if (!selectedCell) return null;

  const data = sourceData[selectedCell.apiId];
  const record = data ? data.rawData[selectedCell.row] : null;
  const value = record ? record[selectedCell.col] : null;

  return (
    <div className={`fixed inset-y-0 right-0 w-[400px] glass shadow-2xl border-l border-white/10 z-[100] transition-all duration-500 ease-in-out ${selectedCell ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Database className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tighter">DATA INSPECTOR</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedCell.apiId.split('_')[0].toUpperCase()} ANALYSIS</p>
          </div>
        </div>
        <button 
          onClick={() => selectCell('', -1, '')}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white group"
        >
          <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-80px)] custom-scrollbar">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Target Field</label>
          <div className="text-xl font-mono font-bold text-indigo-400 truncate">{selectedCell.col}</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Row Index</label>
            <div className="text-lg font-mono font-bold text-white">#{selectedCell.row}</div>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Record ID</label>
            <div className="text-lg font-mono font-bold text-white truncate">{record?.id || record?.code || record?.name || 'N/A'}</div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-3">Payload Analysis</label>
          <div className={`p-6 rounded-2xl font-mono text-xs break-all leading-relaxed ${value === null || value === undefined ? 'bg-red-500/5 text-red-400 border border-red-500/10' : 'bg-slate-800/50 text-green-400 border border-white/5'}`}>
            <pre className="whitespace-pre-wrap">
              {value === null || value === undefined ? '// NULL_POINTER_EXCEPTION\nValue is missing or undefined' : JSON.stringify(value, null, 2)}
            </pre>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative glass rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-2 text-indigo-400 mb-4">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Agent Insight</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium mb-6">
              This attribute shows {value === null ? 'critical sparsity' : 'valid data entry'}. 
              AI suggests {value === null ? 'verifying the resolver logic' : 'maintaining the current validation rules'}.
            </p>
            <button className="w-full py-3 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl shadow-white/5 active:scale-[0.98]">
              Automate Correction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
