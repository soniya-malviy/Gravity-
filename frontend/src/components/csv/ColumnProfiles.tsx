import React from 'react';
import { useAppStore } from '../../store/appStore';
import { TrendingUp, Hash, Type, Calendar } from 'lucide-react';

export const ColumnProfiles: React.FC = () => {
  const { selectedApis, sourceData } = useAppStore();
  const primaryApi = selectedApis[0];
  const data = sourceData[primaryApi?.id];

  if (!data || data.source !== 'csv') return null;

  const { fieldSummary, rawData } = data;

  const getProfile = (fieldName: string) => {
    const values = rawData.map(r => r[fieldName]);
    const presentValues = values.filter(v => v !== null && v !== undefined && v !== '');
    
    // Type Detection
    const type = typeof presentValues[0];
    
    return {
      type,
      uniqueCount: new Set(presentValues).size,
      sample: presentValues.slice(0, 5)
    };
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* AI Schema Insights Placeholder */}
      <div className="glass p-6 rounded-[2.5rem] border border-indigo-500/20 bg-indigo-500/5 flex items-start gap-6">
        <div className="p-4 bg-indigo-500/20 rounded-2xl">
          <TrendingUp className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">AI Schema Insights</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Analyzing dataset structure... This appears to be an {primaryApi.name.toLowerCase()} dataset. 
            I've detected {fieldSummary.length} functional domains. Key identifiers found in {fieldSummary[0]?.fieldName}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fieldSummary.map((field, i) => {
          const profile = getProfile(field.fieldName);
          const isHighQuality = field.completeness > 90;
          
          return (
            <div key={i} className="glass p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all space-y-4 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isHighQuality ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                    {profile.type === 'number' ? <Hash className="w-4 h-4 text-indigo-400" /> : 
                     profile.type === 'string' ? <Type className="w-4 h-4 text-purple-400" /> :
                     <Calendar className="w-4 h-4 text-orange-400" />}
                  </div>
                  <h4 className="text-[11px] font-black text-white uppercase truncate max-w-[120px]">{field.fieldName}</h4>
                </div>
                <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${
                  profile.type === 'number' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'
                }`}>
                  {profile.type}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <span className={`text-3xl font-black ${isHighQuality ? 'text-white' : 'text-orange-400'}`}>
                    {field.completeness.toFixed(1)}%
                  </span>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pb-1">Completeness</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${isHighQuality ? 'bg-indigo-500' : 'bg-orange-500'}`}
                    style={{ width: `${field.completeness}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Distinct Values</p>
                  <p className="text-xs font-bold text-slate-300">{profile.uniqueCount}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Null Count</p>
                  <p className="text-xs font-bold text-slate-300">{field.nullCount}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sample Values</p>
                <div className="flex flex-wrap gap-1">
                  {profile.sample.map((s, si) => (
                    <span key={si} className="px-2 py-1 bg-white/5 rounded-md text-[8px] text-slate-400 truncate max-w-[80px]">
                      {String(s)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
