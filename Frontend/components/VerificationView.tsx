import React, { useState, useEffect, useRef } from 'react';
import { CheckCircleIcon, WarningIcon } from './Icons';
import type { Theme } from '../hooks/useTheme';
import { API_URL } from '../config/api';
import PublicAuthLayout from './PublicAuthLayout';

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
            <div className="loading-skeleton mx-auto h-14 w-14 rounded-2xl" />
            <div className="loading-skeleton mx-auto mt-5 h-7 w-64 rounded" aria-label={message} />
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
                  {isResending ? <span className="loading-skeleton-on-accent h-4 w-24 rounded" /> : 'Resend Link'}
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
    <PublicAuthLayout
      theme={theme}
      toggleTheme={toggleTheme}
      eyebrow="Account verification"
      title="Verify your email"
      description="We are checking the secure link attached to your account. This usually takes only a moment."
      imageLabel="Secure account activation"
      imageSrc="/signin.jpg"
      imageAlt="A CalmConnect user reviewing their private wellness dashboard"
      imageVariant="landscape"
    >
      <div className="view-transition flex flex-col items-center text-center">{renderStatus()}</div>
    </PublicAuthLayout>
  );
};

export default VerificationView;
