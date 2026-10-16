import { useAuth } from '../context/AuthContext.jsx';
import { PublicHeader } from '../components/layout/PublicHeader.jsx';
import { PublicFooter } from '../components/layout/PublicFooter.jsx';
import { Mic, FileText, CheckSquare, Sparkles, ArrowRight } from 'lucide-react';

function navigateTo(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function PublicHomePage() {
  const { session } = useAuth();
  const isSignedIn = !!session;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-cyan-100 selection:text-blue-900">
      {/* Brand Header */}
      <PublicHeader />

      {/* Main Content */}
      <main className="flex-1">
        {/* ===================================================
            HERO SECTION
            =================================================== */}
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36 bg-gradient-to-b from-[#07162c] via-[#091f3e] to-slate-50 text-white">
          {/* Subtle background glow */}
          <div
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-32 top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left">
            <div className="max-w-3xl mx-auto sm:mx-0">
              {/* Eyebrow badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-3.5 py-1.5 shadow-xs backdrop-blur-xs">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  AI-Powered Meeting Intelligence
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1]">
                Turn meetings into{' '}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                  structured MOMs.
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl">
                Samvadini helps teams capture boardroom discussions, process recordings and transcripts of any length, generate structured Minutes of Meeting, and organize follow-up action items.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => navigateTo(isSignedIn ? '/dashboard' : '/register')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-98"
                >
                  <span>{isSignedIn ? 'Go to Dashboard' : 'Get Started Free'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                {!isSignedIn && (
                  <button
                    type="button"
                    onClick={() => navigateTo('/login')}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/20 transition-all cursor-pointer"
                  >
                    Sign in to Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            CORE FEATURES
            =================================================== */}
        <section className="py-20 sm:py-24 bg-white border-y border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12 sm:mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 block mb-2">
                Engineered for High-Stakes Collaboration
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                From verbal exchange to executed decisions.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                Never lose critical meeting decisions, commitments, or action items again. Keep information organized, searchable, and actionable across all workspaces.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 hover:border-cyan-500/40 hover:bg-white hover:shadow-lg transition-all duration-200 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Reliable Offline & Live Recording
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Record meetings directly in browser with screen-off mobile protection, incoming call detection, or upload files of any duration.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 hover:border-cyan-500/40 hover:bg-white hover:shadow-lg transition-all duration-200 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Structured Minutes of Meeting (MOM)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  AI extracts executive summaries, detailed discussion points, key decisions, and organized agenda breakdowns tailored to transcript length.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 hover:border-cyan-500/40 hover:bg-white hover:shadow-lg transition-all duration-200 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Follow-Up Action Items
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Every commitment is extracted into a dedicated action item with assignees, due dates, and status tracking to ensure complete execution.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            GOOGLE INTEGRATION NOTICE
            =================================================== */}
        <section className="py-16 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-blue-900/20 bg-gradient-to-br from-[#07162c] to-[#0d284f] p-8 sm:p-10 text-white shadow-xl">
              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Google Ecosystem Integration
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Seamless Google Meet & Calendar Sync
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                  Samvadini integrates with Google services to support automated meeting workflows, transcript syncing, and calendar scheduling. Google user data is protected in full accordance with Google's API Services User Data Policy and Limited Use standards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            FINAL CALL TO ACTION
            =================================================== */}
        {!isSignedIn && (
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="mx-auto max-w-7xl rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Ready to upgrade your meeting workflow?
                </h2>
                <p className="text-sm text-blue-100 max-w-xl">
                  Start generating structured MOMs and tracking actionable results with Samvadini today.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('/register')}
                className="shrink-0 px-6 py-3 rounded-xl font-semibold text-blue-950 bg-white hover:bg-slate-100 shadow-md transition-all cursor-pointer active:scale-98 text-sm"
              >
                Get Started Free
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Brand Footer */}
      <PublicFooter />
    </div>
  );
}

export default PublicHomePage;
