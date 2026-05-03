import { create } from 'zustand';
import { computeDensityMatrix, computeFieldSummary, clusterRecords, type DensityMatrix, type FieldSummary, computeFieldCorrelation } from '../utils/densityEngine';

export interface ApiConfig {
  id: string;
  name: string;
  endpoint: string;
  auth: string | null;
  query: string;
  rootKey: string;
  fields: string[];
}

export interface Anomaly {
  field: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestion: string;
}

export interface FilterState {
  fields: string[];
  minCompleteness: number;
  recordFilter: string;
}

export interface NLQueryResult {
  filters: FilterState;
  explanation: string;
}

export interface MultiSourceData {
  apiId: string;
  rawData: any[];
  densityMatrix: DensityMatrix | null;
  fieldSummary: FieldSummary[];
  correlations: { fieldA: string, fieldB: string, correlation: number }[];
  source: 'graphql' | 'csv';
}

export interface Snapshot {
  timestamp: number;
  apiId: string;
  fieldCompleteness: Record<string, number>;
}

export interface RecentUpload {
  fileName: string;
  uploadTime: number;
  rowCount: number;
  columnCount: number;
  healthScore: number;
}

interface AppState {
  selectedApis: ApiConfig[];
  customApis: ApiConfig[];
  sourceData: Record<string, MultiSourceData>;
  anomalies: Anomaly[];
  healthScore: number;
  isLoading: Record<string, boolean>;
  error: string | null;
  activeFilters: FilterState | null;
  selectedCell: { apiId: string; row: number; col: string } | null;
  schemaInfo: string;
  nlQuery: string;
  nlResult: NLQueryResult | null;
  comparisonMode: boolean;
  displayMode: 'density' | 'cluster' | 'type' | 'anomaly';
  snapshots: Record<string, Snapshot[]>;
  autoRefresh: { enabled: boolean; interval: number; lastRefresh: number };
  recentUploads: RecentUpload[];
  themeConfig: { font: string };
  theme: 'dark' | 'light';
  
  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  setThemeConfig: (config: { font: string }) => void;
  setAutoRefresh: (config: { enabled: boolean; interval: number }) => void;
  setDisplayMode: (mode: 'density' | 'cluster' | 'type' | 'anomaly') => void;
  setSelectedApis: (apis: ApiConfig[]) => void;
  toggleApiSelection: (api: ApiConfig) => void;
  setComparisonMode: (enabled: boolean) => void;
  addCustomApi: (api: ApiConfig) => void;
  updateCustomApi: (id: string, api: Partial<ApiConfig>) => void;
  removeCustomApi: (id: string) => void;
  setApiData: (apiId: string, data: any[], source?: 'graphql' | 'csv') => void;
  setApiLoading: (apiId: string, loading: boolean) => void;
  setError: (error: string | null) => void;
  setAnomalies: (anomalies: Anomaly[]) => void;
  setHealthScore: (score: number) => void;
  setSchemaInfo: (info: string) => void;
  setFilters: (filters: FilterState | null) => void;
  selectCell: (apiId: string, row: number, col: string) => void;
  setNLQuery: (query: string) => void;
  setNLResult: (result: NLQueryResult) => void;
  clearFilters: () => void;
  addRecentUpload: (upload: RecentUpload) => void;
  clearRecentUploads: () => void;
}

