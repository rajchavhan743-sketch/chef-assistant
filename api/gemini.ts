// This is the content for your new file: /api/gemini.ts

import { GoogleGenAI } from "@google/genai";

// This key is now safely on the server, read from your hosting environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This is a generic handler that can process different types of AI requests
// It's designed to work with platforms like Vercel or Netlify
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { action, params } = req.body;

    if (!action || !params) {
      return res.status(400).json({ error: 'Missing action or params' });
    }

    let result;

    switch (action) {
      case 'generateContent':
        const genContentResponse = await ai.models.generateContent(params);
        // The raw response from the SDK is complex; we just send back the part our app needs.
        result = genContentResponse; 
        break;

      case 'generateImages':
        const genImagesResponse = await ai.models.generateImages(params);
        // Similarly, we simplify the response for the frontend.
        result = genImagesResponse.generatedImages;
        break;

      default:
        return res.status(400).json({ error: 'Invalid action specified' });
    }

    // Send the successful response back to the frontend
    return res.status(200).json(result);

  } catch (error) {
    console.error(`Error in API route for action:`, error);
    // Send a generic error message to the client
    return res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
}