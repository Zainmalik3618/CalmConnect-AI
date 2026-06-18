
import React, { useState, useEffect } from 'react';
import { SpinnerIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from './Icons';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { calculatePasswordStrength } from '../utils/password';
import PasswordRequirements from './PasswordRequirements';
import type { Theme } from '../hooks/useTheme';
import { API_URL } from '../config/api';
import PublicAuthLayout from './PublicAuthLayout';

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
    <PublicAuthLayout
      theme={theme}
      toggleTheme={toggleTheme}
      eyebrow="Secure account recovery"
      title="Choose a new password"
      description="Create a strong password to protect your private conversations, appointments, journal entries, and wellness data."
      imageLabel="Protected access"
      imageSrc="/signup.jpg"
      imageAlt="A patient speaking with a supportive mental health professional"
      imageVariant="portrait"
    >
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
    </PublicAuthLayout>
  );
};

export default ResetPasswordView;
