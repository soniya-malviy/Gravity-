import React, { useState } from 'react';
import { useAppStore, type ApiConfig } from '../store/appStore';
import { Plus, X, Globe, Lock, Code, Layers } from 'lucide-react';

interface CustomApiPanelProps {
  onClose: () => void;
  editApiId?: string | null;
}

export const CustomApiPanel: React.FC<CustomApiPanelProps> = ({ onClose, editApiId }) => {
  const { addCustomApi, updateCustomApi, customApis } = useAppStore();
  
  const existingApi = React.useMemo(() => 
    editApiId ? customApis.find(a => a.id === editApiId) : null
  , [editApiId, customApis]);

  const [formData, setFormData] = useState({
    name: existingApi?.name || '',
    endpoint: existingApi?.endpoint || '',
    auth: existingApi?.auth || '',
    query: existingApi?.query || '',
    rootKey: existingApi?.rootKey || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingApi) {
      updateCustomApi(existingApi.id, {
        ...formData,
        auth: formData.auth || null,
      });
    } else {
      const newApi: ApiConfig = {
        id: `custom_${Date.now()}`,
        ...formData,
        auth: formData.auth || null,
        fields: [],
      };
      addCustomApi(newApi);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="glass w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in duration-300">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter">
              {existingApi ? 'MODIFY DATA SOURCE' : 'REGISTER CUSTOM SOURCE'}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
              {existingApi ? `Updating configuration for ${existingApi.name}` : 'Add user-defined GraphQL endpoint'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-3 h-3" /> Display Name
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Production Analytics"
                className="w-full bg-slate-900/50 text-white px-4 py-3 rounded-xl border border-white/5 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Lock className="w-3 h-3" /> Auth Token (Optional)
              </label>
              <input
                type="password"
                value={formData.auth}
                onChange={(e) => setFormData({ ...formData, auth: e.target.value })}
                placeholder="Bearer eyJhbGci..."
                className="w-full bg-slate-900/50 text-white px-4 py-3 rounded-xl border border-white/5 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-3 h-3" /> Endpoint URL
            </label>
            <input
              required
              type="url"
              value={formData.endpoint}
              onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
              placeholder="https://api.yourservice.com/graphql"
              className="w-full bg-slate-900/50 text-white px-4 py-3 rounded-xl border border-white/5 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-3 h-3" /> Root Data Key
              </label>
              <input
                required
                type="text"
                value={formData.rootKey}
                onChange={(e) => setFormData({ ...formData, rootKey: e.target.value })}
                placeholder="e.g. users or data.nodes"
                className="w-full bg-slate-900/50 text-white px-4 py-3 rounded-xl border border-white/5 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <div className="flex items-end">
              <p className="text-[10px] text-slate-500 italic">This is the path to the array of records in the GraphQL response.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Code className="w-3 h-3" /> GraphQL Query
            </label>
            <textarea
              required
              value={formData.query}
              onChange={(e) => setFormData({ ...formData, query: e.target.value })}
              placeholder="{ users { id name email } }"
              rows={4}
              className="w-full bg-slate-900/50 text-white px-4 py-3 rounded-xl border border-white/5 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-xs resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {existingApi ? 'UPDATE DATA SOURCE' : 'REGISTER DATA SOURCE'}
          </button>
        </form>
      </div>
    </div>
  );
};
