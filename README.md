# Analytics Dashboard

A modern, responsive analytics dashboard built with Next.js that provides real-time weather information, financial data, and news updates.

## Project Overview

This analytics dashboard is a comprehensive web application that combines multiple data sources to provide users with valuable insights. The dashboard features:

- Real-time weather information with detailed forecasts
- Financial market data with interactive charts
- Latest news updates from various categories
- Responsive design that works on all devices
- Dark/Light theme support
- Interactive data visualizations

## Technologies Used

- **Frontend Framework**: Next.js 14.1.0
- **Language**: TypeScript
- **Styling**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Data Visualization**: Recharts
- **API Integration**: 
  - OpenWeather API
  - Alpha Vantage API
  - News API
- **Development Tools**:
  - ESLint
  - Prettier
  - TypeScript

## Installation Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/analytics-dashboard.git
   cd analytics-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
   NEXT_PUBLIC_NEWS_API_KEY=your_news_api_key
   NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
   NODE_ENV=development
   ```

4. Configure API keys:
   - [OpenWeather API](https://openweathermap.org/api)
   - [News API](https://newsapi.org/)
   - [Alpha Vantage API](https://www.alphavantage.co/)

## How to Run the Project

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. For production build:
   ```bash
   npm run build
   npm start
   ```

## Testing Instructions

1. Run unit tests:
   ```bash
   npm test
   ```

2. Run tests with coverage:
   ```bash
   npm run test:coverage
   ```

## Deployment Details

The application is deployed on Vercel:
[Live Demo](https://your-vercel-deployment-url.vercel.app)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_OPENWEATHER_API_KEY | API key for weather data | Yes |
| NEXT_PUBLIC_NEWS_API_KEY | API key for news data | Yes |
| NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY | API key for financial data | Yes |
| NODE_ENV | Environment setting | Yes |

## API Setup

1. **OpenWeather API**:
   - Sign up at [OpenWeather](https://openweathermap.org/api)
   - Get your API key from the dashboard
   - Add to `.env.local`

2. **News API**:
   - Sign up at [News API](https://newsapi.org/)
   - Get your API key from the dashboard
   - Add to `.env.local`

3. **Alpha Vantage API**:
   - Sign up at [Alpha Vantage](https://www.alphavantage.co/)
   - Get your API key from the dashboard
   - Add to `.env.local`

## Additional Features

- **Responsive Design**: Fully responsive layout that works on all devices
- **Theme Support**: Dark/Light mode toggle
- **Real-time Updates**: Live data updates for weather and financial information
- **Interactive Charts**: Dynamic charts with zoom and pan capabilities
- **Search Functionality**: Search for stocks and news articles
- **Watchlist**: Save and track favorite stocks
- **Error Handling**: Comprehensive error handling and loading states

## Screenshots

[Add your screenshots here]

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [OpenWeatherMap API](https://openweathermap.org/api)
- [NewsAPI](https://newsapi.org/)
- [Alpha Vantage](https://www.alphavantage.co/)
- [Material-UI](https://mui.com/)
 #   a n a l y t i c s - d a s h b o a r d 
 
 
