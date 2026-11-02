import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { Lock, Mail, AlertTriangle, Users, Sparkles } from 'lucide-react';
import logo from '../assets/logo.png';
import { DEMO_ACCOUNTS, isLocalEnvironment } from '../lib/demoAccounts.js';

export function LoginPage({ onNavigateToRegister, onNavigateToForgotPassword }) {
  const { signIn, configured, authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDemoEmail, setSelectedDemoEmail] = useState('');

  const isLocal = isLocalEnvironment();

  const handleSelectDemo = (selectedEmail) => {
    setSelectedDemoEmail(selectedEmail);
    const demo = DEMO_ACCOUNTS.find((a) => a.email === selectedEmail);
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
      if (error) setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 selection:bg-indigo-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <img
            src={logo}
            alt="MOM Creator"
            className="w-20 h-20 object-contain mx-auto drop-shadow-sm rounded-2xl"
          />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            MOM Creator
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to access your meeting minutes and action items.
          </p>
        </div>


        {/* Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          {!configured && (
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs flex items-start gap-2.5 text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Supabase Environment Configuration</p>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  Provide <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_ANON_KEY</code> in your local <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> file.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Demo Accounts Quick-Select */}
            <div className="pt-2 pb-1 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between gap-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Demo Accounts</span>
                </label>
                {!isLocal && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Sparkles className="w-2.5 h-2.5" />
                    No auth required
                  </span>
                )}
              </div>

              <select
                value={selectedDemoEmail}
                onChange={(e) => handleSelectDemo(e.target.value)}
                className="w-full text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              >
                <option value="">-- Choose an employee demo account --</option>
                {DEMO_ACCOUNTS.map((acc) => (
                  <option key={acc.email} value={acc.email}>
                    {acc.name} ({acc.email})
                  </option>
                ))}
              </select>
            </div>

            {(error || authError) && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {error || authError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={!configured && isLocal}
            >
              Sign In
            </Button>

            <div className="text-right">
              <button
                type="button"
                onClick={onNavigateToForgotPassword}
                className="text-xs font-semibold text-[#023b77] hover:text-[#039583] transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Don't have an account?</span>
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="text-brand-gradient font-semibold hover:text-indigo-700 cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
