import React from 'react';
import type { Recipe, UserProfile } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import RecipeShoppingList from './RecipeShoppingList';
import { YouTubeIcon } from './icons/YouTubeIcon';
import { FlameIcon } from './icons/FlameIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { ShareIcon } from './icons/ShareIcon';

interface RecipeCardProps {
  recipe: Recipe;
  onAddToShoppingList: (items: string[]) => void;
  onSave: (recipe: Recipe) => void;
  onUnsave: (recipe: Recipe) => void;
  onShare: (recipe: Recipe) => void;
  user: UserProfile | null;
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


const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onAddToShoppingList, onSave, onUnsave, onShare, user }) => {
  const handleSaveToggle = () => {
    if (recipe.isSaved) {
      onUnsave(recipe);
    } else {
      onSave(recipe);
    }
  };
  
  return (
    <Card className="flex flex-col h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100 overflow-hidden group">
      <div className="relative w-full aspect-video bg-gray-200 overflow-hidden">
        {recipe.imageUrl ? (
            <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
        ) : (
            <div className="animate-pulse w-full h-full bg-gray-300"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        {user && (
            <button 
              onClick={handleSaveToggle}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors"
              aria-label={recipe.isSaved ? 'Unsave recipe' : 'Save recipe'}
            >
              <BookmarkIcon className="w-6 h-6" filled={recipe.isSaved} />
            </button>
        )}
      </div>
      <CardHeader className="-mt-16 relative z-10 text-white px-6 pt-6 pb-4">
        <CardTitle className="text-2xl font-display font-bold text-shadow">{recipe.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col pt-4">
        <CardDescription className="mb-4 text-gray-600">
          {recipe.description}
        </CardDescription>
        <div className="flex justify-around text-center border-t border-b border-gray-100 py-3 my-4">
          <div className="flex flex-col items-center text-gray-700 w-1/4">
            <ClockIcon className="h-6 w-6 mb-1 text-green-600" />
            <span className="font-bold text-sm">{recipe.prepTime}</span>
            <span className="text-xs text-gray-500">Prep</span>
          </div>
          <div className="flex flex-col items-center text-gray-700 w-1/4">
            <ClockIcon className="h-6 w-6 mb-1 text-green-600" />
            <span className="font-bold text-sm">{recipe.cookTime}</span>
            <span className="text-xs text-gray-500">Cook</span>
          </div>
          <div className="flex flex-col items-center text-gray-700 w-1/4">
            <UsersIcon className="h-6 w-6 mb-1 text-green-600" />
            <span className="font-bold text-sm">{recipe.servings}</span>
            <span className="text-xs text-gray-500">Serves</span>
          </div>
          {recipe.calorieInfo && (
            <div className="flex flex-col items-center text-gray-700 w-1/4">
              <FlameIcon className="h-6 w-6 mb-1 text-green-600" />
              <span className="font-bold text-sm">{recipe.calorieInfo.totalCalories.replace('kcal', '')}</span>
              <span className="text-xs text-gray-500">Calories</span>
            </div>
          )}
        </div>
        
        {recipe.calorieInfo && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-xs text-gray-600 text-center">
                <div>Protein<br/><strong className="text-gray-800">{recipe.calorieInfo.protein}</strong></div>
                <div>Carbs<br/><strong className="text-gray-800">{recipe.calorieInfo.carbohydrates}</strong></div>
                <div>Fat<br/><strong className="text-gray-800">{recipe.calorieInfo.fat}</strong></div>
            </div>
          </div>
        )}
        
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
          <div className="flex gap-3 mb-4">
            {recipe.youtubeSearchQuery && recipe.youtubeSearchQuery.trim() !== '' && (
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.youtubeSearchQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300"
              >
                <YouTubeIcon className="w-6 h-6 mr-2" />
                Watch
              </a>
            )}
            <button
              onClick={() => onShare(recipe)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white font-bold rounded-lg shadow-md hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300"
              aria-label="Share recipe"
            >
              <ShareIcon className="w-5 h-5 mr-2" />
              Share
            </button>
          </div>
          <RecipeShoppingList ingredients={recipe.ingredients} onAddToCart={onAddToShoppingList} />
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;