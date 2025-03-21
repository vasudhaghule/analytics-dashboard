import { Inter } from 'next/font/google';
import Layout from '../components/Layout';
import Providers from '../components/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Analytics Dashboard',
  description: 'A comprehensive analytics dashboard with weather, news, and finance data',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
} 