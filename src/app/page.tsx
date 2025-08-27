
'use client';

import { useState, useContext } from 'react';
import { AppContext } from '@/contexts/app-context';
import { useApp } from '@/hooks/use-app';
import { LoginForm } from '@/components/login-form';
import { SignUpForm } from '@/components/signup-form';
import { CarWashApp } from '@/components/car-wash-app';
import { LoadingOverlay } from '@/components/loading-overlay';
import { usePathname } from 'next/navigation';
import SettingsPage from './settings/page';
import PrivacyPolicyPage from './privacy-policy/page';


type AuthView = 'login' | 'signup';

function PageContent() {
  const { isAuthenticated, isLoading, isInitialized } = useApp();
  const [authView, setAuthView] = useState<AuthView>('login');
  const pathname = usePathname();

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
    if (pathname === '/privacy-policy') {
       return <PrivacyPolicyPage/>
    }
    return renderAuth();
  }

  if (pathname === '/settings') {
    return <SettingsPage/>
  }

  if (pathname === '/privacy-policy') {
    return <PrivacyPolicyPage/>
  }

  return <CarWashApp />;
}

export default function Home() {
  const context = useContext(AppContext);
  if (!context) {
    return <LoadingOverlay />;
  }
  return <PageContent />;
}
