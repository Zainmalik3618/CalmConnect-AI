

import React, { useState } from 'react';
import type { User } from '../types';
import { SpinnerIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from './Icons';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { calculatePasswordStrength } from '../utils/password';
import { validateEmail, validateUsername } from '../utils/validation';
import PasswordRequirements from './PasswordRequirements';
import type { Theme } from '../hooks/useTheme';
import { API_URL } from '../config/api';
import PublicAuthLayout from './PublicAuthLayout';

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
      </div>
    );
  };

  return (
    <PublicAuthLayout
      theme={theme}
      toggleTheme={toggleTheme}
      eyebrow={
        viewMode === 'login' ? 'Welcome back' :
        viewMode === 'register' ? 'Begin your journey' :
        viewMode === 'forgot' ? 'Account recovery' : 'Almost there'
      }
      title={
        viewMode === 'login' ? 'Sign in to CalmConnect' :
        viewMode === 'register' ? 'Create your account' :
        viewMode === 'forgot' ? 'Reset your password' : 'Check your inbox'
      }
      description={
        viewMode === 'login' ? 'Continue to your private care dashboard, conversations, and wellness tools.' :
        viewMode === 'register' ? 'Create a secure patient account and keep your wellbeing tools in one calm place.' :
        viewMode === 'forgot' ? 'Enter your email and we will help you safely regain access.' :
        'Verify your email address to activate your CalmConnect account.'
      }
      imageSrc={viewMode === 'register' ? '/signup.png' : '/signin.png'}
      imageAlt={
        viewMode === 'register'
          ? 'A patient beginning a welcoming mental wellness consultation'
          : 'A CalmConnect user reviewing their wellness progress at home'
      }
      imageVariant={viewMode === 'register' ? 'portrait' : 'landscape'}
      imageLabel={viewMode === 'register' ? 'Your care journey starts here' : 'Your private wellness space'}
    >
              {viewMode !== 'forgot' && viewMode !== 'verify' && (
                <div className="mb-6 grid grid-cols-2 rounded-xl border border-slate-200/70 bg-slate-100/80 p-1 dark:border-slate-700/70 dark:bg-slate-950/60">
                  <button
                    type="button"
                    onClick={() => handleToggleView('login')}
                    disabled={isLoading}
                    className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${viewMode === 'login' ? 'bg-white text-teal-800 shadow-sm dark:bg-slate-800 dark:text-teal-300' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleView('register')}
                    disabled={isLoading}
                    className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${viewMode === 'register' ? 'bg-white text-teal-800 shadow-sm dark:bg-slate-800 dark:text-teal-300' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
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
    </PublicAuthLayout>
  );
};

export default AuthView;
