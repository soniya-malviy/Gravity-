import React, { useState } from 'react';
import { useAppStore, type FilterState } from '../store/appStore';
import { Filter, Plus, X, ChevronDown, ChevronUp, Check } from 'lucide-react';

export const FilterBuilder: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeFilters, setFilters, sourceData, selectedApis } = useAppStore();
  
  const allFields = React.useMemo(() => {
    const fields = new Set<string>();
    selectedApis.forEach(api => {
      sourceData[api.id]?.densityMatrix?.fieldNames.forEach(f => fields.add(f));
    });
    return Array.from(fields).sort();
  }, [selectedApis, sourceData]);

  const [localFilters, setLocalFilters] = useState<FilterState>(activeFilters || {
    fields: [],
    minCompleteness: 0,
    recordFilter: ''
  });

  const handleApply = () => {
    setFilters(localFilters);
    setIsOpen(false);
  };

  const toggleField = (field: string) => {
    const updatedFields = localFilters.fields.includes(field)
      ? localFilters.fields.filter(f => f !== field)
      : [...localFilters.fields, field];
    setLocalFilters({ ...localFilters, fields: updatedFields });
  };

  return (
    <div className="max-w-5xl mx-auto mt-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
      >
        <Filter className="w-3 h-3" />
        {isOpen ? 'Hide' : 'Show'} Filter Builder
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {isOpen && (
        <div className="mt-4 glass p-8 rounded-[2rem] border border-white/5 shadow-2xl animate-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Target Fields</label>
                <div className="flex gap-2">
                   <button onClick={() => setLocalFilters({...localFilters, fields: allFields})} className="text-[8px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300">Select All</button>
                   <button onClick={() => setLocalFilters({...localFilters, fields: []})} className="text-[8px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-400">Clear</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                {allFields.map(field => (
                  <button
                    key={field}
                    onClick={() => toggleField(field)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-[10px] font-bold transition-all ${
                      localFilters.fields.includes(field)
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-white'
                        : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
                    }`}
                  >
                    <span className="truncate">{field}</span>
                    {localFilters.fields.includes(field) && <Check className="w-3 h-3 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Min Completeness</label>
                  <span className="text-xs font-black text-indigo-400">{localFilters.minCompleteness}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={localFilters.minCompleteness}
                  onChange={(e) => setLocalFilters({ ...localFilters, minCompleteness: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Record Filter (Regex/String)</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={localFilters.recordFilter}
                    onChange={(e) => setLocalFilters({ ...localFilters, recordFilter: e.target.value })}
                    placeholder="Filter by ID or specific values..."
                    className="w-full bg-slate-900/50 text-white px-4 py-3 rounded-xl border border-white/5 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-xs"
                  />
                  {localFilters.recordFilter && (
                    <button onClick={() => setLocalFilters({...localFilters, recordFilter: ''})} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleApply}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => setLocalFilters({ fields: [], minCompleteness: 0, recordFilter: '' })}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest border border-white/5 transition-all"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
