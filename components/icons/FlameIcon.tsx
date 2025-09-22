import React from 'react';

export const FlameIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22c-2 0-3-2-3-4s1-4 3-4 3 2 3 4-1 4-3 4Z" />
    <path d="M12 18c-3.5 0-6-2.5-6-6 0-4 4-6.5 6-12 2 5.5 6 8 6 12 0 3.5-2.5 6-6 6Z" />
  </svg>
);