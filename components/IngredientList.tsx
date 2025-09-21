
import React from 'react';
import { TrashIcon } from './icons/TrashIcon';

interface IngredientListProps {
  ingredients: string[];
  onRemoveIngredient: (ingredient: string) => void;
}

const IngredientList: React.FC<IngredientListProps> = ({ ingredients, onRemoveIngredient }) => {
  if (ingredients.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 bg-gray-100 rounded-lg">
        <p>Your ingredient list is empty. Add some items to get started!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ingredients.map(ingredient => (
        <div
          key={ingredient}
          className="flex items-center bg-green-100 text-green-800 text-sm font-medium px-3 py-1.5 rounded-full"
        >
          <span className="capitalize">{ingredient}</span>
          <button
            onClick={() => onRemoveIngredient(ingredient)}
            className="ml-2 text-green-600 hover:text-green-800 focus:outline-none"
            aria-label={`Remove ${ingredient}`}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default IngredientList;
