import React from 'react';
import type { Recipe } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import RecipeShoppingList from './RecipeShoppingList';

interface RecipeCardProps {
  recipe: Recipe;
  onAddToShoppingList: (items: string[]) => void;
}

const ClockIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const UsersIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);


const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onAddToShoppingList }) => {
  return (
    <Card className="flex flex-col h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-200">
      <div className="w-full h-48 bg-gray-200 rounded-t-2xl flex items-center justify-center">
        {recipe.imageUrl ? (
            <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className="w-full h-full object-cover rounded-t-2xl"
            />
        ) : (
            <div className="animate-pulse w-full h-full bg-gray-300 rounded-t-2xl"></div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">{recipe.name}</CardTitle>
        <CardDescription className="text-gray-600 h-12">{recipe.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <div className="flex justify-around text-center border-t border-b border-gray-200 py-3 my-4">
          <div className="flex flex-col items-center text-gray-700">
            <ClockIcon className="h-6 w-6 mb-1 text-green-600" />
            <span className="font-bold">{recipe.prepTime}</span>
            <span className="text-xs text-gray-500">Prep</span>
          </div>
          <div className="flex flex-col items-center text-gray-700">
            <ClockIcon className="h-6 w-6 mb-1 text-green-600" />
            <span className="font-bold">{recipe.cookTime}</span>
            <span className="text-xs text-gray-500">Cook</span>
          </div>
          <div className="flex flex-col items-center text-gray-700">
            <UsersIcon className="h-6 w-6 mb-1 text-green-600" />
            <span className="font-bold">{recipe.servings}</span>
            <span className="text-xs text-gray-500">Serves</span>
          </div>
        </div>
        
        <div className="space-y-4 flex-grow">
          <div>
            <h4 className="font-bold text-lg text-gray-800 mb-2">Ingredients</h4>
            <ul className="space-y-1 text-gray-700 list-disc list-inside">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className={ing.isProvided ? 'font-semibold text-green-700' : ''}>
                  {ing.quantity} {ing.name}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg text-gray-800 mt-4 mb-2">Instructions</h4>
            <ol className="space-y-2 text-gray-700 list-decimal list-inside">
              {recipe.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
        <div className="mt-auto pt-4">
          <RecipeShoppingList ingredients={recipe.ingredients} onAddToCart={onAddToShoppingList} />
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
