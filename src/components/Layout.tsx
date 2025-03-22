'use client';

import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Weather', href: '/weather' },
  { name: 'News', href: '/news' },
  { name: 'Finance', href: '/finance' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex min-h-0 flex-1 flex-col border-r border-border bg-card">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <h1 className="text-xl font-bold text-primary">Analytics Dashboard</h1>
              </div>
              <nav className="mt-5 flex-1 space-y-1 bg-card px-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top navigation */}
          <div className="relative z-10 flex h-16 flex-shrink-0 border-b border-border bg-card">
            <div className="flex flex-1 justify-between px-4">
              <div className="flex flex-1">
                <div className="flex w-full md:hidden">
                  <div className="flex flex-1 items-center">
                    <h1 className="text-xl font-bold text-primary">Analytics Dashboard</h1>
                  </div>
                </div>
              </div>
              <div className="ml-4 flex items-center md:ml-6">
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto bg-background p-4">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 