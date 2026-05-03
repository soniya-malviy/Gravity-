import React from 'react';
import endpoints from '../config/endpoints.json';
import { useAppStore, type ApiConfig } from '../store/appStore';
import { fetchGraphQLData } from '../utils/graphqlFetcher';
import { RefreshCw, Zap, Plus, Trash2, CheckSquare, Square, Settings as SettingsIcon, FileText } from 'lucide-react';
import { CustomApiPanel } from './CustomApiPanel';
import { SettingsPanel } from './SettingsPanel';
import { CSVUploadPanel } from './CSVUploadPanel';

export const ConfigPanel: React.FC = () => {
  const { 
    selectedApis, 
    setSelectedApis, 
    toggleApiSelection, 
    setApiData, 
    setApiLoading, 
    setError, 
    isLoading, 
    customApis, 
    removeCustomApi,
    comparisonMode,
    setComparisonMode
  } = useAppStore();
  
  const [showCustomModal, setShowCustomModal] = React.useState(false);
  const allApis = [...endpoints.apis, ...customApis];

  const handleApiSelect = async (api: ApiConfig) => {
    if (!comparisonMode) {
      setSelectedApis([api]);
      await fetchData(api);
    } else {
      toggleApiSelection(api);
      if (!selectedApis.find(a => a.id === api.id)) {
        await fetchData(api);
      }
    }
  };

  const fetchData = async (api: ApiConfig) => {
    setApiLoading(api.id, true);
    setError(null);
    try {
      const response = await fetchGraphQLData(api.endpoint, api.query, api.auth);
      const keys = api.rootKey.split('.');
      let data = response.data;
      for (const key of keys) {
        data = data[key];
      }
      setApiData(api.id, data);
    } catch (err: any) {
      console.warn(`Fetch failed for ${api.name}, trying mock data fallback...`);
      if (api.id === 'spacex' || api.id === 'pokeapi') {
        const mockData = generateMockData(api.id);
        setApiData(api.id, mockData);
        setError(`${api.name} (LIVE) failed: ${err.message}. Showing mock data.`);
      } else {
        setError(`${api.name}: ${err.message}`);
      }
    } finally {
      setApiLoading(api.id, false);
    }
  };

  const generateMockData = (id: string) => {
    const records = [];
    for (let i = 0; i < 50; i++) {
      const record: any = { id: `mock_${i}` };
      const fields = id === 'spacex' ? ['mission_name', 'details', 'flight_number', 'launch_success'] : ['name', 'base_experience', 'height', 'weight'];
      fields.forEach(f => {
        record[f] = Math.random() > 0.2 ? `Value ${i}_${f}` : null;
      });
      records.push(record);
    }
    return records;
  };

  const isAnyLoading = Object.values(isLoading).some(v => v);

    const [showCSVModal, setShowCSVModal] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <div className="glass border-b border-white/5 p-4 flex items-center justify-between gap-4 sticky top-0 z-50 bg-[var(--sidebar)]/80">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.href = '/'}>
          <div className="p-2 bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/30 transition-all duration-500">
            <Zap className="w-6 h-6 text-indigo-500 fill-current" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-[var(--text)]">GRAVITY</h1>
        </div>
        
        <div className="h-10 w-[1px] bg-white/10" />

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setComparisonMode(!comparisonMode)}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all active:scale-95 ${comparisonMode ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/10' : 'bg-white/5 border-white/10 text-[var(--text-muted)]'}`}
            >
              {comparisonMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              <span className="text-[10px] font-black uppercase tracking-widest">Multi-Stream</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {allApis.slice(0, 5).map(api => (
              <button
                key={api.id}
                onClick={() => handleApiSelect(api)}
                className={`px-5 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all relative group active:scale-95 ${
                  selectedApis.find(a => a.id === api.id)
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/20'
                    : 'bg-[var(--bg-darker)] border-white/5 text-[var(--text-muted)] hover:border-white/20 hover:text-[var(--text)]'
                }`}
              >
                {api.name}
                {isLoading[api.id] && <RefreshCw className="w-3 h-3 animate-spin absolute -top-1 -right-1 text-indigo-400 bg-[var(--bg)] rounded-full" />}
              </button>
            ))}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCustomModal(true)}
                title="Add Custom API"
                className="flex items-center justify-center p-3 bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text)] rounded-2xl border border-white/5 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowCSVModal(true)}
                title="Upload CSV"
                className="flex items-center justify-center p-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-2xl border border-indigo-500/20 transition-all active:scale-95"
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowSettings(true)}
          className="p-3 bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text)] rounded-2xl border border-white/5 transition-all active:scale-95"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>

        <button
          onClick={() => selectedApis.forEach(api => fetchData(api))}
          disabled={selectedApis.length === 0 || isAnyLoading}
          className="flex items-center gap-3 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/30 active:scale-95 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isAnyLoading ? 'animate-spin' : ''}`} />
          Sync All
        </button>
      </div>

      {showCustomModal && <CustomApiPanel onClose={() => setShowCustomModal(false)} />}
      {showCSVModal && <CSVUploadPanel onClose={() => setShowCSVModal(false)} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
};
