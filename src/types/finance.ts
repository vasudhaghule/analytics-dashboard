export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  marketCap: number;
  peRatio: number;
}

export interface HistoricalDataPoint {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalData {
  [date: string]: HistoricalDataPoint;
}

export type TimeRange = '1d' | '1w' | '1m' | '1y'; 