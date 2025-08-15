'use client';

import { useApp } from '@/hooks/use-app';
import { Header } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewServiceForm } from '@/components/new-service-form';
import { DailyReport } from '@/components/daily-report';
import { SupportTab } from '@/components/support-tab';

export function CarWashApp() {
  const { t } = useApp();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Tabs defaultValue="new-service" className="container mx-auto py-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new-service">{t('new-service-tab-text')}</TabsTrigger>
            <TabsTrigger value="daily-report">{t('daily-report-tab-text')}</TabsTrigger>
            <TabsTrigger value="support">{t('support-tab-text')}</TabsTrigger>
          </TabsList>
          <TabsContent value="new-service" className="space-y-6">
            <NewServiceForm />
          </TabsContent>
          <TabsContent value="daily-report">
            <DailyReport />
          </TabsContent>
          <TabsContent value="support">
            <SupportTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
