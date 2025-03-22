import axios from 'axios';
import { StockData } from '@/types/finance';

const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// Demo data for testing
const DEMO_API_KEY = 'demo';
const USE_DEMO = true; // Set to true to use demo data

// Map for special stock symbols that need translation
const SYMBOL_MAP: { [key: string]: string } = {
  'GOOGL': 'GOOG',  // Google stock after split
};

export interface StockResponse {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}

export interface HistoricalDataResponse {
  'Time Series (Daily)': {
    [date: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
  'Meta Data'?: {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Output Size': string;
    '5. Time Zone': string;
  };
}

export const financeService = {
  async getStockData(symbol: string): Promise<StockData> {
    try {
      const apiKey = USE_DEMO ? DEMO_API_KEY : ALPHA_VANTAGE_API_KEY;
      
      if (!apiKey) {
        throw new Error('Alpha Vantage API key is not configured');
      }

      const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
      console.log('Fetching from URL:', url.replace(apiKey, '****'));

      const response = await axios.get(url);
      
      // Log the complete response for debugging
      console.log('API Response Status:', response.status);
      console.log('API Response Data:', response.data);

      // Check for rate limit message
      if (response.data?.Note) {
        throw new Error(response.data.Note);
      }

      // Check for error message
      if (response.data?.['Error Message']) {
        throw new Error(response.data['Error Message']);
      }

      const quote = response.data['Global Quote'];
      
      if (!quote || Object.keys(quote).length === 0) {
        // If using demo mode and no data, provide sample data
        if (USE_DEMO) {
          return {
            symbol: symbol,
            price: 150.25,
            change: 2.5,
            changePercent: 1.67,
            volume: 1000000,
            high: 151.20,
            low: 149.30,
            open: 149.50,
            close: 147.75,
            marketCap: 0,
            peRatio: 0,
          };
        }
        throw new Error(`No stock data available for symbol: ${symbol}. Please try again later.`);
      }

      return {
        symbol: symbol,
        price: parseFloat(quote['05. price']) || 0,
        change: parseFloat(quote['09. change']) || 0,
        changePercent: parseFloat(quote['10. change percent']?.replace('%', '')) || 0,
        volume: parseInt(quote['06. volume']) || 0,
        high: parseFloat(quote['03. high']) || 0,
        low: parseFloat(quote['04. low']) || 0,
        open: parseFloat(quote['02. open']) || 0,
        close: parseFloat(quote['08. previous close']) || 0,
        marketCap: 0,
        peRatio: 0,
      };
    } catch (error: any) {
      console.error('Error fetching stock data:', error);
      
      if (USE_DEMO) {
        // Return sample data in case of error in demo mode
        return {
          symbol: symbol,
          price: 150.25,
          change: 2.5,
          changePercent: 1.67,
          volume: 1000000,
          high: 151.20,
          low: 149.30,
          open: 149.50,
          close: 147.75,
          marketCap: 0,
          peRatio: 0,
        };
      }

      throw new Error(error.message || 'Failed to fetch stock data');
    }
  },

  async getHistoricalData(symbol: string, timeRange: '1d' | '1w' | '1m' | '1y'): Promise<any> {
    try {
      const apiKey = USE_DEMO ? DEMO_API_KEY : ALPHA_VANTAGE_API_KEY;
      
      if (!apiKey) {
        throw new Error('Alpha Vantage API key is not configured');
      }

      const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
      console.log('Fetching historical data from URL:', url.replace(apiKey, '****'));

      const response = await axios.get(url);

      if (response.data?.Note || response.data?.['Error Message']) {
        throw new Error(response.data?.Note || response.data?.['Error Message']);
      }

      const timeSeriesData = response.data['Time Series (Daily)'];
      
      if (!timeSeriesData || Object.keys(timeSeriesData).length === 0) {
        // If using demo mode and no data, provide sample data
        if (USE_DEMO) {
          const sampleData: any = {};
          const today = new Date();
          for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            sampleData[dateStr] = {
              '1. open': '150.00',
              '2. high': '152.00',
              '3. low': '149.00',
              '4. close': '151.00',
              '5. volume': '1000000'
            };
          }
          return {
            'Time Series (Daily)': sampleData
          };
        }
        throw new Error(`No historical data available for symbol: ${symbol}`);
      }

      return response.data;
    } catch (error: any) {
      console.error('Error fetching historical data:', error);
      
      if (USE_DEMO) {
        // Return sample data in case of error in demo mode
        const sampleData: any = {};
        const today = new Date();
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          sampleData[dateStr] = {
            '1. open': '150.00',
            '2. high': '152.00',
            '3. low': '149.00',
            '4. close': '151.00',
            '5. volume': '1000000'
          };
        }
        return {
          'Time Series (Daily)': sampleData
        };
      }

      throw new Error(error.message || 'Failed to fetch historical data');
    }
  },

  async searchSymbols(query: string): Promise<Array<{ symbol: string; name: string }>> {
    try {
      if (!ALPHA_VANTAGE_API_KEY) {
        throw new Error('Alpha Vantage API key is not configured');
      }

      const response = await axios.get(BASE_URL, {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: query,
          apikey: ALPHA_VANTAGE_API_KEY,
        },
      });

      // Check for rate limit message
      if (response.data?.Note?.includes('API call frequency')) {
        throw new Error('API rate limit exceeded. Please wait a minute before trying again.');
      }

      if (!response.data.bestMatches) {
        return [];
      }

      return response.data.bestMatches.map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
      }));
    } catch (error: any) {
      console.error('Error searching symbols:', error);
      if (error.response?.status === 429) {
        throw new Error('API rate limit exceeded. Please wait a minute before trying again.');
      }
      throw new Error(error.response?.data?.['Error Message'] || error.message || 'Failed to search symbols');
    }
  },
}; 