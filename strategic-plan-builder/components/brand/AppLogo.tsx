import React from 'react';

interface AppLogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'admin';
}

export function AppLogo({ className = '', showText = true, variant = 'default' }: AppLogoProps) {
  const isAdmin = variant === 'admin';
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <div className={`relative ${isAdmin ? 'bg-gradient-to-br from-[#eb5e28] to-[#eb5e28]/80' : 'bg-gradient-to-br from-blue-500 to-blue-600'} rounded-lg p-2 shadow-lg`}>
        <svg
          className="w-6 h-6 text-[#fffcf2]"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dashboard Grid */}
          <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.9" />
          <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.7" />
          <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" opacity="0.7" />
          
          {/* Chart/Graph Lines */}
          <path
            d="M15 19L17 17L19 19L21 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Target/Goal Indicator */}
          <circle cx="17.5" cy="17.5" r="1" fill="currentColor" />
        </svg>
      </div>
      
      {/* Text Logo */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-lg leading-tight ${isAdmin ? 'text-[#fffcf2]' : 'text-gray-900'}`}>
            Strategic Dashboard
          </span>
          <span className={`text-xs ${isAdmin ? 'text-[#ccc5b9]' : 'text-gray-500'}`}>
            {isAdmin ? 'System Administration' : 'Builder'}
          </span>
        </div>
      )}
    </div>
  );
}