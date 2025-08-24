
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

  if (typeof window !== 'undefined') {
    console.log('Current Path:', window.location.pathname);
  }

  if (!context) {
    console.log('Context is missing, showing loading overlay.');
    return <LoadingOverlay />;
  }

  const { isInitialized, isLoading, isAuthenticated } = context;

  if (!isInitialized || isLoading) {
    console.log('App not initialized or is loading, showing loading overlay.');
    return <LoadingOverlay />;
  }

  const renderAuth = () => {
    if (authView === 'login') {
      return <LoginForm onSwitchView={() => setAuthView('signup')} />;
    }
    return <SignUpForm onSwitchView={() => setAuthView('login')} />;
  };

  if (!isAuthenticated) {
    console.log('User not authenticated.');
    // Allow access to privacy policy even when not logged in
    if (typeof window !== 'undefined' && window.location.pathname.includes('/privacy-policy')) {
      console.log('Rendering privacy policy for unauthenticated user.');
      return <>{children}</>;
    }
    console.log('Rendering auth forms.');
    return renderAuth();
  }

  console.log('User is authenticated.');
  // If authenticated, allow access to settings or other pages
   if (typeof window !== 'undefined' && (window.location.pathname.includes('/settings') || window.location.pathname.includes('/privacy-policy'))) {
     console.log('Rendering settings or privacy policy page.');
     return <>{children}</>;
   }

  // For any other authenticated route, show the main dashboard
  console.log('Rendering main CarWashApp.');
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
