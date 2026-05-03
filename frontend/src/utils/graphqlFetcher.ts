import axios from 'axios';

// Dynamically determine the backend URL based on environment variables
// Falls back to localhost for local development
export const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '') + '/api';

export const fetchGraphQLData = async (endpoint: string, query: string, auth: string | null = null) => {
  try {
    const headers: Record<string, string> = {};
    if (auth) {
      headers['Authorization'] = auth;
    }

    const response = await axios.post(`${BACKEND_URL}/graphql/proxy`, {
      endpoint,
      query,
      headers
    });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data;
  } catch (error: any) {
    console.error('Fetch Error:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch data');
  }
};

export const analyzeAI = async (action: string, data: any, context?: any) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/ai/analyze`, {
      action,
      data,
      context,
    });
    return response.data;
  } catch (error: any) {
    console.error('AI Error:', error);
    throw new Error(error.response?.data?.error || error.message || 'AI layer unavailable');
  }
};
