import React, { useState, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { parseCSV, normalizeCSVToMatrix, type ParseResult } from '../utils/csvParser';
import { sampleDatasets } from '../data/sampleDatasets';
import { Upload, FileText, X, Settings2, BarChart3, Clock, Database, Trash2, ArrowRight } from 'lucide-react';

interface CSVUploadPanelProps {
  onClose: () => void;
}

export const CSVUploadPanel: React.FC<CSVUploadPanelProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [options, setOptions] = useState({
    delimiter: '',
    header: true,
    skipEmptyLines: true,
    maxRows: 500
  });

  const { setApiData, setSelectedApis, addRecentUpload, recentUploads, clearRecentUploads } = useAppStore();

  const handleFileSelect = async (selectedFile: File) => {
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }
    setFile(selectedFile);
    await performParse(selectedFile);
  };

  const performParse = async (targetFile: File) => {
    setIsParsing(true);
    try {
      const result = await parseCSV(targetFile, options);
      setParseResult(result);
    } catch (err) {
      console.error("Parse failed", err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleAnalyze = () => {
    if (!parseResult) return;

    const apiId = `csv_${Date.now()}`;
    const matrix = normalizeCSVToMatrix(parseResult.rows, parseResult.headers);

    // Create a virtual API config for the CSV
    const virtualApi = {
      id: apiId,
      name: file?.name || "Uploaded CSV",
      endpoint: "local://csv",
      auth: null,
      query: "",
      rootKey: "",
      fields: parseResult.headers
    };

    setApiData(apiId, parseResult.rows, 'csv');
    setSelectedApis([virtualApi]);

    addRecentUpload({
      fileName: file?.name || "CSV Upload",
      uploadTime: Date.now(),
      rowCount: parseResult.rowCount,
      columnCount: parseResult.columnCount,
      healthScore: 100 // Default, will be updated by analysis
    });

    onClose();
  };

  const handleLoadSample = (key: keyof typeof sampleDatasets, name: string) => {
    const data = sampleDatasets[key];
    const headers = Object.keys(data[0]);
    const apiId = `sample_${key}`;

    const virtualApi = {
      id: apiId,
      name: name,
      endpoint: "sample://csv",
      auth: null,
      query: "",
      rootKey: "",
      fields: headers
    };

    setApiData(apiId, data, 'csv');
    setSelectedApis([virtualApi]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-8 overflow-y-auto">
      <div className="glass w-full max-w-5xl rounded-[3rem] border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-300">

        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter">DATA INGESTION</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Upload CSV or select sample intelligence</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-12 gap-8">

            {/* Left Column: Upload & History */}
            <div className="col-span-7 space-y-8">
              {!file ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
                  }}
                  className="relative group h-64 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center space-y-4 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div className="text-center space-y-1 relative">
                    <p className="text-sm font-black text-white uppercase tracking-widest">Drop CSV here or browse</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Max size: 10MB | .csv, .tsv, .txt</p>
                  </div>
                  <input
                    type="file"
                    accept=".csv,.tsv,.txt"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="glass p-8 rounded-[2.5rem] border border-indigo-500/30 space-y-6 animate-in slide-in-from-left-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-500/20 rounded-2xl">
                        <FileText className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase truncate max-w-[200px]">{file.name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          {(file.size / 1024).toFixed(1)} KB | {parseResult?.rowCount || 0} Rows
                        </p>
                      </div>
                    </div>
                    <button onClick={() => { setFile(null); setParseResult(null); }} className="text-[10px] font-black text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors">
                      Cancel
                    </button>
                  </div>

                  {/* Parsing Options */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Settings2 className="w-3 h-3" /> Delimiter
                      </label>
                      <select
                        value={options.delimiter}
                        onChange={(e) => setOptions({ ...options, delimiter: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500/50"
                      >
                        <option value="">Auto-detect</option>
                        <option value=",">Comma (,)</option>
                        <option value=";">Semicolon (;)</option>
                        <option value="	">Tab (\t)</option>
                        <option value="|">Pipe (|)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <BarChart3 className="w-3 h-3" /> Max Rows
                      </label>
                      <select
                        value={options.maxRows}
                        onChange={(e) => setOptions({ ...options, maxRows: parseInt(e.target.value) })}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500/50"
                      >
                        <option value={100}>100 Rows</option>
                        <option value={500}>500 Rows</option>
                        <option value={1000}>1000 Rows</option>
                        <option value={5000}>5000 Rows</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={isParsing}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {isParsing ? "PARSING..." : "START ANALYSIS"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Recent History */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Clock className="w-4 h-4" /> RECENT UPLOADS
                  </h3>
                  {recentUploads.length > 0 && (
                    <button onClick={clearRecentUploads} className="text-[10px] font-black text-slate-600 hover:text-red-400 transition-colors flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> CLEAR
                    </button>
                  )}
                </div>

                {recentUploads.length === 0 ? (
                  <div className="p-8 border border-white/5 rounded-[2rem] text-center opacity-30">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No recent history</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {recentUploads.map((upload, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          // For history, we just show the name, user still has to pick file
                          // but for demo I'll just alert or set name
                          setFile({ name: upload.fileName } as File);
                        }}
                        className="glass p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/5 rounded-lg">
                            <Database className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-white truncate max-w-[150px]">{upload.fileName}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">{upload.rowCount} rows &bull; {new Date(upload.uploadTime).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Samples */}
            <div className="col-span-5 space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Database className="w-4 h-4" /> SAMPLE DATASETS
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'ecommerce', name: 'E-commerce Orders', icon: '🛒', color: 'indigo', desc: 'Retail sparsity patterns' },
                  { id: 'hr', name: 'Employee HR Data', icon: '👥', color: 'purple', desc: 'Organizational missingness' },
                  { id: 'research', name: 'Scientific Research', icon: '🔬', color: 'green', desc: 'Experiment co-null patterns' },
                  { id: 'medical', name: 'Patient Records', icon: '🏥', color: 'red', desc: 'Clinical data quality' },
                ].map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleLoadSample(sample.id as any, sample.name)}
                    className="glass p-6 rounded-[2rem] border border-white/5 hover:border-white/20 transition-all text-left group relative overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 p-6 text-4xl opacity-10 group-hover:opacity-20 transition-opacity`}>
                      {sample.icon}
                    </div>
                    <div className="relative space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 bg-${sample.color}-500/10 text-${sample.color}-400 text-[8px] font-black rounded-full uppercase tracking-widest`}>
                          SAMPLE
                        </span>
                        <h4 className="text-sm font-black text-white uppercase tracking-tighter">{sample.name}</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{sample.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
