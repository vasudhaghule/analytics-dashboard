import axios from 'axios';

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

export interface NewsArticle {
  source: {
    id: string;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export const newsService = {
  async getTopHeadlines(category?: string, page: number = 1): Promise<NewsResponse> {
    try {
      if (!NEWS_API_KEY) {
        throw new Error('News API key is not configured');
      }

      const response = await axios.get(`${BASE_URL}/top-headlines`, {
        params: {
          country: 'us',
          category,
          page,
          pageSize: 10,
          apiKey: NEWS_API_KEY,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('News API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch news headlines');
    }
  },

  async searchNews(query: string, page: number = 1): Promise<NewsResponse> {
    try {
      if (!NEWS_API_KEY) {
        throw new Error('News API key is not configured');
      }

      const response = await axios.get(`${BASE_URL}/everything`, {
        params: {
          q: query,
          page,
          pageSize: 10,
          sortBy: 'publishedAt',
          apiKey: NEWS_API_KEY,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('News API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to search news');
    }
  },

  async getNewsByCategory(category: string, page: number = 1): Promise<NewsResponse> {
    try {
      if (!NEWS_API_KEY) {
        throw new Error('News API key is not configured');
      }

      const response = await axios.get(`${BASE_URL}/top-headlines`, {
        params: {
          country: 'us',
          category,
          page,
          pageSize: 10,
          apiKey: NEWS_API_KEY,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('News API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch category news');
    }
  },
}; 