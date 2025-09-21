import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`overflow-hidden ${className || ''}`.trim()}>{children}</div>
);

// FIX: Add className prop to CardHeader for API consistency with other Card components.
export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`p-6 ${className || ''}`.trim()}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h3 className={`text-xl font-semibold ${className || ''}`.trim()}>{children}</h3>
);

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <p className={`text-sm text-gray-500 ${className || ''}`.trim()}>{children}</p>
);

// FIX: Add className prop to CardContent to fix type error in RecipeCard.tsx.
export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`p-6 pt-0 ${className || ''}`.trim()}>{children}</div>
);
