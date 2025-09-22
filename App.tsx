
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleOAuthProvider, CredentialResponse } from '@react-oauth/google';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Recipe, MenuPlan, RecipeFix, UserProfile, FoodAnalysis, HistoryItem } from './types';
import { generateRecipesByIngredients, generateRecipeByName, generateRecipeImage, generateMenuPlan, generateTiffinRecipes, generateRecipeFix, analyzeFoodImage } from './services/geminiService';
import IngredientInput from './components/IngredientInput';
import IngredientList from './components/IngredientList';
import RecipeDisplay from './components/RecipeDisplay';
import MenuPlanDisplay from './components/MenuPlanDisplay';
import ShoppingListModal from './components/ShoppingListModal';
import ShoppingListButton from './components/ShoppingListButton';
import { ChefHatIcon } from './components/icons/ChefHatIcon';
import { Input } from './components/ui/Input';
import { Select } from './components/ui/Select';
import { Textarea } from './components/ui/Textarea';
import RecipeFixDisplay from './components/RecipeFixDisplay';
import { Button } from './components/ui/Button';
import Auth from './components/Auth';
import NamePromptModal from './components/NamePromptModal';
import ImageUploader from './components/ImageUploader';
import FoodAnalysisDisplay from './components/FoodAnalysisDisplay';
import HistoryPanel from './components/HistoryPanel';
import { HistoryIcon } from './components/icons/HistoryIcon';

type Diet = 'Any' | 'Vegetarian' | 'Non-Vegetarian';
type Mode = 'recipe' | 'tiffin' | 'menu' | 'rescue' | 'vision' | 'saved';
type RecipeFinderMode = 'ingredient' | 'name';
type FoodStyle = 'Unpacked' | 'Packed';
type Occasion = 'Work Lunch' | 'School Lunch' | 'Picnic';
type MaxCookTime = '15' | '30' | '45';
type LocationType = 'Metro' | 'Non-Metro';
type CookLevel = 'Beginner' | 'Moderate' | 'Expert';
type CookAge = 'Major' | 'Minor';
type MealType = 'Any' | 'Breakfast' | 'Lunch' | 'Dinner';

const countries = [
  { name: 'United States', currencyCode: 'USD', currencySymbol: '$' },
  { name: 'India', currencyCode: 'INR', currencySymbol: '₹' },
  { name: 'United Kingdom', currencyCode: 'GBP', currencySymbol: '£' },
  { name: 'Japan', currencyCode: 'JPY', currencySymbol: '¥' },
  { name: 'Canada', currencyCode: 'CAD', currencySymbol: '$' },
  { name: 'Australia', currencyCode: 'AUD', currencySymbol: '$' },
  { name: 'Germany (Eurozone)', currencyCode: 'EUR', currencySymbol: '€' },
];

const availablePreferences = ['Gluten-Free', 'High Protein', 'Kid-Friendly', 'Less Oily', 'Less Salty', 'Low Carb', 'Non-Spicy', 'Quick & Easy', 'Spicy'];

