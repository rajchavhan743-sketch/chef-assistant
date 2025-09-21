export interface Ingredient {
  name: string;
  quantity: string;
  isProvided: boolean;
}

export interface Recipe {
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: string;
  imageUrl?: string;
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
}