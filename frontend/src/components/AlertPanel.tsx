import React from 'react';
import { useAppStore } from '../store/appStore';
import { ShieldCheck, Activity, AlertCircle, Info, Zap } from 'lucide-react';

export const AlertPanel: React.FC = () => {
  const { anomalies, healthScore } = useAppStore();

  return (
    <div className="w-80 border-l border-white/5 flex flex-col bg-slate-900/20 backdrop-blur-md">
      <div className="p-6 border-b border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Platform Health</h2>
          <Zap className="w-4 h-4 text-indigo-400 fill-current animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-5xl font-black text-white tracking-tighter">{healthScore.toFixed(0)}%</span>
            <span className="text-[10px] font-black text-green-400 uppercase tracking-widest pb-2">Optimal</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
              style={{ width: `${healthScore}%` }} 
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Anomalies</h3>
          <span className="px-2 py-1 bg-slate-800 text-white text-[10px] font-black rounded-lg">{anomalies.length}</span>
        </div>

        {anomalies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-50">
            <ShieldCheck className="w-12 h-12 text-green-500/20" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
              No structural anomalies<br/>detected in current data
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {anomalies.map((anomaly, i) => (
              <div key={i} className="glass p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all space-y-3 group">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    anomaly.severity === 'critical' ? 'bg-red-500/10 text-red-400' : 
                    anomaly.severity === 'warning' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {anomaly.severity === 'critical' ? <AlertCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-wider mb-1">{anomaly.field}</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{anomaly.message}</p>
                  </div>
                </div>
                <div className="pl-9 text-[9px] font-bold text-indigo-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Fix: {anomaly.suggestion}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5">
        <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-2 bg-indigo-500/20 rounded-xl">
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-[10px] font-black text-white uppercase tracking-widest">Real-time Feed</div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Monitoring active...</div>
          </div>
        </div>
      </div>
    </div>
  );
};
