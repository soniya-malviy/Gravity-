import axios from 'axios';

const BACKEND_URL = 'http://localhost:3001/api';

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
