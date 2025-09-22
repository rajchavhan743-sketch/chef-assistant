import { Type } from "@google/genai";
import type { Recipe, MenuPlan, RecipeFix, CalorieInfo, FoodAnalysis } from '../types';

// The GoogleGenAI instance and API key are now removed from the frontend.
// All calls will go through our secure backend proxy.

/**
 * A generic function to call our backend API proxy.
 * @param action The type of Gemini action to perform (e.g., 'generateContent', 'generateImages').
 * @param params The parameters to pass to the Gemini SDK on the backend.
 * @returns The response from the backend.
 */
async function callGeminiApi(action: string, params: any): Promise<any> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, params }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'Failed to call API proxy' }));
    console.error("API Proxy Error:", errorBody);
    throw new Error(errorBody.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}


const calorieInfoSchema = {
    type: Type.OBJECT,
    description: "Estimated nutritional information for one serving.",
    properties: {
        totalCalories: { type: Type.STRING, description: 'Total calories, e.g., "450 kcal".' },
        protein: { type: Type.STRING, description: 'Protein amount, e.g., "30g".' },
        carbohydrates: { type: Type.STRING, description: 'Carbohydrates amount, e.g., "25g".' },
        fat: { type: Type.STRING, description: 'Fat amount, e.g., "20g".' }
    },
    required: ["totalCalories", "protein", "carbohydrates", "fat"]
};


const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: 'The title of the recipe.' },
        description: { type: Type.STRING, description: 'A short, enticing description of the dish.' },
        prepTime: { type: Type.STRING, description: 'Preparation time, e.g., "15 minutes".' },
        cookTime: { type: Type.STRING, description: 'Cooking time, e.g., "25 minutes".' },
        servings: { type: Type.STRING, description: 'Number of servings, e.g., "4 servings".' },
        youtubeSearchQuery: { type: Type.STRING, description: "A concise and effective search query to find a video for this recipe on YouTube. For example, 'easy homemade lasagna recipe'." },
        calorieInfo: { ...calorieInfoSchema, description: "Optional. Estimated nutritional information for one serving." },
        ingredients: {
            type: Type.ARRAY,
            description: 'All ingredients required for the recipe.',
            items: {
                type: Type.OBJECT,
                properties: {
                    quantity: { type: Type.STRING, description: 'Quantity and unit, e.g., "1 cup" or "100g".' },
                    name: { type: Type.STRING, description: 'Name of the ingredient.' },
                    isProvided: { type: Type.BOOLEAN, description: 'Set to true if this ingredient was in the user-provided list.' }
                },
                required: ['quantity', 'name', 'isProvided']
            }
        },
        instructions: {
            type: Type.ARRAY,
            description: 'Step-by-step cooking instructions.',
            items: { type: Type.STRING }
        }
    },
    required: ['name', 'description', 'prepTime', 'cookTime', 'servings', 'ingredients', 'instructions', 'youtubeSearchQuery']
};

const menuPlanSchema = {
    type: Type.OBJECT,
    properties: {
        planTitle: { type: Type.STRING, description: "A creative and fitting title for the menu plan." },
        summary: { type: Type.STRING, description: "A brief, enticing summary of the overall menu." },
        estimatedCost: { type: Type.STRING, description: "An estimated total cost for the menu, aligning with the user's budget and specified currency." },
        categories: {
            type: Type.ARRAY,
            description: "A list of menu categories, such as Appetizers, Main Courses, Desserts, and Drinks.",
            items: {
                type: Type.OBJECT,
                properties: {
                    categoryName: { type: Type.STRING, description: "The name of the category." },
                    estimatedCost: { type: Type.STRING, description: "An estimated cost for this specific category, contributing to the total budget." },
                    items: {
                        type: Type.ARRAY,
                        description: "A list of dishes within this category.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "The name of the dish." },
                                description: { type: Type.STRING, description: "A short description of the dish." },
                                estimatedCost: { type: Type.STRING, description: "An estimated total cost for this single dish, enough to serve all guests. For example: '$150'." }
                            },
                            required: ["name", "description", "estimatedCost"]
                        }
                    }
                },
                required: ["categoryName", "items", "estimatedCost"]
            }
        },
        planOfAction: {
            type: Type.ARRAY,
            description: "A list of 3-4 brief, actionable tips for executing the menu plan successfully and within budget, considering the location and event type. For example: 'Source fresh produce from a local farmer's market to save costs.'",
            items: { type: Type.STRING }
        }
    },
    required: ["planTitle", "summary", "estimatedCost", "categories", "planOfAction"]
};

const recipeFixSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A clear, encouraging title for the rescue plan, e.g., 'How to Fix Your Undercooked Chicken'."},
        summary: { type: Type.STRING, description: "A brief summary of the problem and the proposed solution."},
        steps: {
            type: Type.ARRAY,
            description: "A list of simple, actionable, step-by-step instructions to fix the cooking problem.",
            items: { type: Type.STRING }
        }
    },
    required: ["title", "summary", "steps"]
};

const foodAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        identifiedFoods: {
            type: Type.ARRAY,
            description: "A list of food items identified in the image.",
            items: { type: Type.STRING }
        },
        summary: { type: Type.STRING, description: "A brief health and nutritional summary of the meal." },
        calorieInfo: calorieInfoSchema,
        portionSizeAssumption: { type: Type.STRING, description: "A brief statement about the assumed portion size used for calculation, e.g., 'Assuming a standard 10-inch dinner plate' or 'Estimated as 1.5 cups'."}
    },
    required: ["identifiedFoods", "summary", "calorieInfo"]
};


export const generateRecipesByIngredients = async (
    ingredients: string[], 
    cuisine: string, 
    diet: 'Any' | 'Vegetarian' | 'Non-Vegetarian',
    servings: number,
    preferences: string[],
    allergies: string,
    cookLevel: 'Beginner' | 'Moderate' | 'Expert',
    cookAge: 'Major' | 'Minor',
    mealType: 'Any' | 'Breakfast' | 'Lunch' | 'Dinner',
    showCalories: boolean
): Promise<Recipe[]> => {
    let prompt = `
      You are a creative chef. Based on the ingredients provided, generate 3 diverse and delicious recipes.
      The recipes should be scaled for ${servings} servings. Adjust ingredient quantities accordingly.
      For each recipe, provide a name, a brief description, prep time, cook time, servings (which should be "${servings} servings"), a list of all required ingredients, step-by-step instructions, and a concise YouTube search query to find a video tutorial for the dish.
      In the ingredients list, correctly identify which ingredients were provided by me. Do not assume quantities for the ingredients I provided; list them as needed for the recipe.
      
      The recipe's complexity MUST be suitable for a ${cookLevel} cook.
    `;
    
    if (showCalories) {
        prompt += `\n\n**CRITICAL:** For each recipe, also provide a detailed calorie breakdown for one serving. This breakdown must include total calories (e.g., "450 kcal"), protein (e.g., "30g"), carbohydrates (e.g., "25g"), and fat (e.g., "20g"). This information is very important.`
    }

    if (cookAge === 'Minor') {
      prompt += `\n\n**CRITICAL SAFETY INSTRUCTION:** The cook is a minor. The recipes MUST be extremely safe and simple. They should require NO use of a stove, oven, microwave, or sharp knives without explicit mention of adult supervision. Prioritize no-cook or appliance-free recipes like sandwiches, salads, or simple assemblies.`;
    }
    
    if (mealType && mealType !== 'Any') {
      prompt += `\nThe recipes must be suitable for ${mealType}.`;
    }

    if (cuisine && cuisine.trim() !== '') {
      prompt += `\nThe cuisine for the recipes should be ${cuisine}.`;
    }

    if (diet && diet !== 'Any') {
      prompt += `\nThe recipes must be strictly ${diet}.`;
    }

    if (preferences && preferences.length > 0) {
      prompt += `\nAdditionally, the recipes must adhere to the following preferences: ${preferences.join(', ')}.`;
    }
    
    if (allergies && allergies.trim() !== '') {
      prompt += `\nCRITICAL ALLERGY INFORMATION: The recipes must be completely free of the following allergens: ${allergies}. Ensure no ingredients from this list, or any of their derivatives, are included.`;
    }

    prompt += `\n\nIngredients I have: ${ingredients.join(', ')}.`;

    try {
        const params = {
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: recipeSchema
                },
                thinkingConfig: { thinkingBudget: 0 },
            },
        };
        const response = await callGeminiApi('generateContent', params);
        const responseText = response.text.trim();
        return JSON.parse(responseText) as Recipe[];
    } catch (error) {
        console.error("Error generating recipes:", error);
        throw new Error("Failed to generate recipes.");
    }
};

