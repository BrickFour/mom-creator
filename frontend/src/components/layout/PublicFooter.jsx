import logo from '../../assets/logo.png';

function navigateTo(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function PublicFooter() {
  return (
    <footer className="bg-[#07162c] border-t border-blue-900/50 text-slate-400 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between">
        {/* Brand Copyright */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="MOM Creator"
            className="h-8 w-8 object-contain rounded-lg"
          />
          <div className="text-xs">
            <span className="font-semibold text-white">MOM Creator</span>
            <span className="text-slate-500 block">
              © {new Date().getFullYear()} All rights reserved.
            </span>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-5 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => navigateTo('/')}
            className="transition-colors hover:text-cyan-400 cursor-pointer"
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => navigateTo('/privacy')}
            className="transition-colors hover:text-cyan-400 cursor-pointer"
          >
            Privacy Policy
          </button>

          <button
            type="button"
            onClick={() => navigateTo('/terms')}
            className="transition-colors hover:text-cyan-400 cursor-pointer"
          >
            Terms of Service
          </button>

          <button
            type="button"
            onClick={() => navigateTo('/login')}
            className="transition-colors hover:text-cyan-400 cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
