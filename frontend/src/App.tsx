import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ConfigPanel } from './components/ConfigPanel';
import { Heatmap } from './components/Heatmap';
import { AlertPanel } from './components/AlertPanel';
import { NLQueryBar } from './components/NLQueryBar';
import { FieldInspector } from './components/FieldInspector';
import { DashboardHome } from './components/DashboardHome';
import { AgentChatPanel } from './components/AgentChatPanel';
import { CSVAnalyzer } from './components/csv/CSVAnalyzer';
import { Footer } from './components/Footer';
import { useAppStore } from './store/appStore';
import { orchestrator } from './agents/orchestrator';
import { LayoutGrid, Home, BarChart3, Settings, Database, Sun, Moon } from 'lucide-react';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sourceData, error, selectedApis, theme, setTheme } = useAppStore();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  const analyzedApis = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    selectedApis.forEach(api => {
      const data = sourceData[api.id];
      if (data && data.rawData.length > 0 && !analyzedApis.current.has(api.id)) {
        orchestrator.onDataLoad(api.id, data.rawData);
        analyzedApis.current.add(api.id);
      }
    });

    const selectedIds = new Set(selectedApis.map(a => a.id));
    analyzedApis.current.forEach(id => {
      if (!selectedIds.has(id)) {
        analyzedApis.current.delete(id);
      }
    });
  }, [sourceData, selectedApis]);

  const isAnalyzePage = location.pathname === '/analyze';
  const { themeConfig } = useAppStore();

  const fontFamilies: Record<string, string> = {
    'Outfit': "'Outfit', sans-serif",
    'Inter': "'Inter', sans-serif",
    'Syne': "'Syne', sans-serif",
    'Mono': "'JetBrains Mono', monospace"
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans" style={{ fontFamily: fontFamilies[themeConfig.font] }}>
      <style>{`
        body { font-family: ${fontFamilies[themeConfig.font]} !important; }
        h1, h2, h3, h4, h5, h6 { font-family: ${fontFamilies[themeConfig.font]} !important; }
      `}</style>
      {/* Sidebar Navigation */}
      <aside className="w-24 bg-[#030712] border-r border-white/5 flex flex-col items-center py-10 gap-10 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <Link to="/" className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-2xl shadow-indigo-500/30 active:scale-95 transition-all">
          <Database className="w-8 h-8 text-white" />
        </Link>
        
        <nav className="flex-1 flex flex-col gap-6">
          <Link 
            to="/" 
            className={`p-5 rounded-[1.25rem] transition-all relative group ${location.pathname === '/' ? 'bg-white/5 text-indigo-400 shadow-[inset_0_0_12px_rgba(99,102,241,0.1)]' : 'text-slate-600 hover:text-slate-300'}`}
            title="Dashboard Home"
          >
            <Home className="w-7 h-7" />
            {location.pathname === '/' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />}
          </Link>
          <Link 
            to="/analyze" 
            className={`p-5 rounded-[1.25rem] transition-all relative group ${location.pathname === '/analyze' ? 'bg-white/5 text-indigo-400 shadow-[inset_0_0_12px_rgba(99,102,241,0.1)]' : 'text-slate-600 hover:text-slate-300'}`}
            title="Data Analyzer"
          >
            <LayoutGrid className="w-7 h-7" />
            {location.pathname === '/analyze' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />}
          </Link>
          <button className="p-5 rounded-[1.25rem] text-slate-700 hover:text-slate-300 transition-all hover:bg-white/5">
            <BarChart3 className="w-7 h-7" />
          </button>
        </nav>

        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-5 rounded-[1.25rem] text-slate-700 hover:text-slate-300 transition-all hover:bg-white/5 mb-4"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-7 h-7 text-orange-400" /> : <Moon className="w-7 h-7 text-indigo-500" />}
        </button>

        <button className="p-5 rounded-[1.25rem] text-slate-700 hover:text-slate-300 transition-all hover:bg-white/5 mb-4">
          <Settings className="w-7 h-7" />
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isAnalyzePage && <ConfigPanel />}
        
        <main className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 overflow-auto relative custom-scrollbar">
            {error && (
              <div className="m-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                {error}
              </div>
            )}
            {children}
          </div>
          
          {isAnalyzePage && <AlertPanel />}
        </main>

      <Footer />
      </div>

      {isAnalyzePage && <FieldInspector />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/analyze" element={<CSVAnalyzer />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default App;
