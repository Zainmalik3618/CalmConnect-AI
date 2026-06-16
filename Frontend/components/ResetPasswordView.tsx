
import React, { useState, useEffect } from 'react';
import { LogoIcon, SpinnerIcon, EyeIcon, EyeSlashIcon, MoonIcon, SunIcon, CheckCircleIcon, ShieldCheckIcon } from './Icons';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { calculatePasswordStrength } from '../utils/password';
import PasswordRequirements from './PasswordRequirements';
import type { Theme } from '../hooks/useTheme';

const API_URL = 'http://localhost:3001/api';

interface ResetPasswordViewProps {
  theme: Theme;
  toggleTheme: () => void;
}

const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ theme, toggleTheme }) => {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setError('No reset token found. Please check your link or request a new one.');
    }
  }, []);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (passwordStrength < 3) {
      setError('Please choose a stronger password that meets all requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred.');
      }
      setSuccess(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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
              <p className="text-sm text-slate-500 dark:text-slate-400">Secure account recovery</p>
            </div>
          </div>

          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur dark:border-blue-900/50 dark:bg-slate-900/60 dark:text-blue-300">
              <ShieldCheckIcon className="h-4 w-4" />
              Protected password reset
            </div>
            <div className="space-y-5">
              <h1 className="text-5xl font-semibold leading-tight text-slate-950 dark:text-white xl:text-6xl">
                Create a strong password and get safely back in.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Your new password helps protect private conversations, appointments, journal entries, and wellness data.
              </p>
            </div>
            <div className="grid max-w-xl grid-cols-3 gap-3">
              {['Private data', 'Secure access', 'Care continuity'].map(item => (
                <div key={item} className="surface-motion rounded-xl border border-white/70 bg-white/75 p-4 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-500">Use a password you do not use anywhere else.</p>
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

            <div className="surface-motion rounded-2xl border border-white/70 bg-white/85 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/85 dark:shadow-black/30 sm:p-8">
              <div className="mb-7 space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">Account recovery</p>
                <h2 className="text-3xl font-semibold text-slate-950 dark:text-white">Reset your password</h2>
                <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Choose a new password that meets the security requirements below.
                </p>
              </div>

              {error && (
                <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </p>
              )}
              {success && (
                <p role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                  {success}
                </p>
              )}

              {success ? (
                <div className="view-transition space-y-5 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
                    <CheckCircleIcon className="h-7 w-7" />
                  </div>
                  <a
                    href="/"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Return to login
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="view-transition space-y-5">
                  <div>
                    <label htmlFor="new-password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      New password
                    </label>
                    <div className="relative mt-2">
                      <input
                        id="new-password"
                        name="new-password"
                        type={isPasswordVisible ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-lg shadow-sm bg-white/80 dark:bg-slate-950/40 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!token || isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                        aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                      >
                        {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    <PasswordStrengthIndicator strength={passwordStrength} />
                    <PasswordRequirements password={password} />
                  </div>
                  <div>
                    <label htmlFor="confirm-new-password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Confirm new password
                    </label>
                    <div className="relative mt-2">
                      <input
                        id="confirm-new-password"
                        name="confirm-new-password"
                        type={isConfirmPasswordVisible ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-lg shadow-sm bg-white/80 dark:bg-slate-950/40 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!token || isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                        aria-label={isConfirmPasswordVisible ? "Hide confirm password" : "Show confirm password"}
                      >
                        {isConfirmPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !token}
                    aria-busy={isLoading}
                    className="w-full flex justify-center items-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-lg shadow-sm shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? <SpinnerIcon /> : 'Reset password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResetPasswordView;