export const generateRecipeByName = async (
    recipeName: string,
    cuisine: string,
    diet: 'Any' | 'Vegetarian' | 'Non-Vegetarian',
    servings: number,
    preferences: string[],
    allergies: string,
    cookLevel: 'Beginner' | 'Moderate' | 'Expert',
    cookAge: 'Major' | 'Minor',
    mealType: 'Any' | 'Breakfast' | 'Lunch' | 'Dinner',
    showCalories: boolean
): Promise<Recipe[]> => {
    let prompt = `
      You are a creative chef. Generate a single, detailed recipe for the following dish: "${recipeName}".
      The recipe should be scaled for ${servings} servings. Adjust ingredient quantities accordingly.
      For the recipe, provide a name, a brief description, prep time, cook time, servings (which should be "${servings} servings"), a complete list of all required ingredients, step-by-step instructions, and a concise YouTube search query to find a video tutorial for the dish.
      For all ingredients in the list, the "isProvided" field in the JSON output must be set to false.
      
      The recipe's complexity MUST be suitable for a ${cookLevel} cook.
    `;
    
    if (showCalories) {
        prompt += `\n\n**CRITICAL:** Also provide a detailed calorie breakdown for one serving. This breakdown must include total calories (e.g., "450 kcal"), protein (e.g., "30g"), carbohydrates (e.g., "25g"), and fat (e.g., "20g"). This information is very important.`
    }

    if (cookAge === 'Minor') {
      prompt += `\n\n**CRITICAL SAFETY INSTRUCTION:** The cook is a minor. The recipe MUST be extremely safe and simple. It should require NO use of a stove, oven, microwave, or sharp knives without explicit mention of adult supervision. Prioritize a no-cook or appliance-free version of this recipe if possible. If the recipe inherently requires cooking, state clearly that adult supervision is mandatory for all steps involving heat or sharp tools.`;
    }
    
    if (mealType && mealType !== 'Any') {
      prompt += `\nThe recipe must be suitable for ${mealType}.`;
    }

    if (cuisine && cuisine.trim() !== '') {
      prompt += `\nThe cuisine for the recipe should be ${cuisine}.`;
    }

    if (diet && diet !== 'Any') {
      prompt += `\nThe recipe must be strictly ${diet}.`;
    }
    
    if (preferences && preferences.length > 0) {
      prompt += `\nAdditionally, the recipe must adhere to the following preferences: ${preferences.join(', ')}.`;
    }
    
    if (allergies && allergies.trim() !== '') {
      prompt += `\nCRITICAL ALLERGY INFORMATION: The recipe must be completely free of the following allergens: ${allergies}. Ensure no ingredients from this list, or any of their derivatives, are included.`;
    }

    try {
        const params = {
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
                thinkingConfig: { thinkingBudget: 0 },
            },
        };
        const response = await callGeminiApi('generateContent', params);
        const responseText = response.text.trim();
        const recipe = JSON.parse(responseText);
        return [recipe] as Recipe[];
    } catch (error) {
        console.error(`Error generating recipe for "${recipeName}":`, error);
        throw new Error(`Failed to generate recipe for "${recipeName}".`);
    }
};

