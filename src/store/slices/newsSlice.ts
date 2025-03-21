import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  source: string;
  publishedAt: string;
  category: string;
}

interface NewsState {
  articles: NewsArticle[];
  selectedCategory: string | null;
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

const initialState: NewsState = {
  articles: [],
  selectedCategory: null,
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setArticles: (state, action: PayloadAction<NewsArticle[]>) => {
      state.articles = action.payload;
    },
    addArticles: (state, action: PayloadAction<NewsArticle[]>) => {
      state.articles = [...state.articles, ...action.payload];
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
  },
});

export const {
  setArticles,
  addArticles,
  setSelectedCategory,
  setLoading,
  setError,
  setPage,
  setHasMore,
} = newsSlice.actions;
export default newsSlice.reducer; 