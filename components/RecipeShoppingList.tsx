import React, { useState, useMemo } from 'react';
import type { Ingredient } from '../types';
import { Button } from './ui/Button';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';

interface RecipeShoppingListProps {
  ingredients: Ingredient[];
  onAddToCart: (items: string[]) => void;
}

const RecipeShoppingList: React.FC<RecipeShoppingListProps> = ({ ingredients, onAddToCart }) => {
  const missingIngredients = useMemo(() => ingredients.filter(ing => !ing.isProvided), [ingredients]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  if (missingIngredients.length === 0) {
    return null;
  }

  const handleToggleSelect = (ingredientName: string) => {
    setSelected(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientName)) {
        newSet.delete(ingredientName);
      } else {
        newSet.add(ingredientName);
      }
      return newSet;
    });
  };

  const handleAddClick = () => {
    onAddToCart(Array.from(selected));
    setSelected(new Set());
    setIsOpen(false);
  };

  return (
    <div className="border-t border-gray-200 mt-4 pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left font-semibold text-gray-700 hover:text-gray-900"
      >
        <span>Missing Ingredients ({missingIngredients.length})</span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      {isOpen && (
        <div className="mt-3">
          <div className="space-y-2">
            {missingIngredients.map(ing => (
              <label key={ing.name} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  checked={selected.has(ing.name)}
                  onChange={() => handleToggleSelect(ing.name)}
                />
                <span className="text-gray-700 capitalize">
                  {ing.name}
                </span>
              </label>
            ))}
          </div>
          <Button
            onClick={handleAddClick}
            disabled={selected.size === 0}
            className="w-full mt-4"
          >
            <ShoppingCartIcon className="w-5 h-5 mr-2" />
            Add Selected to List
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecipeShoppingList;
