import React from 'react';

const EmergencyBanner: React.FC = () => {
  return (
    <div className="bg-red-500 text-white text-center p-2 text-sm h-[40px] flex items-center justify-center">
      <p>
        If you are in a crisis or any other person may be in danger, please don't use this site. 
        <span className="font-semibold ml-1">Call <a href="tel:1122" className="underline hover:text-red-200">1122</a> or <a href="tel:15" className="underline hover:text-red-200">15</a> in Pakistan</span>, or contact your local emergency services.
      </p>
    </div>
  );
};

export default EmergencyBanner;