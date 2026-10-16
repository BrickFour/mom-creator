import { useAuth } from '../context/AuthContext.jsx';
import SamvadiniLogo from '../assets/samvadini-logo.png';

function navigateTo(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function PrivacyPolicyPage() {
  const { session } = useAuth();
  const isSignedIn = !!session;

  return (
    <div className="min-h-screen bg-white text-slate-700">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">

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

          <button
            type="button"
            onClick={() =>
              navigateTo(isSignedIn ? '/dashboard' : '/login')
            }
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
            {isSignedIn ? 'Dashboard' : 'Sign in'}
          </button>

        </div>
      </header>


      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20">

        <div className="mb-12 border-b border-slate-200 pb-10">

          <div className="mb-4 inline-flex items-center rounded-full border border-[#039583]/20 bg-[#039583]/5 px-3 py-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#039583]">
              Legal
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-[#023b77] sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-4 text-sm text-slate-500">
            Last updated: September 2026
          </p>

        </div>


        <div className="space-y-12 leading-7 text-slate-600">

          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              1. Introduction
            </h2>

            <p className="mt-4">
              Samvadini is a meeting management application designed to help
              users capture meeting information, process meeting recordings
              and transcripts, generate Minutes of Meeting, and manage action
              items.
            </p>

            <p className="mt-4">
              This Privacy Policy explains what information Samvadini processes,
              how that information is used, and how users can manage their
              information.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              2. Information We Process
            </h2>

            <p className="mt-4">
              Depending on how you use Samvadini, the service may process:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Account and profile information.</li>
              <li>Workspace and workspace membership information.</li>
              <li>Meeting titles, dates, settings, and related metadata.</li>
              <li>Meeting recordings, uploaded files, and attachments.</li>
              <li>Meeting transcripts and transcript-related information.</li>
              <li>Minutes of Meeting generated from meeting content.</li>
              <li>Action items and related task information.</li>
              <li>
                Information required to connect supported third-party
                services.
              </li>
            </ul>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              3. Google Account and Google API Data
            </h2>

            <p className="mt-4">
              If you connect a Google account, Samvadini may request access to
              Google services required to provide its integration features.
              Depending on the enabled functionality, this may include Google
              Meet and Google Calendar data.
            </p>

            <p className="mt-4">
              Google user data is used only to provide or improve the
              functionality requested by the user and is handled in accordance
              with Google's API Services User Data Policy and applicable
              Limited Use requirements.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              4. How Google Data Is Used
            </h2>

            <p className="mt-4">
              Google data accessed through Samvadini may be used to support
              meeting creation, meeting-related workflows, calendar events,
              and other integration functionality explicitly provided by the
              application.
            </p>

            <p className="mt-4">
              Google data is not used for advertising or sold to third parties.
              Samvadini does not use Google user data for purposes unrelated to
              the functionality of the connected integration.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              5. Google OAuth Credentials
            </h2>

            <p className="mt-4">
              When you authorize Google integration, Samvadini stores the
              credentials necessary to maintain the connection. OAuth refresh
              tokens are encrypted before being stored by the application.
            </p>

            <p className="mt-4">
              Users can disconnect their Google integration through the
              application's integration controls when that functionality is
              available.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              6. Meeting Recordings, Transcripts, and AI Processing
            </h2>

            <p className="mt-4">
              Meeting recordings and transcripts may be processed to generate
              Minutes of Meeting and related structured information.
            </p>

            <p className="mt-4">
              AI processing may be used to transform meeting transcripts into
              summaries, discussion points, decisions, and action items.
            </p>

            <p className="mt-4">
              Users should ensure that they have the appropriate authorization
              to record, transcribe, upload, and process meeting content.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              7. Third-Party Services
            </h2>

            <p className="mt-4">
              Samvadini may use third-party infrastructure and services to
              provide authentication, database storage, file storage, AI
              processing, communication, and external integrations.
            </p>

            <p className="mt-4">
              Information may be processed by these providers only as required
              to provide the corresponding functionality of Samvadini.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              8. Data Security
            </h2>

            <p className="mt-4">
              Samvadini uses security controls intended to protect account
              information, application data, and integration credentials.
              These controls include authenticated access, database access
              policies, encrypted OAuth credentials, and HTTPS for production
              deployments.
            </p>

            <p className="mt-4">
              No internet-based service can guarantee absolute security.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              9. Data Retention and Deletion
            </h2>

            <p className="mt-4">
              Meeting data, transcripts, Minutes of Meeting, action items, and
              account information may remain in the service while required to
              provide the application's functionality.
            </p>

            <p className="mt-4">
              Data deletion and retention behavior may depend on the applicable
              application functionality and account state. Users may contact
              the application operator regarding deletion requests.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              10. Disconnecting Google
            </h2>

            <p className="mt-4">
              Users may disconnect their Google account from Samvadini using the
              application's Google integration controls where available.
              Disconnecting the integration prevents Samvadini from using the
              stored Google authorization to make further API requests.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              11. Changes to This Policy
            </h2>

            <p className="mt-4">
              This Privacy Policy may be updated when the application's
              functionality, integrations, or legal requirements change. The
              updated policy will be published on this page.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              12. Contact
            </h2>

            <p className="mt-4">
              For privacy-related questions or requests, contact the Samvadini
              application operator through the contact information provided
              with the service.
            </p>
          </section>

        </div>
      </main>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="border-t border-slate-200 bg-slate-50">

        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">

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

          <button
            type="button"
            onClick={() => navigateTo('/')}
            className="
              text-sm
              font-medium
              text-slate-500
              transition-colors
              hover:text-[#023b77]
            "
          >
            Back to home
          </button>

        </div>

      </footer>

    </div>
  );
}

export default PrivacyPolicyPage;