export const generateTiffinRecipes = async (
    maxCookTime: string,
    occasion: string,
    ingredients: string[],
    cuisine: string,
    diet: 'Any' | 'Vegetarian' | 'Non-Vegetarian',
    servings: number,
    allergies: string,
    cookLevel: 'Beginner' | 'Moderate' | 'Expert',
    cookAge: 'Major' | 'Minor',
    mealType: 'Any' | 'Breakfast' | 'Lunch' | 'Dinner',
    showCalories: boolean
): Promise<Recipe[]> => {
    let prompt = `
      You are an expert chef specializing in quick, easy, and portable meals for packed lunch boxes (tiffins).
      Generate 3 diverse meal ideas suitable for a packed meal ("${occasion}"), specifically for a ${mealType === 'Any' ? 'general' : mealType} meal.
      CRITICAL REQUIREMENT: The total preparation and cooking time for each recipe MUST be under ${maxCookTime} minutes.
      The meals should be delicious, easy to pack, and hold up well to be eaten later (taste good at room temperature or after reheating).

      The recipe's complexity MUST be suitable for a ${cookLevel} cook.
      The recipes should be scaled for ${servings} servings.
      For each recipe, provide a name, a brief description, prep time, cook time (the sum of prep and cook time must be less than ${maxCookTime} minutes), servings (as a string, e.g., "${servings} servings"), a list of all required ingredients, step-by-step instructions, and a concise YouTube search query for a video tutorial.
    `;
    
    if (showCalories) {
        prompt += `\n\n**CRITICAL:** For each recipe, also provide a detailed calorie breakdown for one serving. This breakdown must include total calories (e.g., "450 kcal"), protein (e.g., "30g"), carbohydrates (e.g., "25g"), and fat (e.g., "20g"). This information is very important.`
    }

    if (cookAge === 'Minor') {
      prompt += `\n\n**CRITICAL SAFETY INSTRUCTION:** The cook is a minor. The recipes MUST be extremely safe and simple. They should require NO use of a stove, oven, microwave, or sharp knives without explicit mention of adult supervision. Prioritize no-cook or appliance-free recipes like sandwiches, salads, or simple assemblies. This is especially important for a 'School Lunch' tiffin.`;
    }

    if (ingredients.length > 0) {
        prompt += `\nPrioritize recipes that use the following ingredients I have: ${ingredients.join(', ')}. In the ingredients list for each recipe, correctly identify which ingredients were provided by me.`;
    } else {
        prompt += `\nFor all ingredients in the list, the "isProvided" field in the JSON output must be set to false.`
    }

    if (cuisine && cuisine.trim() !== '') {
        prompt += `\nThe cuisine for the recipes should be ${cuisine}.`;
    }

    if (diet && diet !== 'Any') {
        prompt += `\nThe recipes must be strictly ${diet}.`;
    }

    if (allergies && allergies.trim() !== '') {
        prompt += `\nCRITICAL ALLERGY INFORMATION: The recipes must be completely free of the following allergens: ${allergies}. Ensure no ingredients from this list, or any of their derivatives, are included.`;
    }
    
    try {
        const params = {
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: recipeSchema
                },
                thinkingConfig: { thinkingBudget: 0 },
            },
        };
        const response = await callGeminiApi('generateContent', params);
        const responseText = response.text.trim();
        return JSON.parse(responseText) as Recipe[];
    } catch (error) {
        console.error("Error generating tiffin recipes:", error);
        throw new Error("Failed to generate tiffin recipes.");
    }
};


export const generateMenuPlan = async (
    eventType: string,
    guestCount: number,
    budget: number,
    cuisine: string,
    diet: 'Any' | 'Vegetarian' | 'Non-Vegetarian',
    country: string,
    currencyCode: string,
    foodStyle: 'Packed' | 'Unpacked',
    locationType: 'Metro' | 'Non-Metro'
): Promise<MenuPlan> => {
    let prompt = `
      You are an expert event caterer and menu planner with deep knowledge of international cuisine and local pricing. 
      Create a detailed, systematic, and doable menu plan for a "${eventType}" event being held in ${country}.
      
      CRITICAL CONTEXT: The event location is a **${locationType} city**. You MUST adjust all your cost estimations to be realistic for this context. For 'Metro' cities, assume significantly higher costs for ingredients, vendor services, and labor compared to 'Non-Metro' areas. The final plan must be achievable within the specified budget.

      The plan should be for ${guestCount} guests with a total budget of ${budget} ${currencyCode}.
      The menu must include diverse dishes categorized into sections like Appetizers, Main Courses, Sides, Desserts, and Drinks.
      For each dish, provide a creative name, a short, enticing description, and an estimated bulk cost for that dish to serve all guests.
      The entire menu must align with the budget. Provide an estimated cost for the total plan, AND an estimated cost for EACH CATEGORY, in ${currencyCode}. The sum of category costs should approximate the total estimated cost.
      
      Finally, provide a "planOfAction" with 3-4 brief, practical tips for executing this menu within budget. This could include advice on sourcing ingredients, preparation timeline, or presentation.
    `;

    if (foodStyle === 'Packed') {
        prompt += `\nThe food must be suitable for being individually packed. Suggest items like sandwiches, wraps, grain bowls, or items that hold up well in containers.`
    } else {
        prompt += `\nThe food will be served buffet-style (unpacked). You can suggest a wider variety of dishes suitable for a buffet line.`
    }

    if (cuisine && cuisine.trim() !== '') {
        prompt += `\nThe cuisine style should be ${cuisine}.`;
    }

    if (diet && diet !== 'Any') {
        prompt += `\nAll dishes must be strictly ${diet}.`;
    }
    
    prompt += `\nProvide the response as a well-structured JSON object.`;

    try {
        const params = {
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: menuPlanSchema,
            },
        };
        const response = await callGeminiApi('generateContent', params);
        const responseText = response.text.trim();
        return JSON.parse(responseText) as MenuPlan;
    } catch (error) {
        console.error("Error generating menu plan:", error);
        throw new Error("Failed to generate menu plan.");
    }
};