const getStoredCustomApis = (): ApiConfig[] => {
  try {
    const stored = localStorage.getItem('gravity_custom_apis');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const getStoredSnapshots = (): Record<string, Snapshot[]> => {
  try {
    const stored = localStorage.getItem('gravity_snapshots');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const getStoredRecentUploads = (): RecentUpload[] => {
  try {
    const stored = localStorage.getItem('gravity_recent_uploads');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const useAppStore = create<AppState>((set) => ({
  selectedApis: [],
  customApis: getStoredCustomApis(),
  sourceData: {},
  anomalies: [],
  healthScore: 100,
  isLoading: {},
  error: null,
  activeFilters: null,
  selectedCell: null,
  schemaInfo: 'v1.0.0-PROD',
  nlQuery: '',
  nlResult: null,
  comparisonMode: false,
  displayMode: 'density',
  snapshots: getStoredSnapshots(),
  autoRefresh: { enabled: false, interval: 60000, lastRefresh: Date.now() },
  recentUploads: getStoredRecentUploads(),
  themeConfig: { font: localStorage.getItem('gravity_font') || 'Outfit' },
  theme: (localStorage.getItem('gravity_theme') as 'dark' | 'light') || 'dark',

  setTheme: (theme) => {
    localStorage.setItem('gravity_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme: theme });
  },

  setThemeConfig: (config) => {
    localStorage.setItem('gravity_font', config.font);
    set({ themeConfig: config });
  },

  setAutoRefresh: (config) => set((state) => ({ 
    autoRefresh: { ...state.autoRefresh, ...config, lastRefresh: Date.now() } 
  })),

  setDisplayMode: (mode) => set({ displayMode: mode }),

  setSelectedApis: (apis) => set({ selectedApis: apis }),
  
  toggleApiSelection: (api) => set((state) => {
    const exists = state.selectedApis.find(a => a.id === api.id);
    const updated = exists 
      ? state.selectedApis.filter(a => a.id !== api.id)
      : [...state.selectedApis, api];
    return { selectedApis: updated };
  }),

  setComparisonMode: (enabled) => set({ comparisonMode: enabled }),

  addCustomApi: (api) => set((state) => {
    const updated = [...state.customApis, api];
    localStorage.setItem('gravity_custom_apis', JSON.stringify(updated));
    return { customApis: updated };
  }),

  updateCustomApi: (id, api) => set((state) => {
    const updated = state.customApis.map(a => a.id === id ? { ...a, ...api } : a);
    localStorage.setItem('gravity_custom_apis', JSON.stringify(updated));
    return { customApis: updated };
  }),

  removeCustomApi: (id) => set((state) => {
    const updated = state.customApis.filter(a => a.id !== id);
    localStorage.setItem('gravity_custom_apis', JSON.stringify(updated));
    return { customApis: updated };
  }),

  setApiData: (apiId, data, source = 'graphql') => {
    let matrix = computeDensityMatrix(data);
    matrix = clusterRecords(matrix);
    const summary = computeFieldSummary(data);
    const correlations = computeFieldCorrelation(matrix);
    
    // Create snapshot
    const fieldCompleteness: Record<string, number> = {};
    summary.forEach(s => fieldCompleteness[s.fieldName] = s.completeness);
    const snapshot: Snapshot = { timestamp: Date.now(), apiId, fieldCompleteness };

    set((state) => {
      const apiSnapshots = state.snapshots[apiId] || [];
      const updatedSnapshots = [...apiSnapshots, snapshot].slice(-20); // Keep last 20
      const newSnapshots = { ...state.snapshots, [apiId]: updatedSnapshots };
      localStorage.setItem('gravity_snapshots', JSON.stringify(newSnapshots));

      return {
        snapshots: newSnapshots,
        autoRefresh: { ...state.autoRefresh, lastRefresh: Date.now() },
        sourceData: {
          ...state.sourceData,
          [apiId]: { apiId, rawData: data, densityMatrix: matrix, fieldSummary: summary, correlations, source }
        }
      };
    });
  },

  setApiLoading: (apiId, loading) => set((state) => ({
    isLoading: { ...state.isLoading, [apiId]: loading }
  })),

  setError: (error) => set({ error }),
  setAnomalies: (anomalies) => set({ anomalies }),
  setHealthScore: (score) => set({ healthScore: score }),
  setSchemaInfo: (info) => set({ schemaInfo: info }),
  setFilters: (filters) => set({ activeFilters: filters }),
  selectCell: (apiId, row, col) => set({ selectedCell: row === -1 ? null : { apiId, row, col } }),
  setNLQuery: (query) => set({ nlQuery: query }),
  setNLResult: (result) => set({ 
    nlResult: result,
    activeFilters: result ? result.filters : null 
  }),
  clearFilters: () => set({ activeFilters: null, nlResult: null, nlQuery: '' }),
  
  addRecentUpload: (upload) => set((state) => {
    const updated = [upload, ...state.recentUploads.filter(u => u.fileName !== upload.fileName)].slice(0, 5);
    localStorage.setItem('gravity_recent_uploads', JSON.stringify(updated));
    return { recentUploads: updated };
  }),
  
  clearRecentUploads: () => set(() => {
    localStorage.removeItem('gravity_recent_uploads');
    return { recentUploads: [] };
  })
}));
