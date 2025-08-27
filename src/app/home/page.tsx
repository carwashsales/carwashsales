
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, BarChart, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/home" className="flex items-center gap-2" prefetch={false}>
            <span className="text-xl font-bold text-primary">Siyara Wasla</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" legacyBehavior passHref>
               <Button asChild>
                <a>Access App</a>
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40">
           <Image
            src="/hero-background.jpg"
            alt="Car wash background"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 z-0 opacity-20"
            data-ai-hint="car wash professional"
          />
          <div className="container relative z-10 mx-auto px-4 text-center md:px-6">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Streamline Your Car Wash Operations
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                Siyara Wasla is the all-in-one solution to manage services, track sales, and calculate commissions with ease.
              </p>
              <div className="mt-10">
                 <Link href="/" legacyBehavior passHref>
                    <Button size="lg">
                      Get Started Now
                    </Button>
                 </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-5xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Features Built for Your Success
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to run your car wash business efficiently.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="items-center">
                  <div className="rounded-full bg-primary/10 p-3">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Service Recording</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Quickly record every service with an intuitive form, from wash type to staff member.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="items-center">
                  <div className="rounded-full bg-primary/10 p-3">
                    <BarChart className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Daily Reports</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Generate daily summaries of total sales and commissions to stay on top of your earnings.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="items-center">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Customer History</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Track customer visits and send promotional messages via WhatsApp to build loyalty.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="items-center">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Settings className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Service Management</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Easily customize service types, pricing, and commission structures on the fly.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row md:px-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Siyara Wasla. All rights reserved.
          </p>
           <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>
              Privacy Policy
            </Link>
        </div>
      </footer>
    </div>
  );
}
