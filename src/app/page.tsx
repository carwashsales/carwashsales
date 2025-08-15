'use client';

import { useState } from 'react';
import { useApp } from '@/hooks/use-app';
import { LoadingOverlay } from '@/components/loading-overlay';
import dynamic from 'next/dynamic';

const LoginForm = dynamic(() => import('@/components/login-form').then(mod => mod.LoginForm), { ssr: false });
const SignUpForm = dynamic(() => import('@/components/signup-form').then(mod => mod.SignUpForm), { ssr: false });
const CarWashApp = dynamic(() => import('@/components/car-wash-app').then(mod => mod.CarWashApp), { ssr: false });

type AuthView = 'login' | 'signup';

export default function Home() {
  const { isAuthenticated, isLoading, isInitialized } = useApp();
  const [authView, setAuthView] = useState<AuthView>('login');

  if (!isInitialized || isLoading) {
    return <LoadingOverlay />;
  }

  const renderAuth = () => {
    if (authView === 'login') {
      return <LoginForm onSwitchView={() => setAuthView('signup')} />;
    }
    return <SignUpForm onSwitchView={() => setAuthView('login')} />;
  };

  return (
    <>
      {isAuthenticated ? <CarWashApp /> : renderAuth()}
    </>
  );
}
