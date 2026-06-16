import React from 'react';
import { CheckIcon } from './Icons';

interface PasswordRequirementsProps {
  password?: string;
}

const Requirement: React.FC<{ met: boolean; children: React.ReactNode }> = ({ met, children }) => {
  return (
    <li className={`flex items-center text-sm transition-colors ${met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
      <CheckIcon className={`mr-2 h-4 w-4 flex-shrink-0 ${met ? 'text-green-500' : 'text-gray-400'}`} />
      <span>{children}</span>
    </li>
  );
};

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password = '' }) => {
  const requirements = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[^a-zA-Z0-9]/.test(password),
  };

  return (
    <div className="mt-2 space-y-1">
        <Requirement met={requirements.minLength}>Minimum 8 characters</Requirement>
        <Requirement met={requirements.lowercase}>At least one lowercase letter (a-z)</Requirement>
        <Requirement met={requirements.uppercase}>At least one uppercase letter (A-Z)</Requirement>
        <Requirement met={requirements.number}>At least one number (0-9)</Requirement>
        <Requirement met={requirements.specialChar}>At least one special character (!@#$%^&*)</Requirement>
    </div>
  );
};

export default PasswordRequirements;