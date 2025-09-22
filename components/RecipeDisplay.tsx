import React from 'react';
import type { Recipe, UserProfile } from '../types';
import RecipeCard from './RecipeCard';
import RecipeCardSkeleton from './RecipeCardSkeleton';

interface RecipeDisplayProps {
  recipes: Recipe[];
  isLoading: boolean;
  onAddToShoppingList: (items: string[]) => void;
  onSave: (recipe: Recipe) => void;
  onUnsave: (recipe: Recipe) => void;
  onShare: (recipe: Recipe) => void;
  user: UserProfile | null;
  mode: 'recipe' | 'tiffin' | 'saved';
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipes, isLoading, onAddToShoppingList, onSave, onUnsave, onShare, user, mode }) => {
  if (isLoading) {
    return (
      <div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <RecipeCardSkeleton />
            <RecipeCardSkeleton />
            <RecipeCardSkeleton />
        </div>
      </div>
    );
  }

  if (recipes.length === 0 && !isLoading) {
    if (mode === 'saved') {
      return (
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">No Saved Recipes Yet</h3>
            <p className="mt-2 text-gray-600">You can save recipes you like by clicking the bookmark icon on any recipe card.</p>
        </div>
      );
    }
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

  const title = mode === 'saved' ? 'Your Saved Recipes' : 'Your Custom Recipes';

  return (
    <div>
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe, index) => (
                <RecipeCard 
                  key={recipe.id || index}
                  recipe={recipe} 
                  onAddToShoppingList={onAddToShoppingList}
                  onSave={onSave}
                  onUnsave={onUnsave}
                  onShare={onShare}
                  user={user}
                />
            ))}
        </div>
    </div>
  );
};

export default RecipeDisplay;