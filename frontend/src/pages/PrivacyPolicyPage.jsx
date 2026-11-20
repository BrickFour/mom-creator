import { PublicHeader } from '../components/layout/PublicHeader.jsx';
import { PublicFooter } from '../components/layout/PublicFooter.jsx';
import { ArrowLeft, Shield } from 'lucide-react';

function navigateTo(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function PrivacyPolicyPage() {
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
                <Shield className="w-3 h-3 text-cyan-600" />
                <span>Legal & Privacy</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Last updated: November 2026
              </p>
            </div>
          </div>
        </div>

        {/* Legal Text Body */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-10 text-sm sm:text-base leading-relaxed text-slate-600">
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                1. Introduction
              </h2>
              <p>
                MOM Creator is a comprehensive meeting intelligence and management application designed to help users capture meeting audio and video, process recordings and transcripts of any duration, generate professional Minutes of Meeting (MOM), and manage action items.
              </p>
              <p>
                This Privacy Policy explains what information MOM Creator processes, how that information is used, and how users can manage their data and privacy.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                2. Information We Process
              </h2>
              <p>Depending on how you use MOM Creator, the service may process:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-600">
                <li>Account and profile information (name, email address).</li>
                <li>Workspace details and workspace membership permissions.</li>
                <li>Meeting titles, scheduled dates, agendas, venues, and metadata.</li>
                <li>Meeting audio recordings, video files, and uploaded attachments.</li>
                <li>Meeting transcripts and timestamped speaker information.</li>
                <li>Minutes of Meeting generated from processed meetings.</li>
                <li>Follow-up action items, assignees, and task completion statuses.</li>
                <li>OAuth credentials necessary to connect supported third-party services.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                3. Google Account and Google API Data
              </h2>
              <p>
                If you connect your Google account, MOM Creator may request authorization to access Google Meet and Google Calendar services required to deliver integration features.
              </p>
              <p>
                Google user data is used exclusively to provide and improve the functionality requested by the user and is handled in strict compliance with the Google API Services User Data Policy, including all applicable Limited Use requirements.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                4. How Google Data Is Used
              </h2>
              <p>
                Google data accessed through MOM Creator is used only to support meeting scheduling, calendar synchronization, and Google Meet transcript processing requested by the user.
              </p>
              <p>
                Google user data is never sold to third parties, never used for advertising, and never transferred for purposes unrelated to the core functionality of the connected integration.
              </p>
              <p>
                MOM Creator does not use Google user data, including Google Meet transcripts and Google Calendar data, to develop, improve, or train generalized or non-personalized artificial intelligence or machine learning models. Google user data is processed by AI services only to generate the Minutes of Meeting, summaries, and action items requested by the user.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                5. OAuth Credentials & Encryption
              </h2>
              <p>
                When you authorize third-party integrations, MOM Creator securely stores the credentials required to maintain the connection. All OAuth refresh tokens are encrypted at rest prior to storage.
              </p>
              <p>
                Users can disconnect third-party integrations at any time via the application's Integrations page. Disconnecting Google revokes MOM Creator's access to your Google account and immediately deletes the stored Google credentials. You can also remove access at any time from your Google Account at{' '}
                <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer" className="text-blue-600 hover:text-cyan-600 underline">myaccount.google.com/permissions</a>.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                6. Meeting Recordings, Transcripts, and AI Processing
              </h2>
              <p>
                Meeting recordings and transcripts are processed using secure AI models to generate structured Minutes of Meeting, key decision summaries, and action items. Meeting content is sent to these AI services only to produce output for your workspace, and is not used to train AI models.
              </p>
              <p>
                Users must ensure they possess the necessary legal authority, consent, and authorization to record, transcribe, upload, and process meeting content in accordance with applicable laws.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                7. Data Security & Storage
              </h2>
              <p>
                MOM Creator employs enterprise-grade security controls to safeguard application data, user accounts, and files. These measures include TLS/HTTPS encryption in transit, strict Row Level Security (RLS) policies on database storage, encrypted token storage, and isolated workspace tenant boundaries.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                8. Data Retention & Deletion
              </h2>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-600">
                <li>Google OAuth credentials are kept only while your Google account is connected, and are deleted as soon as you disconnect.</li>
                <li>Meetings, transcripts imported from Google Meet, Minutes of Meeting, and action items are kept for as long as they exist in your workspace. Deleting a meeting permanently deletes its transcript, generated minutes, action items, and attachments.</li>
                <li>Calendar events created by MOM Creator remain in your Google Calendar until you or MOM Creator delete them; MOM Creator does not keep a copy of your other calendar data.</li>
                <li>To delete your account and all associated data, email us at the address below. We complete deletion requests within 30 days.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                9. Contact Information
              </h2>
              <p>
                For questions or requests concerning this Privacy Policy, your personal data, or data deletion, please contact the MOM Creator support team at{' '}
                <a href="mailto:techsupport@brickfour.com" className="text-blue-600 hover:text-cyan-600 underline">techsupport@brickfour.com</a>.
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

export default PrivacyPolicyPage;
