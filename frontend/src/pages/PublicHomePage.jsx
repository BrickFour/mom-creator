import { useAuth } from '../context/AuthContext.jsx';
import SamvadiniLogo from '../assets/Samvadini-logo.png';

function navigateTo(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function PublicHomePage() {
  const { session } = useAuth();
  const isSignedIn = !!session;

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          {/* Logo */}

          <button
            type="button"
            onClick={() => navigateTo('/')}
            className="flex items-center transition-opacity hover:opacity-85"
          >
            <img
              src={SamvadiniLogo}
              alt="Samvadini"
              className="h-14 w-auto object-contain"
            />
          </button>


          {/* Navigation */}

          <div className="flex items-center gap-2">

            {isSignedIn ? (
              <button
                type="button"
                onClick={() => navigateTo('/dashboard')}
                className="
                  rounded-lg
                  bg-[#023b77]
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition-all
                  hover:bg-[#022f60]
                  hover:shadow
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#039583]/40
                "
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigateTo('/login')}
                  className="
                    rounded-lg
                    px-4
                    py-2
                    text-sm
                    font-medium
                    text-slate-600
                    transition-colors
                    hover:bg-slate-100
                    hover:text-[#023b77]
                  "
                >
                  Sign in
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('/register')}
                  className="
                    rounded-lg
                    bg-[#023b77]
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition-all
                    hover:bg-[#022f60]
                    hover:shadow
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#039583]/40
                  "
                >
                  Get Started
                </button>
              </>
            )}

          </div>
        </div>
      </header>


      {/* =====================================================
          MAIN
          ===================================================== */}

      <main>

        {/* ===================================================
            HERO
            =================================================== */}

        <section className="relative overflow-hidden">

          {/* Background decoration */}

          <div
            className="
              pointer-events-none
              absolute
              -right-40
              -top-40
              h-96
              w-96
              rounded-full
              bg-[#039583]/10
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -left-40
              top-40
              h-96
              w-96
              rounded-full
              bg-[#023b77]/10
              blur-3xl
            "
          />


          <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:py-32">

            <div className="max-w-3xl">

              {/* Eyebrow */}

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#039583]/20 bg-[#039583]/5 px-3.5 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#039583]" />

                <span className="text-xs font-semibold uppercase tracking-wider text-[#023b77]">
                  Meeting Intelligence
                </span>
              </div>


              {/* Main heading */}

              <h1
                className="
                  text-5xl
                  font-bold
                  leading-[1.08]
                  tracking-[-0.035em]
                  text-[#023b77]
                  sm:text-6xl
                  lg:text-7xl
                "
              >
                Turn meetings into
                <span className="block bg-gradient-to-r from-[#023b77] to-[#039583] bg-clip-text text-transparent">
                  structured MOMs.
                </span>
              </h1>


              {/* Description */}

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Samvadini helps teams capture meeting information, process
                recordings and transcripts, generate professional Minutes of
                Meeting, and organize follow-up action items.
              </p>


              {/* CTA */}

              <div className="mt-9 flex flex-wrap items-center gap-3">

                <button
                  type="button"
                  onClick={() =>
                    navigateTo(isSignedIn ? '/dashboard' : '/register')
                  }
                  className="
                    rounded-lg
                    bg-[#023b77]
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-md
                    shadow-[#023b77]/15
                    transition-all
                    hover:-translate-y-0.5
                    hover:bg-[#022f60]
                    hover:shadow-lg
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#039583]/40
                    focus:ring-offset-2
                  "
                >
                  {isSignedIn ? 'Go to Dashboard' : 'Get Started'}
                </button>


                {!isSignedIn && (
                  <button
                    type="button"
                    onClick={() => navigateTo('/login')}
                    className="
                      rounded-lg
                      border
                      border-slate-300
                      bg-white
                      px-6
                      py-3
                      text-sm
                      font-semibold
                      text-slate-700
                      transition-all
                      hover:border-[#023b77]/30
                      hover:bg-slate-50
                      hover:text-[#023b77]
                    "
                  >
                    Sign in
                  </button>
                )}

              </div>

            </div>
          </div>
        </section>


        {/* ===================================================
            FEATURES
            =================================================== */}

        <section className="border-y border-slate-200 bg-slate-50/70">

          <div className="mx-auto max-w-7xl px-6 py-20">

            <div className="mb-12 max-w-2xl">

              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#039583]">
                Built for productive teams
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-[#023b77] sm:text-4xl">
                From conversation to action.
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Keep meeting information organized, searchable, and useful
                after the conversation ends.
              </p>

            </div>


            <div className="grid gap-6 md:grid-cols-3">

              {/* Capture */}

              <div
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  p-7
                  shadow-sm
                  transition-all
                  hover:-translate-y-1
                  hover:border-[#023b77]/20
                  hover:shadow-md
                "
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#023b77]/10">
                  <svg
                    className="h-5 w-5 text-[#023b77]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <path d="M12 19v3" />
                    <path d="M8 22h8" />
                  </svg>
                </div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Capture meetings
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Create meetings and process supported recordings,
                  transcripts, and online meeting workflows.
                </p>
              </div>


              {/* MOM */}

              <div
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  p-7
                  shadow-sm
                  transition-all
                  hover:-translate-y-1
                  hover:border-[#039583]/30
                  hover:shadow-md
                "
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#039583]/10">
                  <svg
                    className="h-5 w-5 text-[#039583]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                    <path d="M14 2v6h6" />
                    <path d="M8 13h8" />
                    <path d="M8 17h6" />
                  </svg>
                </div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Generate MOMs
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Transform meeting transcripts into structured Minutes of
                  Meeting ready for review and sharing.
                </p>
              </div>


              {/* Action items */}

              <div
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  p-7
                  shadow-sm
                  transition-all
                  hover:-translate-y-1
                  hover:border-[#023b77]/20
                  hover:shadow-md
                "
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-[#023b77]/10 to-[#039583]/10">
                  <svg
                    className="h-5 w-5 text-[#023b77]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 11 3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Track action items
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Organize follow-up tasks associated with meetings and their
                  Minutes of Meeting.
                </p>
              </div>

            </div>
          </div>
        </section>


        {/* ===================================================
            GOOGLE INTEGRATIONS
            =================================================== */}

        <section className="mx-auto max-w-7xl px-6 py-20">

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-gradient-to-br
              from-[#023b77]/5
              via-white
              to-[#039583]/5
              p-8
              sm:p-10
            "
          >

            <div className="max-w-3xl">

              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200">

                <svg
                  className="h-5 w-5 text-[#023b77]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="m7 16 4-5 3 3 5-7" />
                </svg>

              </div>


              <h2 className="text-3xl font-bold tracking-tight text-[#023b77]">
                Google integrations
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Samvadini can integrate with Google services to support meeting
                workflows and calendar-related functionality. Google user
                data is handled according to Google's API Services User Data
                Policy, including the Limited Use requirements where
                applicable.
              </p>

            </div>

          </div>

        </section>


        {/* ===================================================
            FINAL CTA
            =================================================== */}

        {!isSignedIn && (
          <section className="px-6 pb-20">

            <div
              className="
                mx-auto
                max-w-7xl
                overflow-hidden
                rounded-2xl
                bg-gradient-to-r
                from-[#023b77]
                to-[#039583]
                px-8
                py-12
                text-white
                shadow-lg
                sm:px-12
              "
            >

              <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">

                <div>

                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Make every meeting count.
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
                    Start organizing your meetings, Minutes of Meeting, and
                    action items with Samvadini.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={() => navigateTo('/register')}
                  className="
                    shrink-0
                    rounded-lg
                    bg-white
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-[#023b77]
                    shadow-sm
                    transition-all
                    hover:bg-slate-50
                    hover:shadow-md
                  "
                >
                  Get Started
                </button>

              </div>

            </div>

          </section>
        )}

      </main>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="border-t border-slate-200 bg-slate-50">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <img
              src={SamvadiniLogo}
              alt="Samvadini"
              className="h-10 w-auto object-contain"
            />

            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Samvadini
            </p>

          </div>


          <div className="flex gap-5 text-sm text-slate-500">

            <button
              type="button"
              onClick={() => navigateTo('/privacy')}
              className="transition-colors hover:text-[#023b77]"
            >
              Privacy Policy
            </button>

            <button
              type="button"
              onClick={() => navigateTo('/terms')}
              className="transition-colors hover:text-[#023b77]"
            >
              Terms of Service
            </button>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default PublicHomePage;
