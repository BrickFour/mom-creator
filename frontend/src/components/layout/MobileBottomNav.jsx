import { LayoutDashboard, CalendarDays, Plus, Building2, User, KeyRound, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export function MobileBottomNav({
  currentPath,
  onNavigate,
  onOpenCreateMeeting,
  onOpenChangePassword,
}) {
  const { user, profile, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/dashboard') return currentPath === '/dashboard';
    return currentPath.startsWith(path);
  };

  return (
    <>
      {/* Mobile user bottom sheet / menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setUserMenuOpen(false)}
        >
          <div
            className="fixed bottom-16 left-3 right-3 bg-[#081a35] rounded-2xl border border-blue-800/80 shadow-2xl p-4 space-y-3 animate-in slide-in-from-bottom duration-200 text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-blue-900/40">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                {profile?.name ? profile.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {profile?.name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  onOpenChangePassword();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/10 active:bg-white/15 cursor-pointer transition-colors"
              >
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>Change Password</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  onNavigate('/integrations');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/10 active:bg-white/15 cursor-pointer transition-colors"
              >
                <span>Integrations (Google & Fireflies)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  onNavigate('/settings');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/10 active:bg-white/15 cursor-pointer transition-colors"
              >
                <span>API & Diagnostics</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-white/10 active:bg-white/15 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main bottom navigation bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#07162c]/95 backdrop-blur-md border-t border-blue-900/50 md:hidden flex items-center justify-around px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.3)] text-slate-300"
        style={{ paddingBottom: 'calc(0.375rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <button
          type="button"
          onClick={() => onNavigate('/dashboard')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            isActive('/dashboard') ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 mb-0.5 ${isActive('/dashboard') ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/meetings')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            isActive('/meetings') ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <CalendarDays className={`w-5 h-5 mb-0.5 ${isActive('/meetings') ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span>Meetings</span>
        </button>

        {/* Center elevated + action button */}
        <div className="relative -top-3.5 flex flex-col items-center">
          <button
            type="button"
            onClick={onOpenCreateMeeting}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            aria-label="Start recording or create meeting"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[9px] font-semibold text-cyan-300 mt-1">Start Meeting</span>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/workspaces')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            isActive('/workspaces') ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className={`w-5 h-5 mb-0.5 ${isActive('/workspaces') ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span>Spaces</span>
        </button>

        <button
          type="button"
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            userMenuOpen ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className={`w-5 h-5 mb-0.5 ${userMenuOpen ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span>Profile</span>
        </button>
      </nav>
    </>
  );
}

