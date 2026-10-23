import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  Link2,
  Settings,
  LogOut,
  Activity,
  ShieldCheck,
  FileText,
  KeyRound,
  X,
} from 'lucide-react';
import { WorkspaceSelector } from '../workspace/WorkspaceSelector.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from "../../assets/logo.png";

export function Sidebar({
  currentPath,
  onNavigate,
  onOpenCreateWorkspace,
  onOpenWorkspaceSettings,
  onOpenChangePassword,
  isMobile = false,
  onCloseMobile,
}) {
  const { user, profile, signOut } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Meetings', path: '/meetings', icon: CalendarDays },
    { label: 'Workspaces', path: '/workspaces', icon: Building2 },
    { label: 'Integrations', path: '/integrations', icon: Link2 },
    { label: 'API & Diagnostics', path: '/settings', icon: Activity },
    { label: 'Privacy Policy', path: '/privacy', icon: ShieldCheck },
    { label: 'Terms of Service', path: '/terms', icon: FileText },
  ];

  const handleNav = (path) => {
    onNavigate(path);
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className="w-64 h-full flex flex-col bg-gradient-to-b from-[#07162c] via-[#091a35] to-[#061224] border-r border-blue-900/50 text-slate-300 select-none shadow-xl">
      {/* Brand Zone */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-blue-900/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={logo}
            alt="MOM Creator"
            className="h-10 w-10 object-contain rounded-xl shrink-0 drop-shadow-sm bg-white/5 p-0.5"
          />
          <div className="min-w-0">
            <span className="text-sm font-extrabold tracking-wide text-white block leading-tight">
              MOM CREATOR
            </span>
          </div>
        </div>

        {isMobile && onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Workspace Selector */}
      <div className="p-3 border-b border-blue-900/40">
        <WorkspaceSelector
          onOpenCreate={onOpenCreateWorkspace}
          onOpenSettings={onOpenWorkspaceSettings}
        />
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-blue-300/60">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPath === item.path ||
            (item.path !== '/dashboard' && currentPath.startsWith(item.path));
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => handleNav(item.path)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-md shadow-cyan-500/15'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User profile & actions */}
      <div className="p-3 border-t border-blue-900/40 bg-[#050f21]/80">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {profile?.name
                ? profile.name[0].toUpperCase()
                : user?.email
                ? user.email[0].toUpperCase()
                : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {profile?.name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onOpenChangePassword && (
              <button
                type="button"
                onClick={onOpenChangePassword}
                title="Change password"
                className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                aria-label="Change password"
              >
                <KeyRound className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={signOut}
              title="Sign out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

