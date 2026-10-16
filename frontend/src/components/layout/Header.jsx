import { Menu, Plus } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import samvadiniLogo from '../../assets/samvadini-logo.png';

export function Header({
  onToggleMobileMenu,
  breadcrumbs = [],
  onOpenCreateMeeting,
}) {
  const { currentWorkspace } = useWorkspace();

  return (
    <header className="h-14 px-4 sm:px-6 bg-gradient-to-r from-[#07162c] via-[#0a1f3d] to-[#081830] border-b border-blue-900/50 shadow-xs flex items-center justify-between gap-4 shrink-0 text-white">
      {/* Zone 1: Mobile toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile brand badge */}
        <div className="md:hidden flex items-center gap-1.5 shrink-0">
          <img
            src={samvadiniLogo}
            alt="Samvadini"
            className="w-7 h-7 object-contain rounded-md"
          />
          <span className="text-xs font-bold tracking-tight text-white">
            Samvadini
          </span>
        </div>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs truncate">
          <span className="hidden sm:inline-flex items-center text-cyan-300 font-semibold bg-cyan-950/50 border border-cyan-800/50 px-2 py-0.5 rounded-md truncate">
            {currentWorkspace ? currentWorkspace.name : 'Workspace'}
          </span>
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1.5 truncate">
              <span className="text-blue-400/40">/</span>
              {crumb.onClick ? (
                <button
                  type="button"
                  onClick={crumb.onClick}
                  className="text-slate-300 hover:text-white truncate font-medium cursor-pointer transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-white font-semibold truncate">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Zone 2: Primary Quick Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        {onOpenCreateMeeting && (
          <button
            type="button"
            onClick={onOpenCreateMeeting}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-md shadow-cyan-500/15 cursor-pointer transition-all active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Meeting</span>
          </button>
        )}
      </div>
    </header>
  );
}

