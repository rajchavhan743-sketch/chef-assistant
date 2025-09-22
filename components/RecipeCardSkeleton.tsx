import React from 'react';

const RecipeCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="w-full aspect-video bg-gray-200 animate-pulse"></div>
      <div className="p-6">
        <div className="h-8 w-3/4 bg-gray-200 rounded-md animate-pulse mb-4"></div>
        <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse mb-2"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded-md animate-pulse mb-6"></div>
        
        <div className="flex justify-around text-center border-t border-b border-gray-100 py-3 my-4">
          <div className="w-1/4 h-12 bg-gray-100 rounded-md animate-pulse"></div>
          <div className="w-1/4 h-12 bg-gray-100 rounded-md animate-pulse"></div>
          <div className="w-1/4 h-12 bg-gray-100 rounded-md animate-pulse"></div>
          <div className="w-1/4 h-12 bg-gray-100 rounded-md animate-pulse"></div>
        </div>

        <div className="h-6 w-1/3 bg-gray-200 rounded-md animate-pulse mb-4"></div>
        <div className="space-y-2">
            <div className="h-4 w-full bg-gray-100 rounded-md animate-pulse"></div>
            <div className="h-4 w-full bg-gray-100 rounded-md animate-pulse"></div>
            <div className="h-4 w-2/3 bg-gray-100 rounded-md animate-pulse"></div>
        </div>

        <div className="h-6 w-1/3 bg-gray-200 rounded-md animate-pulse mt-6 mb-4"></div>
        <div className="space-y-2">
            <div className="h-4 w-full bg-gray-100 rounded-md animate-pulse"></div>
            <div className="h-4 w-full bg-gray-100 rounded-md animate-pulse"></div>
            <div className="h-4 w-4/5 bg-gray-100 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCardSkeleton;