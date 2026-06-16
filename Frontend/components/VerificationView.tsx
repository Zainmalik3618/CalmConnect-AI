import React, { useState, useEffect, useRef } from 'react';
import { LogoIcon, SpinnerIcon, CheckCircleIcon, WarningIcon, MoonIcon, SunIcon, ShieldCheckIcon } from './Icons';
import type { Theme } from '../hooks/useTheme';

const API_URL = 'http://localhost:3001/api';

type VerificationStatus = 'verifying' | 'success' | 'error';

interface VerificationViewProps {
  theme: Theme;
  toggleTheme: () => void;
}

const VerificationView: React.FC<VerificationViewProps> = ({ theme, toggleTheme }) => {
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [message, setMessage] = useState('Verifying your email address...');
  const [emailForResend, setEmailForResend] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  // Prevent double-run in React 18 StrictMode (dev)
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const verifyToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setMessage('No verification token found. Please check the link in your email.');
        return;
      }

      try {
        const resp = await fetch(`${API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`, {
          method: 'GET',
        });

        // Try to parse JSON safely even for 204/empty bodies
        let data: any = {};
        const ct = resp.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          try {
            data = await resp.json();
          } catch (_) {
            data = {};
          }
        }

        // Treat already-verified responses as success if your API uses 409/400
        if (resp.ok || resp.status === 409) {
          setStatus('success');
          setMessage(
            data?.message ||
              (resp.status === 409 ? 'Email already verified. You can log in now.' : 'Email verified successfully.')
          );
        } else {
          throw new Error(data?.message || 'Failed to verify email. The link may be invalid or expired.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err?.message || 'Failed to verify email. The link may be invalid or expired.');
      }
    };

    verifyToken();
  }, []);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForResend) {
      setResendError('Please enter your email address.');
      return;
    }
    setIsResending(true);
    setResendError('');
    setResendMessage('');
    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailForResend }),
      });
      let data: any = {};
      const ct = response.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        try {
          data = await response.json();
        } catch (_) {}
      }
      if (!response.ok) throw new Error(data?.message || 'Unable to resend verification email.');
      setResendMessage(data?.message || 'A new verification link has been sent to your email.');
    } catch (err: any) {
      setResendError(err?.message || 'An error occurred.');
    } finally {
      setIsResending(false);
    }
  };

  const renderStatus = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
              <SpinnerIcon className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-semibold mt-5 text-slate-950 dark:text-white">{message}</h2>
          </>
        );
      case 'success':
        return (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
              <CheckCircleIcon className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-semibold mt-5 text-slate-950 dark:text-white">Verification successful</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 leading-6">{message}</p>
            <a
              href="/"
              className="mt-6 inline-flex w-full items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Proceed to login
            </a>
          </>
        );
      case 'error':
        return (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300">
              <WarningIcon className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-semibold mt-5 text-slate-950 dark:text-white">Verification failed</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 leading-6">{message}</p>

            <div className="w-full text-left mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Need a new verification link?</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Enter your email below to receive a new one.</p>
              <form onSubmit={handleResendVerification} className="space-y-4">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={emailForResend}
                    onChange={(e) => setEmailForResend(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg shadow-sm bg-white/80 dark:bg-slate-950/40 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {resendError && (
                  <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-xs dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                    {resendError}
                  </p>
                )}
                {resendMessage && (
                  <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700 text-xs dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                    {resendMessage}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isResending}
                  className="w-full flex justify-center items-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all"
                >
                  {isResending ? <SpinnerIcon /> : 'Resend Link'}
                </button>
              </form>
            </div>

            <a
              href="/"
              className="mt-4 inline-flex w-full items-center justify-center px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Return to login
            </a>
          </>
        );
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="fixed inset-0 min-h-screen bg-[radial-gradient(ellipse_70%_55%_at_15%_15%,rgba(37,99,235,0.16),transparent_62%),radial-gradient(ellipse_65%_55%_at_88%_22%,rgba(14,165,233,0.14),transparent_64%),linear-gradient(135deg,#f8fafc_0%,#eef6ff_48%,#f8fafc_100%)] dark:bg-[radial-gradient(ellipse_70%_55%_at_15%_15%,rgba(59,130,246,0.2),transparent_62%),radial-gradient(ellipse_65%_55%_at_88%_22%,rgba(45,212,191,0.14),transparent_64%),linear-gradient(135deg,#020617_0%,#0f172a_52%,#020617_100%)]" />
      <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:flex flex-col justify-between p-10 xl:p-14">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <div>
              <p className="text-lg font-semibold text-slate-950 dark:text-white">CalmConnect AI</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Email verification</p>
            </div>
          </div>

          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur dark:border-blue-900/50 dark:bg-slate-900/60 dark:text-blue-300">
              <ShieldCheckIcon className="h-4 w-4" />
              Secure account activation
            </div>
            <div className="space-y-5">
              <h1 className="text-5xl font-semibold leading-tight text-slate-950 dark:text-white xl:text-6xl">
                Confirm your email to protect your care workspace.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Verification keeps your account private and ensures important appointment, message, and account notifications reach you.
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-500">This usually takes only a moment.</p>
        </section>

        <main className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-10">
          <div className="w-full max-w-md">
            <div className="mb-5 flex items-center justify-between lg:justify-end">
              <div className="flex items-center gap-3 lg:hidden">
                <LogoIcon />
                <span className="font-semibold text-slate-950 dark:text-white">CalmConnect AI</span>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 shadow-sm backdrop-blur hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-blue-300"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                title={theme === 'light' ? 'Dark mode' : 'Light mode'}
              >
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
              </button>
            </div>

            <div className="surface-motion rounded-2xl border border-white/70 bg-white/85 p-6 text-center shadow-2xl shadow-slate-200/70 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/85 dark:shadow-black/30 sm:p-8">
              <div className="mb-7 space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">Account verification</p>
                <h2 className="text-3xl font-semibold text-slate-950 dark:text-white">Verify your email</h2>
                <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                  We are checking the verification link attached to your account.
                </p>
              </div>
              <div className="view-transition flex flex-col items-center">{renderStatus()}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VerificationView;