const App: React.FC = () => {
  const [config, setConfig] = useState<{ googleClientId?: string; supabaseUrl?: string; supabaseAnonKey?: string; } | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  const [mode, setMode] = useState<Mode>('recipe');
  const [recipeFinderMode, setRecipeFinderMode] = useState<RecipeFinderMode>('ingredient');
  
  const [savedRecipeIds, setSavedRecipeIds] = useState<Set<string>>(new Set());
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);


  // State definitions remain largely the same...
  const [ingredients, setIngredients] = useState<string[]>(['flour', 'water', 'oil', 'salt', 'sugar', 'pepper', 'onion', 'garlic']);
  const [recipeQuery, setRecipeQuery] = useState<string>('');
  const [servings, setServings] = useState<number | ''>(2);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [preferences, setPreferences] = useState<Set<string>>(new Set());
  const [allergies, setAllergies] = useState<string>('');
  const [cookLevel, setCookLevel] = useState<CookLevel>('Beginner');
  const [cookAge, setCookAge] = useState<CookAge>('Major');
  const [showCalories, setShowCalories] = useState<boolean>(false);
  const [maxCookTime, setMaxCookTime] = useState<MaxCookTime>('30');
  const [occasion, setOccasion] = useState<Occasion>('Work Lunch');
  const [eventType, setEventType] = useState<string>('Baby Shower');
  const [guestCount, setGuestCount] = useState<number | ''>(15);
  const [budget, setBudget] = useState<number | ''>(300);
  const [country, setCountry] = useState<string>('India');
  const [locationType, setLocationType] = useState<LocationType>('Metro');
  const [foodStyle, setFoodStyle] = useState<FoodStyle>('Unpacked');
  const [menuPlan, setMenuPlan] = useState<MenuPlan | null>(null);
  const [rescueDishName, setRescueDishName] = useState<string>('');
  const [rescueProblem, setRescueProblem] = useState<string>('');
  const [rescuePlan, setRescuePlan] = useState<RecipeFix | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [foodAnalysis, setFoodAnalysis] = useState<FoodAnalysis | null>(null);
  const [visionUserContext, setVisionUserContext] = useState<string>('');
  const [analysisCache, setAnalysisCache] = useState<Map<string, FoodAnalysis>>(new Map());
  const [cuisine, setCuisine] = useState<string>('');
  const [diet, setDiet] = useState<Diet>('Any');
  const [mealType, setMealType] = useState<MealType>('Any');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shoppingList, setShoppingList] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (!response.ok) {
          throw new Error('Failed to fetch config');
        }
        const appConfig = await response.json();
        setConfig(appConfig);
        
        if (appConfig.supabaseUrl && appConfig.supabaseAnonKey) {
          setSupabase(createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey));
        } else {
          console.warn("Supabase configuration not found. Database features will be disabled.");
        }
      } catch (error) {
        console.error("Could not load app configuration:", error);
      } finally {
        setIsConfigLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Supabase Auth and Data loading
  useEffect(() => {
    if (!supabase) {
        setSessionChecked(true);
        return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            fetchUserProfile(session.user.id);
        }
        setSessionChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
            fetchUserProfile(session.user.id);
        } else {
            setUserProfile(null);
            setHistory([]);
            setSavedRecipeIds(new Set());
        }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const fetchUserProfile = async (userId: string) => {
    if (!supabase) return;
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error("Error fetching profile:", error);
    } else if (data) {
        const profile = { id: data.id, name: data.name, email: data.email, picture: data.picture };
        setUserProfile(profile);
        if (!data.name) { // Prompt for name if it's missing from their profile
            setIsNameModalOpen(true);
        }
        fetchHistory(userId);
        fetchSavedRecipeIds(userId);
    }
  };
  
  const fetchHistory = async (userId: string) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('history_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching history:", error);
    } else if (data) {
      const formattedHistory: HistoryItem[] = data.map(item => ({
          id: item.id.toString(),
          timestamp: new Date(item.created_at).getTime(),
          mode: item.mode,
          displayTitle: item.display_title,
          params: item.params
      }));
      setHistory(formattedHistory);
    }
  };
  
  const fetchSavedRecipeIds = async (userId: string) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('saved_recipes')
      .select('id')
      .eq('user_id', userId);

    if (error) {
      console.error("Error fetching saved recipe IDs:", error);
    } else if (data) {
      const ids = new Set(data.map(item => item.id.toString()));
      // This is a placeholder. We need to store a unique identifier of the recipe itself.
      // For now, we'll refetch and can't use this effectively until we store a recipe hash or name.
    }
  };

  const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (!supabase || !credentialResponse.credential) return;
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: credentialResponse.credential,
    });
    if (error) console.error('Supabase login error:', error);
  };
  
  const handleNameSubmit = async (name: string) => {
    if (!userProfile || !supabase) return;
    const { error } = await supabase
      .from('profiles')
      .update({ name: name })
      .eq('id', userProfile.id);
    
    if (error) {
      console.error("Error updating name:", error);
    } else {
      setUserProfile(prev => prev ? { ...prev, name } : null);
    }
    setIsNameModalOpen(false);
  };

  const handleLogout = async () => {
      if (!supabase) return;
      await supabase.auth.signOut();
      setUserProfile(null);
      setHistory([]); // Clear history on logout
      setSavedRecipeIds(new Set());
  };
  
  const addHistoryItem = async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    if (!userProfile || !supabase) return; // Only save history for logged-in users

    const { data, error } = await supabase
        .from('history_items')
        .insert({
            user_id: userProfile.id,
            mode: item.mode,
            display_title: item.displayTitle,
            params: item.params,
        })
        .select()
        .single();

    if (error) {
      console.error("Error adding history:", error);
    } else if (data) {
      const newHistoryItem: HistoryItem = {
          id: data.id.toString(),
          timestamp: new Date(data.created_at).getTime(),
          mode: data.mode,
          displayTitle: data.display_title,
          params: data.params
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 10));
    }
  };
  
  const clearHistory = async () => {
    if (!userProfile || !supabase) return;
    const { error } = await supabase
      .from('history_items')
      .delete()
      .eq('user_id', userProfile.id);

    if (error) {
      console.error("Error clearing history:", error);
    } else {
      setHistory([]);
    }
  };
  
  const handleSaveRecipe = async (recipe: Recipe) => {
    if (!userProfile || !supabase) return;
    const { isSaved, ...recipeData } = recipe; // Don't store UI state in DB
    const { data, error } = await supabase
      .from('saved_recipes')
      .insert({ user_id: userProfile.id, recipe_data: recipeData })
      .select()
      .single();
    
    if (error) {
      console.error("Error saving recipe:", error);
    } else {
      setRecipes(prev => prev.map(r => r.name === recipe.name ? { ...r, isSaved: true, id: data.id.toString() } : r));
    }
  };
  
  const handleUnsaveRecipe = async (recipe: Recipe) => {
    if (!userProfile || !supabase || !recipe.id) return;
    const { error } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('id', recipe.id);

    if (error) {
      console.error("Error unsaving recipe:", error);
    } else {
      setRecipes(prev => prev.map(r => r.name === recipe.name ? { ...r, isSaved: false, id: undefined } : r));
      if (mode === 'saved') { // If in saved view, remove it from the list
          setRecipes(prev => prev.filter(r => r.name !== recipe.name));
      }
    }
  };
  
  const fetchSavedRecipes = async () => {
    if (!userProfile || !supabase) return;
    setIsLoading(true);
    setError(null);
    clearResults();

    const { data, error } = await supabase
      .from('saved_recipes')
      .select('id, recipe_data')
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching saved recipes:", error);
      setError("Could not load your saved recipes.");
    } else {
      const saved = data.map(item => ({
        ...(item.recipe_data as Recipe),
        id: item.id.toString(),
        isSaved: true,
      }));
      setRecipes(saved);
    }
    setIsLoading(false);
  };
  
   const handleShareRecipe = (recipe: Recipe) => {
    const recipeText = `
Recipe: ${recipe.name}

Description:
${recipe.description}

Prep Time: ${recipe.prepTime} | Cook Time: ${recipe.cookTime} | Servings: ${recipe.servings}

Ingredients:
${recipe.ingredients.map(ing => `- ${ing.quantity} ${ing.name}`).join('\n')}

Instructions:
${recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}
    `;
    navigator.clipboard.writeText(recipeText.trim())
      .then(() => {
        setShowCopiedNotification(true);
        setTimeout(() => setShowCopiedNotification(false), 2000);
      })
      .catch(err => console.error('Failed to copy recipe', err));
  };


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
    setRescuePlan(null);
    setFoodAnalysis(null);
  };
  
  const handlePreferenceToggle = (preference: string) => {
    setPreferences(prev => {
      const newPrefs = new Set(prev);
      if (newPrefs.has(preference)) {
        newPrefs.delete(preference);
      } else {
        newPrefs.add(preference);
      }
      return newPrefs;
    });
  };
  
  const generateAndSetRecipes = async (recipePromise: Promise<Recipe[]>) => {
    try {
        const generatedRecipes = await recipePromise;
        if (generatedRecipes && generatedRecipes.length > 0) {
            const imagePromises = generatedRecipes.map(recipe =>
                generateRecipeImage(recipe.name, recipe.description)
            );
            const imageUrls = await Promise.all(imagePromises);
            
            // This is a temporary way to check if a recipe is saved.
            // A more robust solution would involve checking against a unique ID from the recipe content.
            const savedRecipeNames = new Set(recipes.filter(r => r.isSaved).map(r => r.name));

            const recipesWithImages = generatedRecipes.map((recipe, index) => ({
                ...recipe,
                imageUrl: imageUrls[index] || undefined,
                isSaved: savedRecipeNames.has(recipe.name),
            }));
            setRecipes(recipesWithImages);
        } else {
            setRecipes([]);
        }
    } catch (err) {
        console.error(err);
        setError("Sorry, I couldn't generate recipes. Please try again later.");
    }
  };

  const handleGenerateRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    clearResults();

    if ((servings === '' || servings < 1) && mode !== 'menu') {
      setError("Please enter a valid number of servings.");
      setIsLoading(false);
      return;
    }

    const prefs = Array.from(preferences);
    let recipePromise: Promise<Recipe[]>;
    
    if (recipeFinderMode === 'ingredient') {
      if (ingredients.length === 0) {
        setError("Please add at least one ingredient.");
        setIsLoading(false);
        return;
      }
      addHistoryItem({
          mode: 'recipe',
          displayTitle: `Recipe from ${ingredients.length} ingredients`,
          params: { mode, recipeFinderMode, ingredients, cuisine, diet, servings, preferences: prefs, allergies, cookLevel, cookAge, mealType, showCalories }
      });
      recipePromise = generateRecipesByIngredients(ingredients, cuisine, diet, servings as number, prefs, allergies, cookLevel, cookAge, mealType, showCalories);
    } else { // 'name' mode
      if (recipeQuery.trim() === '') {
        setError("Please enter a recipe name to search for.");
        setIsLoading(false);
        return;
      }
      addHistoryItem({
          mode: 'recipe',
          displayTitle: `Recipe for: ${recipeQuery}`,
          params: { mode, recipeFinderMode, recipeQuery, cuisine, diet, servings, preferences: prefs, allergies, cookLevel, cookAge, mealType, showCalories }
      });
      recipePromise = generateRecipeByName(recipeQuery, cuisine, diet, servings as number, prefs, allergies, cookLevel, cookAge, mealType, showCalories);
    }
    
    await generateAndSetRecipes(recipePromise);
    setIsLoading(false);

  }, [recipeFinderMode, ingredients, recipeQuery, cuisine, diet, servings, preferences, allergies, cookLevel, cookAge, mealType, showCalories, addHistoryItem]);

  const handleGenerateTiffinPlan = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    clearResults();
    
    if ((servings === '' || servings < 1)) {
        setError("Please enter a valid number of servings.");
        setIsLoading(false);
        return;
    }

    addHistoryItem({
        mode: 'tiffin',
        displayTitle: `${occasion} under ${maxCookTime} mins`,
        params: { mode, maxCookTime, occasion, ingredients, cuisine, diet, servings, allergies, cookLevel, cookAge, mealType, showCalories }
    });

    const recipePromise = generateTiffinRecipes(
        maxCookTime,
        occasion,
        ingredients,
        cuisine,
        diet,
        servings as number,
        allergies,
        cookLevel,
        cookAge,
        mealType,
        showCalories
    );
    
    await generateAndSetRecipes(recipePromise);
    setIsLoading(false);

  }, [maxCookTime, occasion, ingredients, cuisine, diet, servings, allergies, cookLevel, cookAge, mealType, showCalories, addHistoryItem]);


  const handleGenerateMenuPlan = useCallback(async () => {
    if (!eventType || guestCount === '' || budget === '') {
      setError("Please fill in all event details.");
      return;
    }
    setIsLoading(true);
    setError(null);
    clearResults();

    addHistoryItem({
        mode: 'menu',
        displayTitle: `Menu for ${eventType} (${guestCount} guests)`,
        params: { mode, eventType, guestCount, budget, country, locationType, foodStyle, cuisine, diet }
    });

    try {
      const plan = await generateMenuPlan(
        eventType, 
        guestCount as number, 
        budget as number, 
        cuisine, 
        diet,
        selectedCountry.name,
        selectedCountry.currencyCode,
        foodStyle,
        locationType
      );
      setMenuPlan(plan);
    } catch (err) {
      console.error(err);
      setError("Sorry, I couldn't generate a menu plan. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [eventType, guestCount, budget, cuisine, diet, selectedCountry, foodStyle, locationType, addHistoryItem, country]);

  const handleGenerateRescuePlan = useCallback(async () => {
    if (rescueDishName.trim() === '' || rescueProblem.trim() === '') {
      setError("Please describe the dish and the problem.");
      return;
    }
    setIsLoading(true);
    setError(null);
    clearResults();

    addHistoryItem({
        mode: 'rescue',
        displayTitle: `Rescue plan for: ${rescueDishName}`,
        params: { mode, rescueDishName, rescueProblem }
    });

    try {
      const plan = await generateRecipeFix(rescueDishName, rescueProblem);
      setRescuePlan(plan);
    } catch (err) {
      console.error(err);
      setError("Sorry, I couldn't generate a rescue plan. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [rescueDishName, rescueProblem, addHistoryItem]);

   const handleAnalyzeImage = useCallback(async () => {
    if (!imageFile) {
        setError("Please upload an image first.");
        return;
    }
    setIsLoading(true);
    setError(null);
    clearResults();

    try {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            
            if (analysisCache.has(base64Data)) {
                setFoodAnalysis(analysisCache.get(base64Data)!);
                setIsLoading(false);
                return;
            }

            addHistoryItem({
                mode: 'vision',
                displayTitle: `Calorie Vision Analysis`,
                params: { mode, visionUserContext }
            });

            const analysis = await analyzeFoodImage(base64Data, imageFile.type, visionUserContext);
            setAnalysisCache(prevCache => new Map(prevCache).set(base64Data, analysis));
            setFoodAnalysis(analysis);
            setIsLoading(false);
        };
        reader.onerror = () => {
            setError("Failed to read the image file.");
            setIsLoading(false);
        };
        reader.readAsDataURL(imageFile);
    } catch (err) {
        console.error(err);
        setError("Sorry, I couldn't analyze the image. Please try again.");
        setIsLoading(false);
    }
  }, [imageFile, visionUserContext, analysisCache, addHistoryItem]);

  const handleSelectHistoryItem = (item: HistoryItem) => {
    const { params } = item;
    setMode(params.mode);
    clearResults();
    setError(null);
    setIsHistoryPanelOpen(false);

    setRecipeFinderMode(params.recipeFinderMode || 'ingredient');
    // FIX: Cast `params.ingredients` to `string[]` to resolve a type error when loading from history.
    // The `params` object from history has a type of `any`, which is not directly compatible with `string[]`.
    setIngredients((params.ingredients as string[]) || ['flour', 'water', 'oil', 'salt', 'sugar', 'pepper', 'onion', 'garlic']);
    setRecipeQuery(params.recipeQuery || '');
    setServings(params.servings || 2);
    // FIX: Cast `params.preferences` to `string[]` to resolve a type error.
    // The `Set` constructor expects an iterable of strings, and casting ensures type safety
    // when loading preferences from the `any`-typed history params.
    setPreferences(new Set((params.preferences as string[]) || []));
    setAllergies(params.allergies || '');
    setCookLevel(params.cookLevel || 'Beginner');
    setCookAge(params.cookAge || 'Major');
    setShowCalories(params.showCalories || false);
    setMaxCookTime(params.maxCookTime || '30');
    setOccasion(params.occasion || 'Work Lunch');
    setEventType(params.eventType || 'Baby Shower');
    setGuestCount(params.guestCount || 15);
    setBudget(params.budget || 300);
    setCountry(params.country || 'India');
    setLocationType(params.locationType || 'Metro');
    setFoodStyle(params.foodStyle || 'Unpacked');
    setRescueDishName(params.rescueDishName || '');
    setRescueProblem(params.rescueProblem || '');
    setVisionUserContext(params.visionUserContext || '');
    setCuisine(params.cuisine || '');
    setDiet(params.diet || 'Any');
    setMealType(params.mealType || 'Any');

    setTimeout(() => {
        switch (item.mode) {
            case 'recipe': handleGenerateRecipes(); break;
            case 'tiffin': handleGenerateTiffinPlan(); break;
            case 'menu': handleGenerateMenuPlan(); break;
            case 'rescue': handleGenerateRescuePlan(); break;
            case 'vision':
                setImageFile(null); 
                break;
            case 'saved': fetchSavedRecipes(); break;
        }
    }, 100);
  };
  
  const handleAddToShoppingList = (items: string[]) => {
    setShoppingList(prevList => {
      const newList = new Set(prevList);
      items.forEach(item => newList.add(item));
      return newList;
    });
  };
  
  const getButtonText = () => {
    if (isLoading) return 'Generating...';
    switch (mode) {
      case 'recipe': return 'Generate Recipes';
      case 'menu': return 'Generate Menu Plan';
      case 'tiffin': return 'Find Tiffin Ideas';
      case 'rescue': return 'Get Rescue Plan';
      case 'vision': return 'Analyze Image';
      case 'saved': return 'View My Saved Recipes';
      default: return 'Generate';
    }
  };

  const isGenerateDisabled = () => {
    if (isLoading) return true;
    if (mode === 'recipe' || mode === 'tiffin') {
      if (servings === '' || Number(servings) < 1) return true;
      if (mode === 'recipe') {
          if (recipeFinderMode === 'ingredient') return ingredients.length === 0;
          if (recipeFinderMode === 'name') return recipeQuery.trim() === '';
      }
    }
    if (mode === 'menu') return !eventType || guestCount === '' || budget === '';
    if (mode === 'rescue') return rescueDishName.trim() === '' || rescueProblem.trim() === '';
    if (mode === 'vision') return !imageFile;
    if (mode === 'saved') return true;
    return false;
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    clearResults();
    setError(null);
    setVisionUserContext('');
    if(newMode === 'tiffin') {
        setServings(1); 
    } else if (newMode === 'recipe') {
        setServings(2); 
    }
    if (newMode === 'saved') {
        fetchSavedRecipes();
    }
  }

  const renderSharedRecipeOptions = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine (Optional)</label>
          <Input type="text" value={cuisine} onChange={e => setCuisine(e.target.value)} placeholder="e.g., Italian, Mexican" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Requirement</label>
          <Select value={diet} onChange={e => setDiet(e.target.value as Diet)}>
            <option>Any</option>
            <option>Vegetarian</option>
            <option>Non-Vegetarian</option>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
          <Input type="number" value={servings} onChange={e => setServings(e.target.value === '' ? '' : parseInt(e.target.value, 10))} min="1" placeholder="e.g., 2" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cook Level</label>
            <Select value={cookLevel} onChange={e => setCookLevel(e.target.value as CookLevel)}>
                <option>Beginner</option>
                <option>Moderate</option>
                <option>Expert</option>
            </Select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cook Age</label>
            <Select value={cookAge} onChange={e => setCookAge(e.target.value as CookAge)}>
                <option>Major</option>
                <option>Minor</option>
            </Select>
        </div>
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
            <Select value={mealType} onChange={e => setMealType(e.target.value as MealType)}>
                <option>Any</option>
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
            </Select>
        </div>
      </div>
      <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (Optional)</label>
          <Input type="text" value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="e.g., peanuts, shellfish, gluten" />
      </div>
       <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Preferences (Optional)</label>
        <div className="flex flex-wrap gap-2">
            {availablePreferences.map(p => (
                <button
                    key={p}
                    type="button"
                    onClick={() => handlePreferenceToggle(p)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 shadow-sm ${preferences.has(p) ? 'bg-green-600 text-white border-green-700 scale-105' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'}`}
                >
                    {p}
                </button>
            ))}
        </div>
      </div>
    </>
  );
  
  const MODES: {id: Mode; label: string;}[] = [
    { id: 'recipe', label: 'Recipe Finder' },
    { id: 'tiffin', label: 'Tiffin Planner' },
    { id: 'saved', label: 'Saved Recipes' },
    { id: 'menu', label: 'Menu Planner' },
    { id: 'rescue', label: 'Recipe Rescue' },
    { id: 'vision', label: 'Calorie Vision' },
  ];

  const AppContent = (
      <div className="min-h-screen text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
        <div 
            className={`fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg transition-transform duration-300 z-50 ${showCopiedNotification ? 'translate-x-0' : 'translate-x-[calc(100%+2rem)]'}`}
        >
          Recipe copied to clipboard!
        </div>
        <div className="max-w-7xl mx-auto">
          <header className="mb-10">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <ChefHatIcon className="h-12 w-12 text-green-600" />
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-800 tracking-tight">
                        AI Chef Assistant
                      </h1>
                      {userProfile && <p className="text-sm text-gray-600">Welcome, {userProfile.name}!</p>}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {userProfile && (
                        <button 
                            onClick={() => setIsHistoryPanelOpen(true)}
                            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                            aria-label="View search history"
                        >
                            <HistoryIcon className="w-6 h-6 text-gray-600" />
                        </button>
                    )}
                    {(config?.googleClientId && supabase) ? (
                      <Auth user={userProfile} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />
                    ) : (
                      <div className="text-sm text-gray-500 bg-gray-100 p-2 rounded-md border border-gray-200">Auth Disabled</div>
                    )}
                </div>
            </div>
            <p className="mt-4 text-center text-lg text-gray-600 max-w-2xl mx-auto">
              Your culinary companion for delicious recipes, flawless menu plans, and kitchen rescue missions!
            </p>
          </header>

          <main>
            <div className="bg-white/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-xl border border-white/30">
              <div className="flex justify-center mb-8 bg-gray-100/50 p-1.5 rounded-xl shadow-inner overflow-x-auto">
                  {MODES.filter(m => userProfile || (m.id !== 'saved')).map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleModeChange(m.id)}
                      className={`relative flex-1 px-3 sm:px-6 py-2.5 text-sm font-bold focus:outline-none transition-colors duration-300 capitalize rounded-lg whitespace-nowrap
                        ${m.id === mode ? 'text-white' : 'text-gray-600 hover:text-green-600'}`}
                    >
                      {m.id === mode && <span className="absolute inset-0 bg-green-600 rounded-lg shadow-md z-0" style={{'--tw-shadow': '0 4px 6px -1px rgba(22, 163, 74, 0.4), 0 2px 4px -2px rgba(22, 163, 74, 0.4)'} as React.CSSProperties} />}
                      <span className="relative z-10">{m.label}</span>
                    </button>
                  ))}
              </div>
              
              {mode === 'saved' && (
                <div>
                   <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Saved Recipes</h2>
                   <p className="text-gray-600">Here are the recipes you've bookmarked for later.</p>
                </div>
              )}

              {mode === 'recipe' && (
                <div>
                  <div className="flex justify-center mb-6">
                    <div className="flex rounded-lg shadow-sm border border-gray-200">
                      {(['ingredient', 'name'] as RecipeFinderMode[]).map(rfm => (
                        <button
                          key={rfm}
                          type="button"
                          onClick={() => { setRecipeFinderMode(rfm); clearResults(); setError(null); setShowCalories(false); }}
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
                      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Find a Recipe by Name</h2>
                      <Input
                        type="text"
                        value={recipeQuery}
                        onChange={e => setRecipeQuery(e.target.value)}
                        placeholder="e.g., Classic Lasagna, Chicken Tikka Masala"
                      />
                    </div>
                  )}
                  <hr className="my-6 border-gray-200" />
                  {renderSharedRecipeOptions()}
                </div>
              )}
              
              {mode === 'tiffin' && (
                  <div>
                      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Tiffin Planner</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Max Cook Time</label>
                              <Select value={maxCookTime} onChange={e => setMaxCookTime(e.target.value as MaxCookTime)}>
                                  <option value="15">Under 15 mins</option>
                                  <option value="30">Under 30 mins</option>
                                  <option value="45">Under 45 mins</option>
                              </Select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
                              <Select value={occasion} onChange={e => setOccasion(e.target.value as Occasion)}>
                                  <option>Work Lunch</option>
                                  <option>School Lunch</option>
                                  <option>Picnic</option>
                              </Select>
                          </div>
                      </div>
                       <p className="text-sm text-gray-500 mb-4">You can add available ingredients below to get more relevant ideas.</p>
                       <IngredientInput onAddIngredient={handleAddIngredient} />
                       <IngredientList ingredients={ingredients} onRemoveIngredient={handleRemoveIngredient} />
                      <hr className="my-6 border-gray-200" />
                      {renderSharedRecipeOptions()}
                  </div>
              )}
              
              {mode === 'menu' && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Menu Planner</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                            <Input type="text" value={eventType} onChange={e => setEventType(e.target.value)} placeholder="e.g., Birthday Party" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                            <Input type="number" value={guestCount} onChange={e => setGuestCount(e.target.value === '' ? '' : parseInt(e.target.value, 10))} min="1" placeholder="e.g., 50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Budget ({selectedCountry.currencySymbol})</label>
                            <Input type="number" value={budget} onChange={e => setBudget(e.target.value === '' ? '' : parseInt(e.target.value, 10))} min="0" placeholder="e.g., 500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                             <Select value={country} onChange={e => setCountry(e.target.value)}>
                                {countries.map(c => <option key={c.name}>{c.name}</option>)}
                             </Select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine (Optional)</label>
                            <Input type="text" value={cuisine} onChange={e => setCuisine(e.target.value)} placeholder="e.g., Indian, Continental" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Requirement</label>
                            <Select value={diet} onChange={e => setDiet(e.target.value as Diet)}>
                                <option>Any</option>
                                <option>Vegetarian</option>
                                <option>Non-Vegetarian</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Serving Style</label>
                            <Select value={foodStyle} onChange={e => setFoodStyle(e.target.value as FoodStyle)}>
                                <option>Unpacked</option>
                                <option>Packed</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location Type</label>
                            <Select value={locationType} onChange={e => setLocationType(e.target.value as LocationType)}>
                                <option>Metro</option>
                                <option>Non-Metro</option>
                            </Select>
                        </div>
                    </div>
                  </div>
              )}
              
              {mode === 'rescue' && (
                  <div>
                       <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recipe Rescue</h2>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name</label>
                               <Input type="text" value={rescueDishName} onChange={e => setRescueDishName(e.target.value)} placeholder="e.g., Roast Chicken" />
                          </div>
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">What's the problem?</label>
                           <Textarea value={rescueProblem} onChange={e => setRescueProblem(e.target.value)} placeholder="e.g., It's too salty, it's undercooked, the sauce is too thin..." />
                       </div>
                  </div>
              )}

              {mode === 'vision' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">Calorie Vision</h2>
                  <p className="text-sm text-gray-500 mb-4">Upload an image of your meal to get a complete calorie and nutritional breakdown.</p>
                  <ImageUploader onImageUpload={setImageFile} />
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Add Context (Optional)</label>
                    <Input 
                      type="text" 
                      value={visionUserContext}
                      onChange={e => setVisionUserContext(e.target.value)}
                      placeholder="e.g., This is a 12-inch plate, the drink is diet coke" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Providing context helps the AI give a more accurate analysis.</p>
                  </div>
                </div>
              )}
              
              {(mode === 'recipe' || mode === 'tiffin') && (
                   <div className="mt-6 flex items-center bg-gray-50 p-3 rounded-lg">
                      <input
                          type="checkbox"
                          id="show-calories"
                          checked={showCalories}
                          onChange={(e) => setShowCalories(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="show-calories" className="ml-3 block text-sm font-medium text-gray-800">Show Calorie Breakdown</label>
                  </div>
              )}

              <div className="mt-8">
                <Button
                  onClick={mode === 'recipe' ? handleGenerateRecipes : mode === 'menu' ? handleGenerateMenuPlan : mode === 'tiffin' ? handleGenerateTiffinPlan : mode === 'rescue' ? handleGenerateRescuePlan : handleAnalyzeImage}
                  disabled={isGenerateDisabled()}
                  className="w-full text-lg py-3.5"
                >
                  {getButtonText()}
                </Button>
              </div>
              
            </div>
            
            {error && <p className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
            
            <div className="mt-12">
              { (mode === 'recipe' || mode === 'tiffin' || mode === 'saved') && 
                <RecipeDisplay 
                    recipes={recipes} 
                    isLoading={isLoading} 
                    onAddToShoppingList={handleAddToShoppingList}
                    onSave={handleSaveRecipe}
                    onUnsave={handleUnsaveRecipe}
                    onShare={handleShareRecipe}
                    user={userProfile}
                    mode={mode}
                /> 
              }
              { mode === 'menu' && <MenuPlanDisplay plan={menuPlan} isLoading={isLoading} /> }
              { mode === 'rescue' && <RecipeFixDisplay plan={rescuePlan} isLoading={isLoading} /> }
              { mode === 'vision' && <FoodAnalysisDisplay analysis={foodAnalysis} isLoading={isLoading} /> }
            </div>

          </main>
        </div>
        
        <HistoryPanel 
            isOpen={isHistoryPanelOpen}
            onClose={() => setIsHistoryPanelOpen(false)}
            history={history}
            onSelect={handleSelectHistoryItem}
            onClear={clearHistory}
        />

        <ShoppingListButton itemCount={shoppingList.size} onClick={() => setIsModalOpen(true)} />
        <ShoppingListModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          items={Array.from(shoppingList)} 
          onClear={() => setShoppingList(new Set())} 
        />
        { (config?.googleClientId && supabase) && (
            <NamePromptModal 
                isOpen={isNameModalOpen}
                onClose={() => setIsNameModalOpen(false)}
                onSubmit={handleNameSubmit}
                defaultName={userProfile?.name}
            />
        )}
      </div>
  );
  
  if (isConfigLoading || !sessionChecked) {
      return (
          <div className="flex justify-center items-center min-h-screen">
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }

  if (config?.googleClientId) {
    return (
      <GoogleOAuthProvider clientId={config.googleClientId}>
        {AppContent}
      </GoogleOAuthProvider>
    );
  }

  return AppContent;
};

export default App;
