import { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { Building2, ChevronDown, Check, Plus, Settings } from 'lucide-react';

export function WorkspaceSelector({ onOpenCreate, onOpenSettings }) {
  const { workspaces, currentWorkspace, setCurrentWorkspace, loading } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left bg-[#0c203f]/80 hover:bg-[#10274d] border border-blue-800/60 rounded-xl transition-all cursor-pointer group shadow-xs"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-blue-600/30 text-cyan-300 flex items-center justify-center shrink-0 border border-blue-700/40">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-blue-300/70">
              Workspace
            </p>
            <p className="text-xs font-semibold text-white truncate">
              {currentWorkspace ? currentWorkspace.name : loading ? 'Loading...' : 'Select Workspace'}
            </p>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-blue-300/60 group-hover:text-cyan-300 shrink-0 transition-transform" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-[#081933] rounded-xl border border-blue-800/80 shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-100 text-slate-200">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-300/60">
            Your Workspaces
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                type="button"
                onClick={() => {
                  setCurrentWorkspace(ws);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors text-left cursor-pointer ${
                  currentWorkspace?.id === ws.id
                    ? 'bg-blue-900/60 text-cyan-300 font-semibold'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <span className="truncate">{ws.name}</span>
                {currentWorkspace?.id === ws.id && (
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-2" />
                )}
              </button>
            ))}

            {workspaces.length === 0 && !loading && (
              <div className="px-3 py-2 text-xs text-slate-400 italic">
                No workspaces found
              </div>
            )}
          </div>

          <div className="pt-1 mt-1 border-t border-blue-900/40">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenCreate();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-cyan-400 hover:bg-white/5 font-medium transition-colors cursor-pointer text-left"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Workspace</span>
            </button>
            {currentWorkspace && onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 font-medium transition-colors cursor-pointer text-left"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Workspace Settings</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
