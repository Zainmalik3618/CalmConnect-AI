

import React, { useState } from 'react';
import type { User } from '../types';
import { LogoIcon, SpinnerIcon, EyeIcon, EyeSlashIcon, MoonIcon, SunIcon, CheckCircleIcon } from './Icons';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { calculatePasswordStrength } from '../utils/password';
import { validateEmail, validateUsername } from '../utils/validation';
import PasswordRequirements from './PasswordRequirements';
import type { Theme } from '../hooks/useTheme';

const API_URL = 'http://localhost:3001/api';

interface AuthViewProps {
  onAuthSuccess: (data: { token: string; refreshToken?: string; user: User }, isNewUser: boolean) => void;
  theme: Theme;
  toggleTheme: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess, theme, toggleTheme }) => {
  const [viewMode, setViewMode] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const resetForm = () => {
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setFormMessage('');
    setPasswordStrength(0);
  }

  const handleToggleView = (newView: 'login' | 'register' | 'forgot') => {
    setViewMode(newView);
    resetForm();
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (viewMode === 'register') {
      setPasswordStrength(calculatePasswordStrength(newPassword));
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address to resend the verification link.');
      return;
    }
    setIsLoading(true);
    setError('');
    setFormMessage('');
    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setFormMessage(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFormMessage('');
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred.');
      }
      setFormMessage(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFormMessage('');

    const isLoginView = viewMode === 'login';
    const url = isLoginView ? `${API_URL}/auth/login` : `${API_URL}/auth/register`;
    const body = isLoginView ? { email, password } : { username, email, password };
    
    // Client-side validation for registration
    if (!isLoginView) {
        if (!validateUsername(username)) {
            setError('Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens.');
            setIsLoading(false);
            return;
        }
        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            setIsLoading(false);
            return;
        }
        if (passwordStrength < 3) {
            setError('Please choose a stronger password.');
            setIsLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setIsLoading(false);
            return;
        }
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            // Special handling for email verification error on login
            if (isLoginView && data.code === 'EMAIL_NOT_VERIFIED') {
                setError(data.message);
            } else {
                throw new Error(data.message || 'An error occurred.');
            }
        } else {
             if (isLoginView) {
                onAuthSuccess(data, false);
            } else {
                // On successful registration, switch to the verification prompt view
                setViewMode('verify');
            }
        }

    } catch (err: any) {
        if (!error) { // Don't overwrite the specific verification error
            setError(err.message);
        }
    } finally {
        setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (viewMode === 'verify') {
      return (
        <div className="view-transition text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
            <CheckCircleIcon />
          </div>
          <h3 className="text-2xl font-semibold text-slate-950 dark:text-white">Please verify your email</h3>
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            We've sent a verification link to <strong>{email}</strong>. Please check your inbox (and spam folder) to activate your account.
          </p>
          <button 
            onClick={handleResendVerification}
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-lg shadow-sm shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? <SpinnerIcon /> : 'Resend Verification Email'}
          </button>
          {formMessage && <p role="status" className="text-green-500 text-sm text-center pt-2">{formMessage}</p>}
          <p className="text-sm text-center text-slate-600 dark:text-slate-400">
            Already verified?
            <button onClick={() => handleToggleView('login')} className="ml-1 font-semibold text-blue-600 hover:text-blue-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 rounded-sm" disabled={isLoading}>
              Sign in
            </button>
          </p>
        </div>
      );
    }

    if (viewMode === 'forgot') {
      return (
        <div className="view-transition space-y-6">
          <p className="text-center text-sm leading-6 text-slate-500 dark:text-slate-400">
            Enter your email address and we will send you a link to reset your password.
          </p>
          {formMessage && <p role="status" className="text-green-500 text-sm text-center">{formMessage}</p>}
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 mt-2 border border-slate-200 rounded-lg shadow-sm bg-white/80 dark:bg-slate-950/40 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
             <div>
              <button
                type="submit"
                disabled={isLoading}
                aria-busy={isLoading}
                className="w-full flex justify-center items-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-lg shadow-sm shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? <SpinnerIcon /> : 'Send Reset Link'}
              </button>
            </div>
          </form>
          <p className="text-sm text-center text-slate-600 dark:text-slate-400">
            Remembered your password?
            <button onClick={() => handleToggleView('login')} className="ml-1 font-semibold text-blue-600 hover:text-blue-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 rounded-sm" disabled={isLoading}>
              Sign in
            </button>
          </p>
        </div>
      );
    }

    const isLoginView = viewMode === 'login';

    return (
      <div className="view-transition space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLoginView && (
            <div>
              <label htmlFor="username" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 mt-2 border border-slate-200 rounded-lg shadow-sm bg-white/80 dark:bg-slate-950/40 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 mt-2 border border-slate-200 rounded-lg shadow-sm bg-white/80 dark:bg-slate-950/40 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <div className="flex justify-between items-center">
                <label htmlFor="password"  className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
                </label>
                {isLoginView && (
                    <button type="button" onClick={() => handleToggleView('forgot')} className="text-sm font-semibold text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 rounded-sm" disabled={isLoading}>
                        Forgot your password?
                    </button>
                )}
            </div>
            <div className="relative mt-2">
              <input
                id="password"
                name="password"
                type={isPasswordVisible ? 'text' : 'password'}
                autoComplete={isLoginView ? "current-password" : "new-password"}
                required
                value={password}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-lg shadow-sm bg-white/80 dark:bg-slate-950/40 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            {!isLoginView && <PasswordStrengthIndicator strength={passwordStrength} />}
            {!isLoginView && <PasswordRequirements password={password} />}
          </div>
           {!isLoginView && (
            <div>
              <label htmlFor="confirm-password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Confirm Password
              </label>
              <div className="relative mt-2">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={isConfirmPasswordVisible ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-lg shadow-sm bg-white/80 dark:bg-slate-950/40 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          )}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
              className="w-full flex justify-center items-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-lg shadow-sm shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <SpinnerIcon />
                  <span>{isLoginView ? 'Signing in...' : 'Creating Account...'}</span>
                </>
              ) : (
                isLoginView ? 'Sign in' : 'Create Account'
              )}
            </button>
          </div>
        </form>
        {error.includes('verify your email') && (
            <div className="text-center mt-4">
                <button onClick={handleResendVerification} className="text-sm font-semibold text-blue-600 hover:text-blue-500 disabled:opacity-50" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Resend verification email'}
                </button>
                {formMessage && <p role="status" className="text-green-500 text-sm text-center pt-2">{formMessage}</p>}
            </div>
        )}
        <p className="text-sm text-center text-slate-600 dark:text-slate-400">
          {isLoginView ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => handleToggleView(isLoginView ? 'register' : 'login')} className="ml-1 font-semibold text-blue-600 hover:text-blue-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 rounded-sm" disabled={isLoading}>
            {isLoginView ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    );
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
              <p className="text-sm text-slate-500 dark:text-slate-400">Clinical support, connected care</p>
            </div>
          </div>

          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur dark:border-blue-900/50 dark:bg-slate-900/60 dark:text-blue-300">
              Secure mental wellness workspace
            </div>
            <div className="space-y-5">
              <h1 className="text-5xl font-semibold leading-tight text-slate-950 dark:text-white xl:text-6xl">
                Care tools that feel calm, clear, and human.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Sign in to continue with private conversations, mood insights, appointments, and coordinated support across patients and professionals.
              </p>
            </div>
            <div className="grid max-w-xl grid-cols-3 gap-3">
              {['AI support', 'Mood tracking', 'Care coordination'].map(item => (
                <div key={item} className="surface-motion rounded-xl border border-white/70 bg-white/75 p-4 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-500">Built for thoughtful mental health workflows.</p>
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
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                  {viewMode === 'login' && 'Welcome back'}
                  {viewMode === 'register' && 'Start your account'}
                  {viewMode === 'forgot' && 'Account recovery'}
                  {viewMode === 'verify' && 'Almost there'}
                </p>
                <h2 className="text-3xl font-semibold text-slate-950 dark:text-white">
                  {viewMode === 'login' && 'Sign in to CalmConnect'}
                  {viewMode === 'register' && 'Create your CalmConnect account'}
                  {viewMode === 'forgot' && 'Reset your password'}
                  {viewMode === 'verify' && 'Check your inbox'}
                </h2>
                <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {viewMode === 'login' && 'Access your care dashboard, conversations, and wellness tools.'}
                  {viewMode === 'register' && 'Create a secure patient account and begin your wellness journey.'}
                  {viewMode === 'forgot' && 'We will help you get safely back into your account.'}
                  {viewMode === 'verify' && 'One final step before your account is activated.'}
                </p>
              </div>

              {viewMode !== 'forgot' && viewMode !== 'verify' && (
                <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-950/60">
                  <button
                    type="button"
                    onClick={() => handleToggleView('login')}
                    disabled={isLoading}
                    className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${viewMode === 'login' ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-800 dark:text-blue-300' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleView('register')}
                    disabled={isLoading}
                    className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${viewMode === 'register' ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-800 dark:text-blue-300' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                  >
                    Sign up
                  </button>
                </div>
              )}
              
              {error && (
                <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </p>
              )}
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthView;
