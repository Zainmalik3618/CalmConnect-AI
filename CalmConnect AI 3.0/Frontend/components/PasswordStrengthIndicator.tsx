import React from 'react';

interface PasswordStrengthIndicatorProps {
  strength: number; // 0: none, 1: weak, 2: medium, 3: strong, 4: very strong
}

const strengthLevels = [
  { label: '', color: 'bg-gray-200 dark:bg-gray-600' }, // Level 0
  { label: 'Weak', color: 'bg-red-500' },               // Level 1
  { label: 'Medium', color: 'bg-yellow-500' },          // Level 2
  { label: 'Strong', color: 'bg-green-500' },           // Level 3
  { label: 'Very Strong', color: 'bg-emerald-600' },    // Level 4
];

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ strength }) => {
  const currentLevel = strengthLevels[strength] || strengthLevels[0];
  
  return (
    <div className="mt-2">
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors ${index < strength ? currentLevel.color : 'bg-gray-200 dark:bg-gray-600'}`}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className={`text-xs mt-1 font-medium transition-colors ${
            strength === 1 ? 'text-red-500' :
            strength === 2 ? 'text-yellow-500' :
            strength === 3 ? 'text-green-500' :
            'text-emerald-600'
        }`}>
          {currentLevel.label}
        </p>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;