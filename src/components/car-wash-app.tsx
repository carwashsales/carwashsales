'use client';

import { useApp } from '@/hooks/use-app';
import { Header } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewServiceForm } from '@/components/new-service-form';
import { DailyReport } from '@/components/daily-report';
import { CustomerHistory } from '@/components/customer-history';

export function CarWashApp() {
  const { t } = useApp();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Tabs defaultValue="reports" className="container mx-auto py-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reports">{t('reports-tab-text')}</TabsTrigger>
            <TabsTrigger value="new-service">{t('new-service-tab-text')}</TabsTrigger>
          </TabsList>
          <TabsContent value="new-service" className="space-y-6">
            <NewServiceForm />
          </TabsContent>
          <TabsContent value="reports" className="space-y-6">
            <DailyReport />
            <CustomerHistory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
