import React, { useState, useEffect, useRef } from 'react';
import { LogoIcon, SpinnerIcon, CheckCircleIcon, WarningIcon } from './Icons';

const API_URL = 'http://localhost:3001/api';

type VerificationStatus = 'verifying' | 'success' | 'error';

const VerificationView: React.FC = () => {
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
            <SpinnerIcon className="h-12 w-12 text-blue-500" />
            <h2 className="text-xl font-semibold mt-4">{message}</h2>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircleIcon className="h-16 w-16 text-green-500" />
            <h2 className="text-xl font-semibold mt-4">Verification Successful</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{message}</p>
            <a
              href="/"
              className="mt-6 inline-block px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Proceed to Login
            </a>
          </>
        );
      case 'error':
        return (
          <>
            <WarningIcon />
            <h2 className="text-xl font-semibold mt-4">Verification Failed</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{message}</p>

            <div className="w-full text-left mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Need a new verification link?</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Enter your email below to receive a new one.</p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {resendError && (
                  <p role="alert" className="text-red-500 text-xs">
                    {resendError}
                  </p>
                )}
                {resendMessage && (
                  <p role="status" className="text-green-500 text-xs">
                    {resendMessage}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isResending}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isResending ? <SpinnerIcon /> : 'Resend Link'}
                </button>
              </form>
            </div>

            <a
              href="/"
              className="mt-6 inline-block px-6 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Return to Login
            </a>
          </>
        );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800 text-center">
        <div className="flex justify-center">
          <LogoIcon />
        </div>
        <div className="flex flex-col items-center text-gray-800 dark:text-white">{renderStatus()}</div>
      </div>
    </div>
  );
};

export default VerificationView;