export const generateRecipeImage = async (recipeName: string, recipeDescription: string): Promise<string> => {
    try {
        const prompt = `A delicious, photorealistic image of ${recipeName}. ${recipeDescription}. Professional food photography, clean background, appetizing.`;
        const params = {
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        };

        const generatedImages = await callGeminiApi('generateImages', params);
        const base64ImageBytes: string = generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating recipe image:", error);
        return ""; // Return an empty string or a default placeholder URL on error
    }
};

export const generateShoppingLinks = async (ingredients: string[]): Promise<{title: string, uri: string}[]> => {
    const prompt = `
        Find online purchasing links for the following grocery ingredients for delivery in India: ${ingredients.join(', ')}.
        Use Google Search to find links from popular Indian online grocery platforms like Blinkit, Zepto, BigBasket, or Swiggy Instart.
        For each search result, provide the title of the page and the direct URL.
    `;
    try {
        const params = {
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        };
        const response = await callGeminiApi('generateContent', params);
        
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (!chunks || !Array.isArray(chunks)) {
            return [];
        }
        
        // FIX: Replaced .map().filter() with .reduce() for more robust type checking.
        // This safely processes the API response, ensuring that only grounding chunks
        // with both a valid 'title' and 'uri' are included, which resolves the type error.
        const links = chunks.reduce<{ title: string; uri: string }[]>((acc, chunk) => {
            const title = chunk?.web?.title;
            const uri = chunk?.web?.uri;
            if (title && uri) {
                acc.push({ title, uri });
            }
            return acc;
        }, []);

        // Deduplicate links based on URI
        const uniqueLinks = Array.from(new Map(links.map(item => [item.uri, item])).values());
        
        return uniqueLinks;
    } catch(error) {
        console.error("Error generating shopping links:", error);
        throw new Error("Failed to generate shopping links.");
    }
};

export const generateRecipeFix = async (dishName: string, problem: string): Promise<RecipeFix> => {
    const prompt = `
      You are an expert, calm, and reassuring chef specializing in fixing common cooking mistakes.
      A user is having trouble with their dish, "${dishName}".
      Their specific problem is: "${problem}".

      Please provide a simple, step-by-step rescue plan to help them.
      The tone should be encouraging. Start with a positive affirmation like "Don't worry, we can fix this!".
      The solution should be practical and use common household ingredients where possible.

      Provide a response in JSON format with a title for the plan, a brief summary of the solution, and a list of clear, actionable steps.
    `;

    try {
        const params = {
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeFixSchema,
            },
        };
        const response = await callGeminiApi('generateContent', params);
        const responseText = response.text.trim();
        return JSON.parse(responseText) as RecipeFix;
    } catch (error) {
        console.error("Error generating recipe fix:", error);
        throw new Error("Failed to generate a rescue plan.");
    }
};

export const analyzeFoodImage = async (imageData: string, mimeType: string, userContext: string): Promise<FoodAnalysis> => {
    let prompt = `
      You are a meticulous nutritionist. Analyze the food item(s) in this image.
      1.  Identify all distinct food items and ingredients you can see.
      2.  Based on visual cues, make a reasonable estimation of the portion size.
      3.  Provide a detailed nutritional breakdown (total calories, protein, carbohydrates, fat) for the entire meal shown.
      4.  Provide a brief summary of the meal's healthiness.
      5.  CRITICAL: State your portion size assumption clearly in the 'portionSizeAssumption' field. For example: "Assuming a standard 10-inch dinner plate" or "Estimated as 1.5 cups of pasta". This is vital for context.
    `;

    if (userContext.trim() !== '') {
        prompt += `\n\nPay close attention to the following user-provided context to improve your accuracy: "${userContext}"`;
    }

    prompt += `\nReturn the response as a well-structured JSON object.`;


    try {
        const params = {
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { data: imageData, mimeType: mimeType } }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: foodAnalysisSchema,
                temperature: 0,
            },
        };
        const response = await callGeminiApi('generateContent', params);
        const responseText = response.text.trim();
        return JSON.parse(responseText) as FoodAnalysis;
    } catch (error) {
        console.error("Error analyzing food image:", error);
        throw new Error("Failed to analyze the food image.");
    }
};