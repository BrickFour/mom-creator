import { PublicHeader } from '../components/layout/PublicHeader.jsx';
import { PublicFooter } from '../components/layout/PublicFooter.jsx';
import { ArrowLeft, FileCheck } from 'lucide-react';

function navigateTo(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-cyan-100 selection:text-blue-900">
      {/* Brand Header */}
      <PublicHeader />

      {/* Main Container */}
      <main className="flex-1">
        {/* Page Hero Banner */}
        <div className="bg-white border-b border-slate-200 py-10 sm:py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-cyan-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to home</span>
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                <FileCheck className="w-3 h-3 text-cyan-600" />
                <span>Terms & Agreement</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Terms of Service
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Last updated: September 2026
              </p>
            </div>
          </div>
        </div>

        {/* Legal Text Body */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-10 text-sm sm:text-base leading-relaxed text-slate-600">
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account, accessing, or using MOM Creator, you agree to be bound by these Terms of Service. If you do not agree with any portion of these terms, you must discontinue use of the service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                2. Description of the Service
              </h2>
              <p>
                MOM Creator is a meeting management platform providing tools for capturing discussions, processing audio/video recordings, transcribing spoken dialogue, generating structured Minutes of Meeting (MOM), and tracking action item commitments.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                3. User Accounts and Security
              </h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized access or security breach.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                4. Meeting Content and Permissions
              </h2>
              <p>
                You retain ownership of the meeting content, files, audio, and documents you submit to MOM Creator. You represent and warrant that you possess all necessary consents, legal authorizations, and rights from all participants to record, transcribe, and process meeting content.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                5. AI-Generated Outputs
              </h2>
              <p>
                MOM Creator uses machine learning and artificial intelligence to assist in generating transcripts, summaries, and action items. Because AI outputs may occasionally contain inaccuracies or omissions, users should review and finalize all generated Minutes of Meeting before external distribution.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                6. Third-Party Integrations
              </h2>
              <p>
                MOM Creator provides optional integrations with third-party providers (such as Google Meet, Google Calendar, and Fireflies.ai). Your use of those third-party services is subject to their respective terms and policies.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                7. Service Availability & Modifications
              </h2>
              <p>
                We strive for continuous service reliability, but the application is provided on an "as is" and "as available" basis. We may update, enhance, or modify features over time as the platform evolves.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                8. Contact Information
              </h2>
              <p>
                For questions regarding these Terms of Service, please contact the MOM Creator administration team.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Brand Footer */}
      <PublicFooter />
    </div>
  );
}

export default TermsOfServicePage;
