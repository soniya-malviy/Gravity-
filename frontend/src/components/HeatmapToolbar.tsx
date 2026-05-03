import React from 'react';
import { useAppStore } from '../store/appStore';
import { LayoutGrid, Share2, Type, AlertTriangle, Pin, Download, Maximize2, FileText } from 'lucide-react';

export const HeatmapToolbar: React.FC = () => {
  const { displayMode, setDisplayMode, selectedApis, sourceData } = useAppStore();

  const stats = React.useMemo(() => {
    let records = 0;
    let fields = 0;
    let totalCells = 0;
    let presentCells = 0;

    selectedApis.forEach(api => {
      const data = sourceData[api.id];
      if (data?.densityMatrix) {
        records += data.densityMatrix.rows.length;
        fields += data.densityMatrix.fieldNames.length;
        data.densityMatrix.rows.forEach(row => {
          totalCells += row.length;
          presentCells += row.filter(c => c.value === 1).length;
        });
      }
    });

    return {
      records,
      fields,
      completeness: totalCells > 0 ? ((presentCells / totalCells) * 100).toFixed(1) : '0.0'
    };
  }, [selectedApis, sourceData]);

  return (
    <div className="flex items-center justify-between mb-6 glass p-2 px-6 rounded-2xl border border-white/5">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDisplayMode('density')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${displayMode === 'density' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5'}`}
        >
          <LayoutGrid className="w-3 h-3" /> Density
        </button>
        <button
          onClick={() => setDisplayMode('cluster')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${displayMode === 'cluster' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:bg-white/5'}`}
        >
          <Share2 className="w-3 h-3" /> Cluster
        </button>
        <button
          onClick={() => setDisplayMode('type')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${displayMode === 'type' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-white/5'}`}
        >
          <Type className="w-3 h-3" /> Value Type
        </button>
        <button
          onClick={() => setDisplayMode('anomaly')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${displayMode === 'anomaly' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:bg-white/5'}`}
        >
          <AlertTriangle className="w-3 h-3" /> Anomaly
        </button>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-xs font-black text-white">{stats.records}</div>
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Records</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-black text-white">{stats.fields}</div>
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Fields</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-black text-indigo-400">{stats.completeness}%</div>
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Completeness</div>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-white/10" />

        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-white transition-colors" title="Pin Columns"><Pin className="w-4 h-4" /></button>
          <button className="p-2 text-slate-400 hover:text-white transition-colors" title="Export CSV"><Download className="w-4 h-4" /></button>
          <button className="p-2 text-slate-400 hover:text-white transition-colors" title="Generate Report"><FileText className="w-4 h-4" /></button>
          <button className="p-2 text-slate-400 hover:text-white transition-colors" title="Fullscreen"><Maximize2 className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};
