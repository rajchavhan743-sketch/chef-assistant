import React from 'react';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';

interface ShoppingListButtonProps {
  itemCount: number;
  onClick: () => void;
}

const ShoppingListButton: React.FC<ShoppingListButtonProps> = ({ itemCount, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-green-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-transform transform hover:scale-110"
      aria-label={`Open shopping list with ${itemCount} items`}
    >
      <ShoppingCartIcon className="w-8 h-8" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </button>
  );
};

export default ShoppingListButton;
