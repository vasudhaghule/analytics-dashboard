'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { newsService, NewsArticle as APINewsArticle } from '../services/newsService';
import { setArticles, setSelectedCategory, setLoading, setError, setPage } from '../store/slices/newsSlice';
import { RootState } from '../store/store';

const NewsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
}));

const categories = [
  'business',
  'entertainment',
  'general',
  'health',
  'science',
  'sports',
  'technology',
];

interface TransformedNewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  source: string;
  publishedAt: string;
  category: string;
}

const News: React.FC = () => {
  const dispatch = useDispatch();
  const { articles, selectedCategory, loading, error, page, hasMore } = useSelector(
    (state: RootState) => state.news
  );

  const transformArticle = (article: APINewsArticle): TransformedNewsArticle => ({
    id: article.url,
    title: article.title,
    description: article.description,
    url: article.url,
    imageUrl: article.urlToImage || '',
    source: article.source.name,
    publishedAt: article.publishedAt,
    category: selectedCategory || 'general',
  });

  const fetchNews = async (category?: string, pageNum: number = 1) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await newsService.getTopHeadlines(category, pageNum);
      const transformedArticles = response.articles.map(transformArticle);
      dispatch(setArticles(transformedArticles));
      dispatch(setSelectedCategory(category || null));
      dispatch(setPage(pageNum));
    } catch (err: any) {
      console.error('News fetch error:', err);
      dispatch(setError(err.message || 'Failed to fetch news'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchNews(selectedCategory || undefined, page);
  }, [selectedCategory, page]);

  const handleCategoryChange = (event: any) => {
    const category = event.target.value;
    dispatch(setSelectedCategory(category));
    dispatch(setPage(1));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPage(value));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        News Dashboard
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory || ''}
            onChange={handleCategoryChange}
            label="Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {articles.map((article) => (
              <Grid item xs={12} sm={6} md={4} key={article.id}>
                <NewsCard>
                  {article.imageUrl && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={article.imageUrl}
                      alt={article.title}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {article.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={article.source}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Button
                        size="small"
                        color="primary"
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Read More
                      </Button>
                    </Box>
                  </CardContent>
                </NewsCard>
              </Grid>
            ))}
          </Grid>

          {articles.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(articles.length / 10)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default News; 