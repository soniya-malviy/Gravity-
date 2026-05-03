import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { X, Bell, RefreshCw, AlertTriangle, Type } from 'lucide-react';

interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const { autoRefresh, setAutoRefresh, themeConfig, setThemeConfig } = useAppStore();
  const [localConfig, setLocalConfig] = useState(autoRefresh);

  const handleSave = () => {
    setAutoRefresh(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="glass w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in duration-300">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter">PLATFORM SETTINGS</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Configure monitoring and alerts</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Auto Refresh Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                  <RefreshCw className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Auto-Refresh</h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Keep data synchronized</p>
                </div>
              </div>
              <button 
                onClick={() => setLocalConfig({ ...localConfig, enabled: !localConfig.enabled })}
                className={`w-12 h-6 rounded-full transition-all relative ${localConfig.enabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${localConfig.enabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            
            {localConfig.enabled && (
              <div className="pl-11">
                <select 
                  value={localConfig.interval}
                  onChange={(e) => setLocalConfig({ ...localConfig, interval: parseInt(e.target.value) })}
                  className="bg-slate-900 text-white text-xs px-4 py-2 rounded-xl border border-white/5 outline-none focus:ring-1 focus:ring-indigo-500/50"
                >
                  <option value={30000}>Every 30 Seconds</option>
                  <option value={60000}>Every 1 Minute</option>
                  <option value={300000}>Every 5 Minutes</option>
                  <option value={900000}>Every 15 Minutes</option>
                </select>
              </div>
            )}
          </div>

          {/* Thresholds Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Quality Thresholds</h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Trigger alerts based on completeness</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pl-11">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Critical (%)</label>
                <input type="number" defaultValue={20} className="w-full bg-slate-900 text-white text-xs px-4 py-2 rounded-xl border border-white/5" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Warning (%)</label>
                <input type="number" defaultValue={50} className="w-full bg-slate-900 text-white text-xs px-4 py-2 rounded-xl border border-white/5" />
              </div>
            </div>
          </div>

          {/* Typography Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <Type className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Typography</h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Change platform font family</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pl-11">
              {[
                { name: 'Outfit', family: "'Outfit', sans-serif" },
                { name: 'Inter', family: "'Inter', sans-serif" },
                { name: 'Syne', family: "'Syne', sans-serif" },
                { name: 'Mono', family: "'JetBrains Mono', monospace" },
              ].map((font) => (
                <button
                  key={font.name}
                  onClick={() => setThemeConfig({ font: font.name })}
                  className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                    themeConfig.font === font.name 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                      : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10'
                  }`}
                  style={{ fontFamily: font.family }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications Section */}
        </div>

        <div className="p-8 bg-slate-900/50 border-t border-white/5 flex gap-4">
          <button
            onClick={handleSave}
            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl font-black uppercase tracking-widest border border-white/5 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
