'use client';

import React from 'react';

interface TrafficSignDisplayProps {
  signSymbol?: string;
  signType?: 'warning' | 'priority' | 'prohibitory' | 'mandatory' | 'information';
  size?: 'sm' | 'md' | 'lg';
}

export function TrafficSignDisplay({ signSymbol = '2.4', signType = 'priority', size = 'lg' }: TrafficSignDisplayProps) {
  const dimension = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
  }[size];

  // Specific renders based on official Uzbek Road Sign codes
  if (signSymbol === '2.4') {
    // 2.4: "Yo'l bering" (Inverted yield triangle: White with red border)
    return (
      <div className={`relative flex items-center justify-center ${dimension} drop-shadow-md`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="10,20 90,20 50,88"
            fill="#FFFFFF"
            stroke="#DC2626"
            strokeWidth="10"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  if (signSymbol === '3.20') {
    // 3.20: "Quvib o'tish taqiqlanadi" (Red circle with black and red car)
    return (
      <div className={`relative flex items-center justify-center ${dimension} drop-shadow-md`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="44" fill="#FFFFFF" stroke="#DC2626" strokeWidth="9" />
          {/* Black car on right */}
          <rect x="52" y="44" width="22" height="15" rx="3" fill="#0F172A" />
          <polygon points="56,44 60,35 68,35 72,44" fill="#0F172A" />
          <circle cx="58" cy="59" r="3" fill="#64748B" />
          <circle cx="68" cy="59" r="3" fill="#64748B" />

          {/* Red car on left */}
          <rect x="26" y="44" width="22" height="15" rx="3" fill="#DC2626" />
          <polygon points="30,44 34,35 42,35 46,44" fill="#DC2626" />
          <circle cx="32" cy="59" r="3" fill="#0F172A" />
          <circle cx="42" cy="59" r="3" fill="#0F172A" />
        </svg>
      </div>
    );
  }

  if (signSymbol === '3.24' || signSymbol === '4.6') {
    // Speed limit (60)
    return (
      <div className={`relative flex items-center justify-center ${dimension} drop-shadow-md`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="44" fill="#FFFFFF" stroke="#DC2626" strokeWidth="9" />
          <text
            x="50"
            y="61"
            textAnchor="middle"
            fill="#0F172A"
            fontSize="34"
            fontWeight="bold"
            fontFamily="Inter, sans-serif"
          >
            60
          </text>
        </svg>
      </div>
    );
  }

  if (signSymbol === '3.27') {
    // 3.27: "To'xtash taqiqlanadi" (Red circle with blue background and red X)
    return (
      <div className={`relative flex items-center justify-center ${dimension} drop-shadow-md`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="44" fill="#2563EB" stroke="#DC2626" strokeWidth="9" />
          <line x1="20" y1="20" x2="80" y2="80" stroke="#DC2626" strokeWidth="8" strokeLinecap="round" />
          <line x1="80" y1="20" x2="20" y2="80" stroke="#DC2626" strokeWidth="8" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (signSymbol === '1.1') {
    // Warning triangle (Railway / Intersection)
    return (
      <div className={`relative flex items-center justify-center ${dimension} drop-shadow-md`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="50,12 90,82 10,82"
            fill="#FFFFFF"
            stroke="#DC2626"
            strokeWidth="8"
            strokeLinejoin="round"
          />
          <line x1="50" y1="36" x2="50" y2="60" stroke="#0F172A" strokeWidth="7" strokeLinecap="round" />
          <circle cx="50" cy="71" r="3.5" fill="#0F172A" />
        </svg>
      </div>
    );
  }

  // Fallback generic traffic sign symbol
  return (
    <div className={`relative flex items-center justify-center ${dimension} drop-shadow-md`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="44" fill="#2563EB" />
        <path d="M40 70 L50 30 L60 70 Z" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
