// Using CommonJS exports for maximum compatibility with Netlify/AWS Lambda.
exports.handler = async (event, context) => {
  // Ensure the function only responds to GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  try {
    // Expose only PUBLIC keys to the frontend.
    // These are read from the environment variables set in the Netlify dashboard.
    const config = {
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(config),
      headers: { 'Content-Type': 'application/json' },
    };
    
  } catch (error) {
    console.error('Error in /api/config:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load application configuration.' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
