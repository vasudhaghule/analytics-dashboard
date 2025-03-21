import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
}

export interface StockResponse {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
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
}

export const financeService = {
  async getStockData(symbol: string): Promise<StockData> {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: ALPHA_VANTAGE_API_KEY,
        },
      });

      const quote = response.data['Global Quote'];
      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        open: parseFloat(quote['02. open']),
        close: parseFloat(quote['05. price']),
      };
    } catch (error) {
      throw new Error('Failed to fetch stock data');
    }
  },

  async getHistoricalData(symbol: string, timeRange: '1d' | '1w' | '1m' | '1y'): Promise<HistoricalDataResponse> {
    try {
      const functionMap = {
        '1d': 'TIME_SERIES_INTRADAY',
        '1w': 'TIME_SERIES_DAILY',
        '1m': 'TIME_SERIES_DAILY',
        '1y': 'TIME_SERIES_DAILY',
      };

      const intervalMap = {
        '1d': '5min',
        '1w': '60min',
        '1m': 'daily',
        '1y': 'daily',
      };

      const response = await axios.get(BASE_URL, {
        params: {
          function: functionMap[timeRange],
          symbol,
          interval: intervalMap[timeRange],
          apikey: ALPHA_VANTAGE_API_KEY,
        },
      });

      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch historical data');
    }
  },

  async searchSymbols(query: string): Promise<Array<{ symbol: string; name: string }>> {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: query,
          apikey: ALPHA_VANTAGE_API_KEY,
        },
      });

      return response.data.bestMatches.map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
      }));
    } catch (error) {
      throw new Error('Failed to search symbols');
    }
  },
}; 