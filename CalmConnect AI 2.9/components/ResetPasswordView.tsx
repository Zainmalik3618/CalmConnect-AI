
import React, { useState, useEffect } from 'react';
import { LogoIcon, SpinnerIcon, EyeIcon, EyeSlashIcon } from './Icons';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { calculatePasswordStrength } from '../utils/password';
import PasswordRequirements from './PasswordRequirements';

const API_URL = 'http://localhost:3001/api';

const ResetPasswordView: React.FC = () => {
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex flex-col items-center">
           <LogoIcon />
           <h1 className="text-2xl font-bold mt-2 text-gray-800 dark:text-white">Reset Your Password</h1>
        </div>
        
        {error && <p role="alert" className="text-red-500 text-sm text-center">{error}</p>}
        {success && <p role="status" className="text-green-500 text-sm text-center">{success}</p>}

        {success ? (
          <div className="text-center">
            <a href="/" className="font-medium text-blue-600 hover:text-blue-500">
              Click here to return to the login page
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="new-password"  className="text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  id="new-password"
                  name="new-password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!token || isLoading}
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                  aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                >
                  {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              <PasswordStrengthIndicator strength={passwordStrength} />
              <PasswordRequirements password={password} />
            </div>
             <div>
              <label htmlFor="confirm-new-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <div className="relative mt-1">
                <input
                  id="confirm-new-password"
                  name="confirm-new-password"
                  type={isConfirmPasswordVisible ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!token || isLoading}
                />
                 <button
                    type="button"
                    onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                    aria-label={isConfirmPasswordVisible ? "Hide confirm password" : "Show confirm password"}
                  >
                    {isConfirmPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading || !token}
                aria-busy={isLoading}
                className="w-full flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? <SpinnerIcon /> : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordView;
