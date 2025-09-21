import { GoogleGenAI, Type } from "@google/genai";
import type { Recipe, MenuPlan } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: 'The title of the recipe.' },
        description: { type: Type.STRING, description: 'A short, enticing description of the dish.' },
        prepTime: { type: Type.STRING, description: 'Preparation time, e.g., "15 minutes".' },
        cookTime: { type: Type.STRING, description: 'Cooking time, e.g., "25 minutes".' },
        servings: { type: Type.STRING, description: 'Number of servings, e.g., "4 servings".' },
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
    required: ['name', 'description', 'prepTime', 'cookTime', 'servings', 'ingredients', 'instructions']
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
        }
    },
    required: ["planTitle", "summary", "estimatedCost", "categories"]
};


export const generateRecipesByIngredients = async (
    ingredients: string[], 
    cuisine: string, 
    diet: 'Any' | 'Vegetarian' | 'Non-Vegetarian',
    servings: number
): Promise<Recipe[]> => {
    let prompt = `
      You are a creative chef. Based on the ingredients provided, generate 3 diverse and delicious recipes.
      The recipes should be scaled for ${servings} servings. Adjust ingredient quantities accordingly.
      For each recipe, provide a name, a brief description, prep time, cook time, servings (which should be "${servings} servings"), a list of all required ingredients, and step-by-step instructions.
      In the ingredients list, correctly identify which ingredients were provided by me. Do not assume quantities for the ingredients I provided; list them as needed for the recipe.
    `;

    if (cuisine && cuisine.trim() !== '') {
      prompt += `\nThe cuisine for the recipes should be ${cuisine}.`;
    }

    if (diet && diet !== 'Any') {
      prompt += `\nThe recipes must be strictly ${diet}.`;
    }

    prompt += `\n\nIngredients I have: ${ingredients.join(', ')}.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: recipeSchema
                },
            },
        });
        
        const responseText = response.text.trim();
        const recipes = JSON.parse(responseText);
        return recipes as Recipe[];

    } catch (error) {
        console.error("Error generating recipes from Gemini API:", error);
        throw new Error("Failed to generate recipes.");
    }
};

export const generateRecipeByName = async (
    recipeName: string,
    cuisine: string,
    diet: 'Any' | 'Vegetarian' | 'Non-Vegetarian',
    servings: number
): Promise<Recipe[]> => {
    let prompt = `
      You are a creative chef. Generate a single, detailed recipe for the following dish: "${recipeName}".
      The recipe should be scaled for ${servings} servings. Adjust ingredient quantities accordingly.
      For the recipe, provide a name, a brief description, prep time, cook time, servings (which should be "${servings} servings"), a complete list of all required ingredients, and step-by-step instructions.
      For all ingredients in the list, the "isProvided" field in the JSON output must be set to false.
    `;

    if (cuisine && cuisine.trim() !== '') {
      prompt += `\nThe cuisine for the recipe should be ${cuisine}.`;
    }

    if (diet && diet !== 'Any') {
      prompt += `\nThe recipe must be strictly ${diet}.`;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
            },
        });
        
        const responseText = response.text.trim();
        const recipe = JSON.parse(responseText);
        return [recipe] as Recipe[];

    } catch (error) {
        console.error(`Error generating recipe for "${recipeName}":`, error);
        throw new Error(`Failed to generate recipe for "${recipeName}".`);
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
    foodStyle: 'Packed' | 'Unpacked'
): Promise<MenuPlan> => {
    let prompt = `
      You are an expert event caterer and menu planner with knowledge of international cuisine and pricing. 
      Create a detailed menu plan for a "${eventType}" event being held in ${country}.
      The plan should be suitable for ${guestCount} guests with a total budget of ${budget} ${currencyCode}.
      The menu should include a variety of dishes, categorized into sections like Appetizers, Main Courses, Sides, Desserts, and Drinks.
      For each dish, provide a creative name, a short, enticing description, and an estimated bulk cost for that specific dish to serve all guests.
      The entire menu should align with the budget. Provide an estimated cost for the total plan, AND an estimated cost for EACH CATEGORY, in ${currencyCode}, being mindful of local pricing in ${country}. The sum of the category costs should approximate the total estimated cost. The sum of dish costs within a category should approximate that category's cost.
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
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: menuPlanSchema,
            },
        });
        
        const responseText = response.text.trim();
        const plan = JSON.parse(responseText);
        return plan as MenuPlan;

    } catch (error) {
        console.error("Error generating menu plan from Gemini API:", error);
        throw new Error("Failed to generate menu plan.");
    }
};


export const generateRecipeImage = async (recipeName: string, recipeDescription: string): Promise<string> => {
    try {
        const prompt = `A delicious, photorealistic image of ${recipeName}. ${recipeDescription}. Professional food photography, clean background, appetizing.`;
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating recipe image:", error);
        return ""; // Return an empty string or a default placeholder URL on error
    }
};

export const generateShoppingLinks = async (ingredients: string[]): Promise<{title: string, uri: string}[]> => {
    const prompt = `
        Find online purchasing links for the following grocery ingredients for delivery in India: ${ingredients.join(', ')}.
        Use Google Search to find links from popular Indian online grocery platforms like Blinkit, Zepto, BigBasket, or Swiggy Instamart.
        For each search result, provide the title of the page and the direct URL.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (!chunks) {
            return [];
        }
        
        const links = chunks.map((chunk: any) => ({
            title: chunk.web.title,
            uri: chunk.web.uri,
        })).filter((link: {title: string, uri: string}) => link.uri);

        // Deduplicate links based on URI
        const uniqueLinks = Array.from(new Map(links.map(item => [item.uri, item])).values());
        
        return uniqueLinks;
    } catch(error) {
        console.error("Error generating shopping links:", error);
        throw new Error("Failed to generate shopping links.");
    }
};