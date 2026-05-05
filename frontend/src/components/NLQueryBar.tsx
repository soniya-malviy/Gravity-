import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { FilterBuilder } from './FilterBuilder';
import axios from 'axios';
import { BACKEND_URL } from '../utils/graphqlFetcher';

export const NLQueryBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const { setApiLoading, isLoading, setNLResult, setError, schemaInfo, selectedApis, sourceData } = useAppStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || selectedApis.length === 0) return;

    setApiLoading('nl', true);
    try {
      const primaryApi = selectedApis[0];
      const data = sourceData[primaryApi.id];

      const response = await axios.post(`${BACKEND_URL}/ai/analyze`, {
        action: 'nl_query',
        context: {
          query,
          schema: schemaInfo,
          fieldSummary: data?.fieldSummary || [],
        }
      });

      setNLResult(response.data);
    } catch (err: any) {
      setError(`NL Search failed: ${err.message}`);
    } finally {
      setApiLoading('nl', false);
    }
  };

  return (
    <div className="px-6 py-4 glass border-b border-white/5 relative z-40">
      <form onSubmit={handleSearch} className="relative group max-w-5xl mx-auto">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-1000"></div>
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
            {isLoading.nl ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search datasets using natural language... (e.g. 'Show me sparse fields')"
            className="w-full bg-slate-900/50 text-white pl-12 pr-32 py-4 rounded-2xl border border-white/5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-900 transition-all placeholder:text-slate-600 font-medium text-sm"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button 
              type="submit"
              className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-[10px] font-black text-white rounded-lg transition-all uppercase tracking-widest"
            >
              Analyze
            </button>
          </div>
        </div>
      </form>
      <FilterBuilder />
    </div>
  );
};
