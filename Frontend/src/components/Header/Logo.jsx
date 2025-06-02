import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  };

  return (
    <div  className={`flex items-center gap-2 group ${sizeClasses[size]}`}>
      {/* Document icon */}
      <div className="relative h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <div className="absolute -inset-1 rounded-lg bg-blue-600/50 -z-10 animate-pulse" />
      </div>
      
      {/* Text with animated underline */}
      <div className="relative">
        <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <Link to="/">ResumeIt</Link>
        </span>
        <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 w-0 group-hover:w-full transition-all duration-500" />
      </div>
    </div>
  );
};

export default Logo;