
'use client';

import './globals.css';
import { AppProvider, AppContext } from '@/contexts/app-context';
import { Toaster } from '@/components/ui/toaster';
import { useContext } from 'react';
import { LoadingOverlay } from '@/components/loading-overlay';
import { CarWashApp } from '@/components/car-wash-app';
import { LoginForm } from '@/components/login-form';
import { SignUpForm } from '@/components/signup-form';
import { useState } from 'react';

function AppContent({ children }: { children: React.ReactNode }) {
  const context = useContext(AppContext);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  if (!context) {
    return <LoadingOverlay />;
  }

  const { isInitialized, isLoading, isAuthenticated } = context;

  if (!isInitialized || isLoading) {
    return <LoadingOverlay />;
  }

  const renderAuth = () => {
    if (authView === 'login') {
      return <LoginForm onSwitchView={() => setAuthView('signup')} />;
    }
    return <SignUpForm onSwitchView={() => setAuthView('login')} />;
  };

  if (!isAuthenticated) {
     // Check if the current page is the privacy policy
    if (typeof window !== 'undefined' && window.location.pathname.includes('/privacy-policy')) {
      return <>{children}</>;
    }
    return renderAuth();
  }

  // If authenticated, show the main app layout.
  // The 'children' will be the specific page content (e.g., settings).
  // The main app dashboard is now implicitly part of the layout for authenticated users.
   if (typeof window !== 'undefined' && window.location.pathname.includes('/settings')) {
     return <>{children}</>;
   }

  return <CarWashApp />;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AppProvider>
          <AppContent>{children}</AppContent>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
