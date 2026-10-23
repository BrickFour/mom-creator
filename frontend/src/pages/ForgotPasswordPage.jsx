import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';

export function ForgotPasswordPage({ onNavigateToLogin }) {
  const { requestPasswordReset, configured } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSent(false);
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(
        err?.message ||
          'Unable to send the password reset email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <img
            src={logo}
            alt="MOM Creator"
            className="w-20 h-20 object-contain mx-auto drop-shadow-sm rounded-2xl"
          />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Reset your password
          </h1>
          <p className="text-xs text-slate-500">
            Enter your email address and we will send you a secure password
            reset link.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {sent ? (
            <div className="space-y-5 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Check your email
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  If an account exists for this email address, a password
                  reset link has been sent. The link will take you back to
                  MOM Creator to choose a new password.
                </p>
              </div>


              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-sm font-semibold text-[#023b77] hover:text-[#039583]"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {!configured && (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs flex items-start gap-2.5 text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    Supabase is not configured. Check your VITE_SUPABASE_URL
                    and VITE_SUPABASE_ANON_KEY environment variables.
                  </p>
                </div>
              )}

              <Input
                type="email"
                label="Email Address"
                placeholder="you@company.com"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />

              {error && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={!configured}
              >
                Send Reset Link
              </Button>

              <button
                type="button"
                onClick={onNavigateToLogin}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#023b77]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to sign in
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
