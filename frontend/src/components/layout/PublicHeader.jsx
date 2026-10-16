import { useAuth } from '../../context/AuthContext.jsx';
import samvadiniLogo from '../../assets/samvadini-logo.png';

function navigateTo(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function PublicHeader() {
  const { session } = useAuth();
  const isSignedIn = !!session;

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#07162c] via-[#0a1f3d] to-[#081830] border-b border-blue-900/50 shadow-md text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <button
          type="button"
          onClick={() => navigateTo('/')}
          className="flex items-center gap-3 transition-opacity hover:opacity-90 cursor-pointer"
        >
          <img
            src={samvadiniLogo}
            alt="Samvadini"
            className="h-10 w-10 object-contain rounded-xl shadow-xs"
          />
          <div className="flex flex-col text-left">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
              Samvadini
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
              MOM Creator
            </span>
          </div>
        </button>

        {/* Navigation Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {isSignedIn ? (
            <button
              type="button"
              onClick={() => navigateTo('/dashboard')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-md shadow-cyan-500/15 cursor-pointer transition-all active:scale-98"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigateTo('/login')}
                className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Sign in
              </button>

              <button
                type="button"
                onClick={() => navigateTo('/register')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-md shadow-cyan-500/15 cursor-pointer transition-all active:scale-98"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default PublicHeader;
