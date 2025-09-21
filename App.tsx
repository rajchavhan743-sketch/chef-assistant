import React, { useState, useCallback, useMemo } from 'react';
import type { Recipe, MenuPlan } from './types';
import { generateRecipesByIngredients, generateRecipeByName, generateRecipeImage, generateMenuPlan } from './services/geminiService';
import IngredientInput from './components/IngredientInput';
import IngredientList from './components/IngredientList';
import RecipeDisplay from './components/RecipeDisplay';
import MenuPlanDisplay from './components/MenuPlanDisplay';
import ShoppingListModal from './components/ShoppingListModal';
import ShoppingListButton from './components/ShoppingListButton';
import { ChefHatIcon } from './components/icons/ChefHatIcon';
import { Input } from './components/ui/Input';
import { Select } from './components/ui/Select';

type Diet = 'Any' | 'Vegetarian' | 'Non-Vegetarian';
type Mode = 'recipe' | 'menu';
type RecipeFinderMode = 'ingredient' | 'name';
type FoodStyle = 'Unpacked' | 'Packed';

const countries = [
  { name: 'United States', currencyCode: 'USD', currencySymbol: '$' },
  { name: 'India', currencyCode: 'INR', currencySymbol: '₹' },
  { name: 'United Kingdom', currencyCode: 'GBP', currencySymbol: '£' },
  { name: 'Japan', currencyCode: 'JPY', currencySymbol: '¥' },
  { name: 'Canada', currencyCode: 'CAD', currencySymbol: '$' },
  { name: 'Australia', currencyCode: 'AUD', currencySymbol: '$' },
  { name: 'Germany (Eurozone)', currencyCode: 'EUR', currencySymbol: '€' },
];

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('recipe');
  const [recipeFinderMode, setRecipeFinderMode] = useState<RecipeFinderMode>('ingredient');

  // Recipe Finder State
  const [ingredients, setIngredients] = useState<string[]>(['flour', 'sugar', 'eggs']);
  const [recipeQuery, setRecipeQuery] = useState<string>('');
  const [servings, setServings] = useState<number | ''>(4);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // Menu Planner State
  const [eventType, setEventType] = useState<string>('Baby Shower');
  const [guestCount, setGuestCount] = useState<number | ''>(15);
  const [budget, setBudget] = useState<number | ''>(300);
  const [country, setCountry] = useState<string>(countries[0].name);
  const [foodStyle, setFoodStyle] = useState<FoodStyle>('Unpacked');
  const [menuPlan, setMenuPlan] = useState<MenuPlan | null>(null);

  // Shared State
  const [cuisine, setCuisine] = useState<string>('');
  const [diet, setDiet] = useState<Diet>('Any');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shoppingList, setShoppingList] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedCountry = useMemo(() => {
    return countries.find(c => c.name === country) || countries[0];
  }, [country]);

  const handleAddIngredient = (ingredient: string) => {
    if (ingredient && !ingredients.includes(ingredient.toLowerCase())) {
      setIngredients(prev => [...prev, ingredient.toLowerCase()]);
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setIngredients(prev => prev.filter(ingredient => ingredient !== ingredientToRemove));
  };
  
  const clearResults = () => {
    setRecipes([]);
    setMenuPlan(null);
  };

  const handleGenerateRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    clearResults();

    if (servings === '' || servings < 1) {
      setError("Please enter a valid number of servings.");
      setIsLoading(false);
      return;
    }

    try {
      let generated: Recipe[] = [];
      if (recipeFinderMode === 'ingredient') {
        if (ingredients.length === 0) {
          setError("Please add at least one ingredient.");
          setIsLoading(false);
          return;
        }
        generated = await generateRecipesByIngredients(ingredients, cuisine, diet, servings as number);
      } else { // 'name' mode
        if (recipeQuery.trim() === '') {
          setError("Please enter a recipe name to search for.");
          setIsLoading(false);
          return;
        }
        generated = await generateRecipeByName(recipeQuery, cuisine, diet, servings as number);
      }
      
      setRecipes(generated);

      generated.forEach(async (recipe, index) => {
        const imageUrl = await generateRecipeImage(recipe.name, recipe.description);
        if (imageUrl) {
          setRecipes(prevRecipes => {
            const newRecipes = [...prevRecipes];
            if (newRecipes[index]) {
              newRecipes[index].imageUrl = imageUrl;
            }
            return newRecipes;
          });
        }
      });
    } catch (err) {
      console.error(err);
      setError("Sorry, I couldn't generate recipes. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [recipeFinderMode, ingredients, recipeQuery, cuisine, diet, servings]);

  const handleGenerateMenuPlan = useCallback(async () => {
    if (!eventType || guestCount === '' || budget === '') {
      setError("Please fill in all event details.");
      return;
    }
    setIsLoading(true);
    setError(null);
    clearResults();

    try {
      const plan = await generateMenuPlan(
        eventType, 
        guestCount as number, 
        budget as number, 
        cuisine, 
        diet,
        selectedCountry.name,
        selectedCountry.currencyCode,
        foodStyle
      );
      setMenuPlan(plan);
    } catch (err) {
      console.error(err);
      setError("Sorry, I couldn't generate a menu plan. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [eventType, guestCount, budget, cuisine, diet, selectedCountry, foodStyle]);
  
  const handleAddToShoppingList = (items: string[]) => {
    setShoppingList(prevList => {
      const newList = new Set(prevList);
      items.forEach(item => newList.add(item));
      return newList;
    });
  };

  const isGenerateDisabled = () => {
    if (isLoading) return true;
    if (mode === 'recipe') {
      if (servings === '' || Number(servings) < 1) return true;
      if (recipeFinderMode === 'ingredient') return ingredients.length === 0;
      if (recipeFinderMode === 'name') return recipeQuery.trim() === '';
    }
    if (mode === 'menu') return !eventType || guestCount === '' || budget === '';
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4">
             <ChefHatIcon className="h-12 w-12 text-green-600" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              AI Chef Assistant
            </h1>
          </div>
          <p className="mt-4 text-lg text-gray-600">
            Find recipes with your ingredients or plan the perfect party menu!
          </p>
        </header>

        <main>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <div className="flex justify-center mb-6">
              <div className="flex rounded-lg shadow-sm border border-gray-200">
                {(['recipe', 'menu'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); clearResults(); setError(null);}}
                    className={`flex-1 px-6 py-2 text-sm font-bold focus:z-10 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 capitalize
                      ${m === mode ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}
                      first:rounded-l-lg last:rounded-r-lg border-r border-gray-200 last:border-r-0`}
                  >
                    {m === 'recipe' ? 'Recipe Finder' : 'Menu Planner'}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'recipe' ? (
              <div>
                <div className="flex justify-center mb-6">
                  <div className="flex rounded-lg shadow-sm border border-gray-200">
                    {(['ingredient', 'name'] as RecipeFinderMode[]).map(rfm => (
                      <button
                        key={rfm}
                        type="button"
                        onClick={() => { setRecipeFinderMode(rfm); clearResults(); setError(null); }}
                        className={`flex-1 px-5 py-1.5 text-xs font-bold focus:z-10 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors duration-200
                          ${rfm === recipeFinderMode ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}
                          first:rounded-l-lg last:rounded-r-lg border-r border-gray-200 last:border-r-0`}
                      >
                        {rfm === 'ingredient' ? 'By Ingredients' : 'By Recipe Name'}
                      </button>
                    ))}
                  </div>
                </div>
                {recipeFinderMode === 'ingredient' ? (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Ingredients</h2>
                    <IngredientInput onAddIngredient={handleAddIngredient} />
                    <IngredientList ingredients={ingredients} onRemoveIngredient={handleRemoveIngredient} />
                  </div>
                ) : (
                   <div>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Search for a Recipe</h2>
                     <label htmlFor="recipe-name" className="sr-only">Recipe Name</label>
                     <Input id="recipe-name" type="text" value={recipeQuery} onChange={e => setRecipeQuery(e.target.value)} placeholder="e.g., Lasagna, Chicken Tikka Masala" />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Event Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="event-type" className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                    <Input id="event-type" type="text" value={eventType} onChange={e => setEventType(e.target.value)} placeholder="e.g., Birthday Party" />
                  </div>
                  <div>
                    <label htmlFor="country-select" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <Select id="country-select" value={country} onChange={e => setCountry(e.target.value)}>
                      {countries.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </Select>
                  </div>
                   <div>
                    <label htmlFor="guest-count" className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                    <Input id="guest-count" type="number" value={guestCount} onChange={e => setGuestCount(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g., 20" />
                  </div>
                   <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">Budget ({selectedCountry.currencySymbol})</label>
                    <Input id="budget" type="number" value={budget} onChange={e => setBudget(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g., 500" />
                  </div>
                </div>
              </div>
            )}
           
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
              <div>
                <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">Cuisine (optional)</label>
                <Input id="cuisine" type="text" value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="e.g., Italian, Indian"/>
              </div>

              {mode === 'recipe' && (
                <div>
                  <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-1">Number of Servings</label>
                  <Input 
                    id="servings" 
                    type="number" 
                    min="1" 
                    value={servings} 
                    onChange={(e) => setServings(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))} 
                    placeholder="e.g., 4"
                  />
                </div>
              )}
              
              {mode === 'menu' && (
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Food Style</label>
                    <div className="flex rounded-lg shadow-sm border border-gray-200">
                      {(['Unpacked', 'Packed'] as const).map((fs: FoodStyle) => (
                        <button key={fs} type="button" onClick={() => setFoodStyle(fs)}
                          className={`flex-1 px-4 py-2 text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200
                            ${fs === foodStyle ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}
                            first:rounded-l-lg last:rounded-r-lg border-r border-gray-200 last:border-r-0`}
                        >
                          {fs === 'Unpacked' ? 'Unpacked (Buffet)' : 'Packed (Individual)'}
                        </button>
                      ))}
                    </div>
                </div>
              )}


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Preference</label>
                <div className="flex rounded-lg shadow-sm border border-gray-200">
                  {(['Any', 'Vegetarian', 'Non-Vegetarian'] as const).map((d: Diet) => (
                    <button key={d} type="button" onClick={() => setDiet(d)}
                      className={`flex-1 px-4 py-2 text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200
                        ${d === diet ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}
                        first:rounded-l-lg last:rounded-r-lg border-r border-gray-200 last:border-r-0`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={mode === 'recipe' ? handleGenerateRecipes : handleGenerateMenuPlan}
                disabled={isGenerateDisabled()}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
              >
                {isLoading ? 'Generating...' : (mode === 'recipe' ? 'Generate Recipes' : 'Generate Menu Plan')}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          <div className="mt-10">
            <RecipeDisplay recipes={recipes} isLoading={isLoading && mode === 'recipe'} onAddToShoppingList={handleAddToShoppingList} />
            <MenuPlanDisplay plan={menuPlan} isLoading={isLoading && mode === 'menu'} />
          </div>
        </main>
      </div>
      <ShoppingListButton 
        itemCount={shoppingList.size} 
        onClick={() => setIsModalOpen(true)}
      />
      <ShoppingListModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        items={Array.from(shoppingList)}
        onClear={() => setShoppingList(new Set())}
      />
    </div>
  );
};

export default App;