import React from 'react';

const EmergencyBanner: React.FC = () => {
  return (
    <div className="sticky top-0 z-[60] bg-red-600 text-white text-center p-2 text-sm min-h-[48px] flex items-center justify-center shadow-lg border-b border-red-700" role="alert">
      <p className="px-4 leading-tight">
        <span className="inline-block mr-2 text-base" aria-hidden="true">⚠️</span>
        <span className="font-medium">Safety Warning:</span> If you are in a crisis or any person is in danger, please 
        <span className="font-bold ml-1">
          call <a href="tel:1122" className="underline hover:text-red-100 transition-colors">1122</a> or <a href="tel:15" className="underline hover:text-red-100 transition-colors">15</a> in Pakistan
        </span>, or contact local emergency services immediately. This site is not a crisis service.
      </p>
    </div>
  );
};

export default EmergencyBanner;