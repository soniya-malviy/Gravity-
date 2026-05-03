import React from 'react';
import { Zap, Shield, Cpu, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="glass border-t border-white/5 py-4 px-8 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-indigo-400">
          <Zap className="w-3 h-3 fill-current" />
          <span>Gravity v2.0.0-PROD</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          <span>Encrypted Auth</span>
        </div>
        <div className="flex items-center gap-2">
          <Cpu className="w-3 h-3" />
          <span>Agentic Analysis Active</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Database className="w-3 h-3" />
          <span>Local Snapshots: PERSISTENT</span>
        </div>
        <span>&copy; 2026 DEEPMIND ADVANCED CODING</span>
      </div>
    </footer>
  );
};
