import type { Recipe as OriginalRecipe } from './types';

export interface Ingredient {
  name: string;
  quantity: string;
  isProvided: boolean;
}

export interface CalorieInfo {
  totalCalories: string; // e.g., "450 kcal"
  protein: string;       // e.g., "30g"
  carbohydrates: string; // e.g., "25g"
  fat: string;           // e.g., "20g"
}

export interface Recipe {
  id?: string; // Database ID for saved recipes
  isSaved?: boolean; // UI state for bookmarking
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: string;
  imageUrl?: string;
  youtubeSearchQuery?: string;
  calorieInfo?: CalorieInfo;
}

export interface MenuItem {
  name: string;
  description: string;
  estimatedCost: string; // e.g., "$150 total"
}

export interface MenuCategory {
  categoryName: string; // e.g., "Appetizers", "Main Courses"
  items: MenuItem[];
  estimatedCost: string; // e.g., "$50 - $70"
}

export interface MenuPlan {
  planTitle: string; // e.g., "Joyful Baby Shower Lunch Menu"
  summary: string; // A brief overview of the menu
  categories: MenuCategory[];
  estimatedCost: string; // e.g., "Approximately $250"
  planOfAction?: string[]; // Actionable tips for success
}

export interface RecipeFix {
  title: string;
  summary: string;
  steps: string[];
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  picture: string | null;
}

export interface FoodAnalysis {
  identifiedFoods: string[];
  summary: string;
  calorieInfo: CalorieInfo;
  portionSizeAssumption?: string;
}

export interface HistoryItem {
  id: string; // Changed from number to string for Supabase compatibility
  timestamp: number;
  mode: 'recipe' | 'tiffin' | 'menu' | 'rescue' | 'vision' | 'saved';
  displayTitle: string;
  params: any;
}