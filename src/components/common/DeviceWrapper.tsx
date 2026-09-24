'use client';

import React from 'react';

export function DeviceWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col transition-colors selection:bg-blue-500 selection:text-white">
      {/* Maximum content width 1440px, centered container with responsive fluid padding */}
      <div className="w-full max-w-[1440px] mx-auto min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
