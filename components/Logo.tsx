import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <defs>
        <linearGradient id="scissor-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" /> {/* indigo-400 */}
          <stop offset="100%" stopColor="#22d3ee" /> {/* cyan-400 */}
        </linearGradient>
      </defs>

      {/* Handles */}
      <circle cx="6" cy="6" r="3" stroke="url(#scissor-gradient)" />
      <circle cx="6" cy="18" r="3" stroke="url(#scissor-gradient)" />

      {/* Blades */}
      <path d="M20 4L8.12 15.88" stroke="url(#scissor-gradient)" />
      <path d="M14.47 14.48L20 20" stroke="url(#scissor-gradient)" />
      <path d="M8.12 8.12L12 12" stroke="url(#scissor-gradient)" />
    </svg>
  );
};

export default Logo;
