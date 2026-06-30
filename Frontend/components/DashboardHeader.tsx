import React, { useState } from 'react';
import { AlertCircle, LogOut, Moon, Sun, UserRound } from 'lucide-react';
import type { Theme } from '../hooks/useTheme';
import type { User, View } from '../types';
import ConfirmationDialog from './ConfirmationDialog';
import { LogoIcon } from './Icons';
import ReportIssueModal from './ReportIssueModal';

interface DashboardHeaderProps {
  currentUser: User;
  currentView: View;
  setCurrentView: (view: View) => void;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
}

const roleLabels: Record<User['role'], string> = {
  patient: 'Patient workspace',
  psychiatrist: 'Clinical workspace',
  admin: 'Admin workspace',
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentUser,
  currentView,
  setCurrentView,
  onLogout,
  theme,
  toggleTheme,
  apiFetch,
}) => {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const iconActionClass =
    'group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white';

  const tooltipClass =
    'pointer-events-none absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-gray-100 dark:text-gray-900';

  return (
    <>
      <header className="role-app-header sticky top-0 z-50 flex h-20 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white/95 px-4 shadow-sm backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/95 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <LogoIcon className="h-10 w-10 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-gray-900 dark:text-white sm:text-xl">CalmConnect AI</h1>
            <p className="truncate text-xs font-semibold text-gray-500 dark:text-gray-400">{roleLabels[currentUser.role]}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentView('profile')}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white ${currentView === 'profile' ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300' : ''}`}
            aria-label="Open profile"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200">
              <UserRound className="h-4 w-4" />
            </span>
            <span className="hidden max-w-32 truncate md:inline">{currentUser.username}</span>
          </button>

          <button type="button" onClick={toggleTheme} className={iconActionClass} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span role="tooltip" className={tooltipClass}>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
          </button>

          <button type="button" onClick={() => setIsReportModalOpen(true)} className={iconActionClass} aria-label="Report an issue">
            <AlertCircle className="h-5 w-5" />
            <span role="tooltip" className={tooltipClass}>Report issue</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-red-900/60 dark:bg-gray-800 dark:text-red-300 dark:hover:bg-red-950/30"
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5" />
            <span role="tooltip" className={tooltipClass}>Log out</span>
          </button>
        </div>
      </header>

      <ConfirmationDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={onLogout}
        title="Confirm Logout"
        confirmText="Log Out"
      >
        Are you sure you want to log out of your account?
      </ConfirmationDialog>

      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        apiFetch={apiFetch}
      />
    </>
  );
};

export default DashboardHeader;
