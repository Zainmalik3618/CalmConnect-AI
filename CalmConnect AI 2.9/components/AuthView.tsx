

import React, { useState } from 'react';
import type { User } from '../types';
import { LogoIcon, SpinnerIcon, EyeIcon, EyeSlashIcon } from './Icons';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { calculatePasswordStrength } from '../utils/password';
import { validateEmail, validateUsername } from '../utils/validation';
import PasswordRequirements from './PasswordRequirements';

const API_URL = 'http://localhost:3001/api';

interface AuthViewProps {
  onAuthSuccess: (data: { token: string; user: User }, isNewUser: boolean) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
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
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold">Please Verify Your Email</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We've sent a verification link to <strong>{email}</strong>. Please check your inbox (and spam folder) to activate your account.
          </p>
          <button 
            onClick={handleResendVerification}
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <SpinnerIcon /> : 'Resend Verification Email'}
          </button>
          {formMessage && <p role="status" className="text-green-500 text-sm text-center pt-2">{formMessage}</p>}
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Already verified?
            <button onClick={() => handleToggleView('login')} className="ml-1 font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 rounded-sm" disabled={isLoading}>
              Sign in
            </button>
          </p>
        </div>
      );
    }

    if (viewMode === 'forgot') {
      return (
        <>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Enter your email address and we will send you a link to reset your password.
          </p>
          {formMessage && <p role="status" className="text-green-500 text-sm text-center">{formMessage}</p>}
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
             <div>
              <button
                type="submit"
                disabled={isLoading}
                aria-busy={isLoading}
                className="w-full flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? <SpinnerIcon /> : 'Send Reset Link'}
              </button>
            </div>
          </form>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Remembered your password?
            <button onClick={() => handleToggleView('login')} className="ml-1 font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 rounded-sm" disabled={isLoading}>
              Sign in
            </button>
          </p>
        </>
      );
    }

    const isLoginView = viewMode === 'login';

    return (
      <>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLoginView && (
            <div>
              <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <div className="flex justify-between items-center">
                <label htmlFor="password"  className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
                </label>
                {isLoginView && (
                    <button type="button" onClick={() => handleToggleView('forgot')} className="text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 rounded-sm" disabled={isLoading}>
                        Forgot your password?
                    </button>
                )}
            </div>
            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type={isPasswordVisible ? 'text' : 'password'}
                autoComplete={isLoginView ? "current-password" : "new-password"}
                required
                value={password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
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
              <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={isConfirmPasswordVisible ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                 <button
                    type="button"
                    onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
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
              className="w-full flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
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
                <button onClick={handleResendVerification} className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Resend verification email'}
                </button>
                {formMessage && <p role="status" className="text-green-500 text-sm text-center pt-2">{formMessage}</p>}
            </div>
        )}
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          {isLoginView ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => handleToggleView(isLoginView ? 'register' : 'login')} className="ml-1 font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 rounded-sm" disabled={isLoading}>
            {isLoginView ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex flex-col items-center">
           <LogoIcon />
           <h1 className="text-2xl font-bold mt-2 text-gray-800 dark:text-white">CalmConnect AI</h1>
           <p className="text-gray-500 dark:text-gray-400">
             {viewMode === 'login' && 'Welcome back'}
             {viewMode === 'register' && 'Create your account'}
             {viewMode === 'forgot' && 'Reset your password'}
             {viewMode === 'verify' && 'Almost there...'}
           </p>
        </div>
        
        {error && <p role="alert" className="text-red-500 text-sm text-center">{error}</p>}
        {renderContent()}
      </div>
    </div>
  );
};

export default AuthView;