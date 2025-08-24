
'use client';

// This component is now much simpler.
// The main logic is in the root layout.
// This page component will only be rendered for authenticated users.
import { CarWashApp } from '@/components/car-wash-app';

export default function Home() {
  return <CarWashApp />;
}
