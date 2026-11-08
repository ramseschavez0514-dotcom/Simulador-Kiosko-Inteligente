import React from 'react';
import { 
  Cpu, 
  Layers, 
  Terminal, 
  Headset, 
  FileCode2, 
  BookOpen, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Clock
} from 'lucide-react';

export type AppTab = 'kiosk' | 'cluster' | 'hitl' | 'artifact' | 'docs';

interface NavigationHeaderProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  hitlPendingCount: number;
  doorLocked: boolean;
  activeKioskId: string;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentTab,
  onTabChange,
  hitlPendingCount,
  doorLocked,
  activeKioskId
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950 text-slate-100 sticky top-0 z-50 shadow-md">
      {/* Top telemetry bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-900/80">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="font-mono text-cyan-400 font-semibold tracking-wider">RET-FIG-001 v2.4</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="font-mono text-slate-300">Terminal: {activeKioskId}</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            {doorLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Bóveda Electromecánica: Bloqueada</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-amber-400 font-medium">Compuerta: Destrabada para retiro</span>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1 text-slate-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ley 18.331 (PII Enmascarada)</span>
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="flex items-center gap-1 text-slate-300 font-medium">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>SLA HITL: &lt; 45s</span>
          </span>
        </div>
      </div>

      {/* Main navigation & switcher */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-950/50">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Kioscos Inteligentes de Devolución
              <span className="text-xs font-normal px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono">
                AI Agent Cluster
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Terminal Física · Clúster Multimodal (Flash/Pro) · Panel HITL Remoto
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <nav className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto max-w-full">
          <button
            onClick={() => onTabChange('kiosk')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              currentTab === 'kiosk'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal Kiosco (15 Pasos)</span>
          </button>

          <button
            onClick={() => onTabChange('cluster')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              currentTab === 'cluster'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-300" />
            <span>Clúster IA (Paso 10)</span>
          </button>

          <button
            onClick={() => onTabChange('hitl')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap relative ${
              currentTab === 'hitl'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Headset className="w-3.5 h-3.5" />
            <span>Soporte HITL</span>
            {hitlPendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                {hitlPendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('artifact')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              currentTab === 'artifact'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5 text-indigo-300" />
            <span>Prompt Unificado</span>
          </button>

          <button
            onClick={() => onTabChange('docs')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              currentTab === 'docs'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Esquema & Reglas</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
