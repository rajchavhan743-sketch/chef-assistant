const { GoogleGenAI } = require("@google/genai");

// This key is safely on the server, read from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using CommonJS exports for maximum compatibility with Netlify/AWS Lambda.
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  try {
    // The request body from the frontend fetch call is in `event.body`.
    const { action, params } = JSON.parse(event.body);

    if (!action || !params) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing action or params' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    let result;

    switch (action) {
      case 'generateContent':
        const genContentResponse = await ai.models.generateContent(params);
        // Explicitly construct the response object. The .text property is a getter
        // and won't be included in JSON.stringify otherwise. The frontend
        // also needs .candidates for grounding chunks.
        result = {
          text: genContentResponse.text,
          candidates: genContentResponse.candidates
        };
        break;

      case 'generateImages':
        const genImagesResponse = await ai.models.generateImages(params);
        // The frontend expects the array of generated images directly.
        result = genImagesResponse.generatedImages;
        break;

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid action specified' }),
          headers: { 'Content-Type': 'application/json' },
        };
    }

    // Return a successful response object.
    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: { 'Content-Type': 'application/json' },
    };

  } catch (error) {
    console.error(`Error in API route for action:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred while processing your request.' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
