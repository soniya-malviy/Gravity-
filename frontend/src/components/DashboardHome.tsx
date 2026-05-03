import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useNavigate } from 'react-router-dom';
import endpoints from '../config/endpoints.json';
import { ShieldCheck, Zap, ArrowRight, Server, Clock, Plus, Activity, Edit2, Trash2, Globe, Database, Cpu } from 'lucide-react';
import { CustomApiPanel } from './CustomApiPanel';
import { CSVUploadPanel } from './CSVUploadPanel';

export const DashboardHome: React.FC = () => {
  const { customApis, removeCustomApi, snapshots, healthScore, setSelectedApis } = useAppStore();
  const navigate = useNavigate();
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [editApiId, setEditApiId] = useState<string | null>(null);
  const [showCSVModal, setShowCSVModal] = useState(false);

  const allApis = [...endpoints.apis, ...customApis];

  const handleApiSelect = (api: any) => {
    setSelectedApis([api]);
    navigate('/analyze');
  };

  const stats = [
    { label: 'Active Endpoints', value: allApis.length, icon: <Globe className="w-5 h-5 text-blue-400" />, color: 'blue' },
    { label: 'System Health', value: `${healthScore.toFixed(0)}%`, icon: <Activity className="w-5 h-5 text-emerald-400" />, color: 'emerald' },
    { label: 'Total Snapshots', value: Object.keys(snapshots).length, icon: <Clock className="w-5 h-5 text-purple-400" />, color: 'purple' },
    { label: 'Engine Load', value: '0.4ms', icon: <Cpu className="w-5 h-5 text-orange-400" />, color: 'orange' },
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--bg)] p-8 lg:p-12 space-y-12">
      {/* Hero Section */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur opacity-20 group-hover:opacity-30 transition-all" />
        <div className="relative glass p-12 lg:p-16 rounded-[3rem] border border-white/5 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Gravity Engine v4.0 Active</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none">
              OBSERVE <br /> <span className="text-indigo-500">EVERY DIMENSION.</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium max-w-xl leading-relaxed">
              Autonomous data observability for high-throughput GraphQL and CSV streams. Detect drift, anomalies, and schema violations in real-time.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => setShowCSVModal(true)}
                className="px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center gap-3"
              >
                <Plus className="w-5 h-5" /> Upload Dataset
              </button>
              <button 
                onClick={() => setShowCustomModal(true)}
                className="px-8 py-4 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-[1.5rem] font-black uppercase tracking-widest border border-indigo-500/20 transition-all active:scale-95 flex items-center gap-3"
              >
                <Server className="w-5 h-5" /> Register API
              </button>
            </div>
          </div>
          
          <div className="hidden lg:grid grid-cols-2 gap-4 w-full max-w-md">
            {stats.map((stat, i) => (
              <div key={i} className="glass p-6 rounded-[2rem] border border-white/5 space-y-3 hover:border-white/10 transition-all">
                <div className={`p-3 bg-${stat.color}-500/10 rounded-xl inline-block`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-black text-white tracking-tighter">{stat.value}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Available Telemetry Sources</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Select a source to begin deep-dive analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {allApis.map((api) => (
            <div 
              key={api.id}
              onClick={() => handleApiSelect(api)}
              className="card-premium group p-10 rounded-[3rem] cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors">
                <Database className="w-32 h-32 -mr-8 -mt-8 rotate-12" />
              </div>

              <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div className="flex items-start justify-between">
                  <div className={`p-5 rounded-3xl ${api.id.startsWith('custom_') ? 'bg-purple-500/10 text-purple-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                    {api.id.startsWith('custom_') ? <Zap className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                  </div>
                  {api.id.startsWith('custom_') && (
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-purple-500/20">Custom User Source</span>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tighter leading-tight group-hover:text-indigo-400 transition-colors">{api.name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate mt-1">{api.endpoint}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    {api.id.startsWith('custom_') ? (
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditApiId(api.id);
                            setShowCustomModal(true);
                          }}
                          className="p-3 bg-white/5 hover:bg-indigo-600/20 rounded-xl text-slate-400 hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-500/30"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Erase this data stream?')) removeCustomApi(api.id);
                          }}
                          className="p-3 bg-white/5 hover:bg-red-500/20 rounded-xl text-slate-400 hover:text-red-400 transition-all border border-transparent hover:border-red-500/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-indigo-500" />
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Active Monitoring</span>
                      </div>
                    )}
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all shadow-xl shadow-indigo-500/40">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Empty State Card */}
          <div 
            onClick={() => setShowCustomModal(true)}
            className="border-2 border-dashed border-white/5 hover:border-indigo-500/30 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-6 transition-all group cursor-pointer bg-white/[0.01]"
          >
            <div className="p-6 bg-slate-900/50 rounded-full group-hover:bg-indigo-500 group-hover:text-white transition-all text-slate-600">
              <Plus className="w-10 h-10" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter group-hover:text-white transition-colors">Register New Source</h3>
              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">Add custom GraphQL endpoints</p>
            </div>
          </div>
        </div>
      </div>
      
      {showCustomModal && (
        <CustomApiPanel 
          editApiId={editApiId}
          onClose={() => {
            setShowCustomModal(false);
            setEditApiId(null);
          }} 
        />
      )}
      {showCSVModal && (
        <CSVUploadPanel 
          onClose={() => {
            setShowCSVModal(false);
          }} 
        />
      )}
    </div>
  );
};
