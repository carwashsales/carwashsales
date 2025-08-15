'use client';

import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, MessageCircle } from 'lucide-react';

const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export function SupportTab() {
  const { t } = useApp();

  const handleEmailContact = () => {
    const email = 'banksray206@gmail.com';
    const subject = t('support-title');
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
  };
  
  const handleWhatsAppContact = () => {
    window.open('https://wa.me/966545699674', '_blank');
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('support-title')}</CardTitle>
          <CardDescription>{t('support-subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center pt-10">
           <Button
                size="lg"
                className="w-full h-24 text-lg"
                onClick={handleEmailContact}
              >
                <Mail />
                <span>{t('contact-email-btn')}</span>
              </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('whatsapp-support-title')}</CardTitle>
          <CardDescription>{t('whatsapp-support-description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center pt-10">
           <Button
                size="lg"
                className="bg-[#25D366] hover:bg-[#128C7E] text-white w-full h-24 text-lg"
                onClick={handleWhatsAppContact}
              >
                <WhatsAppIcon />
                <span>{t('contact-whatsapp-btn')}</span>
              </Button>
        </CardContent>
      </Card>
    </div>
  );
}
