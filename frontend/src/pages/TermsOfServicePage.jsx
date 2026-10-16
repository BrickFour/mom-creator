import { useAuth } from '../context/AuthContext.jsx';
import SamvadiniLogo from '../assets/samvadini-logo.png';

function navigateTo(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function TermsOfServicePage() {
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
          MAIN CONTENT
          ===================================================== */}

      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20">

        {/* Page heading */}

        <div className="mb-12 border-b border-slate-200 pb-10">

          <div className="mb-4 inline-flex items-center rounded-full border border-[#039583]/20 bg-[#039583]/5 px-3 py-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#039583]">
              Legal
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-[#023b77] sm:text-5xl">
            Terms of Service
          </h1>

          <p className="mt-4 text-sm text-slate-500">
            Last updated: September 2026
          </p>

        </div>


        {/* Legal content */}

        <div className="space-y-12 leading-7 text-slate-600">

          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              1. Acceptance of Terms
            </h2>

            <p className="mt-4">
              By accessing or using Samvadini, you agree to these Terms of
              Service. If you do not agree with these terms, you should not use
              the service.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              2. Description of the Service
            </h2>

            <p className="mt-4">
              Samvadini is a meeting management application that provides
              functionality for creating meetings, processing meeting content,
              generating Minutes of Meeting, and managing related action items.
            </p>

            <p className="mt-4">
              Features may change, be added, or be removed as the service
              develops.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              3. Accounts
            </h2>

            <p className="mt-4">
              You are responsible for maintaining the security of your account
              credentials and for activity performed through your account.
            </p>

            <p className="mt-4">
              You must provide accurate information when creating and
              maintaining your account.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              4. Workspaces
            </h2>

            <p className="mt-4">
              Samvadini may provide workspaces that allow multiple users to
              collaborate on meetings, Minutes of Meeting, and action items.
            </p>

            <p className="mt-4">
              Workspace owners and members may have different permissions
              depending on the application's workspace access controls.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              5. Meeting Content
            </h2>

            <p className="mt-4">
              You are responsible for ensuring that you have the necessary
              rights and permissions to record, upload, transcribe, process,
              and share meeting content through Samvadini.
            </p>

            <p className="mt-4">
              This includes complying with applicable recording-consent,
              privacy, confidentiality, intellectual-property, and employment
              requirements.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              6. AI-Generated Content
            </h2>

            <p className="mt-4">
              Samvadini may use artificial intelligence to generate summaries,
              Minutes of Meeting, discussion points, decisions, and action
              items from meeting content.
            </p>

            <p className="mt-4">
              AI-generated content may contain errors or omissions and should
              be reviewed by users before being relied upon or distributed.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              7. Third-Party Integrations
            </h2>

            <p className="mt-4">
              Samvadini may integrate with third-party services such as Google
              services and other meeting or calendar providers.
            </p>

            <p className="mt-4">
              Use of those services may also be subject to the third party's
              own terms, policies, and requirements.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              8. Prohibited Use
            </h2>

            <p className="mt-4">
              You must not use Samvadini to violate applicable laws or
              regulations, interfere with the service, gain unauthorized access
              to accounts or data, or abuse third-party integrations.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              9. Intellectual Property
            </h2>

            <p className="mt-4">
              The Samvadini application, including its software, interface,
              branding, and associated materials, is protected by applicable
              intellectual-property laws.
            </p>

            <p className="mt-4">
              Users retain responsibility for content they provide to the
              service and for ensuring that they have the rights necessary to
              use that content.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              10. Service Availability
            </h2>

            <p className="mt-4">
              Samvadini may occasionally be unavailable because of maintenance,
              infrastructure issues, third-party service interruptions, or
              other circumstances.
            </p>

            <p className="mt-4">
              The service is provided subject to its availability and
              operational limitations.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              11. Suspension or Termination
            </h2>

            <p className="mt-4">
              Access to Samvadini may be suspended or terminated where necessary
              to protect the service, users, third-party systems, or comply
              with applicable requirements.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              12. Disclaimer
            </h2>

            <p className="mt-4">
              Samvadini provides software tools for meeting management and
              AI-assisted document generation. The service does not guarantee
              that generated transcripts, summaries, Minutes of Meeting, or
              action items will always be complete or accurate.
            </p>

            <p className="mt-4">
              Users should review generated information before relying on it
              for important decisions or communications.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              13. Changes to These Terms
            </h2>

            <p className="mt-4">
              These Terms of Service may be updated as the service changes.
              Updated terms will be published on this page.
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold tracking-tight text-[#023b77] sm:text-2xl">
              14. Contact
            </h2>

            <p className="mt-4">
              Questions regarding these Terms of Service can be directed to
              the Samvadini application operator through the contact information
              provided with the service.
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

export default TermsOfServicePage;
