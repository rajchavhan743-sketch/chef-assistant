import React from 'react';
import type { Recipe } from '../types';
import RecipeCard from './RecipeCard';
import { Spinner } from './ui/Spinner';

interface RecipeDisplayProps {
  recipes: Recipe[];
  isLoading: boolean;
  onAddToShoppingList: (items: string[]) => void;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipes, isLoading, onAddToShoppingList }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <Spinner />
        <p className="mt-4 text-lg font-semibold text-gray-700">Finding the best recipes for you...</p>
        <p className="text-gray-500">This might take a moment.</p>
      </div>
    );
  }

  if (recipes.length === 0 && !isLoading) {
    return (
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">Ready to Cook?</h3>
            <p className="mt-2 text-gray-600">Add your ingredients and click "Generate Recipes" to discover your next meal!</p>
        </div>
    );
  }
  
  if (recipes.length === 0) {
      return null;
  }


  return (
    <div>
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Your Custom Recipes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe, index) => (
                <RecipeCard 
                  key={index} 
                  recipe={recipe} 
                  onAddToShoppingList={onAddToShoppingList}
                />
            ))}
        </div>
    </div>
  );
};

export default RecipeDisplay;