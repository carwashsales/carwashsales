'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/hooks/use-app';
import type { Service } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { differenceInDays, format } from 'date-fns';
import { arSA } from 'date-fns/locale';

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

export function CustomerHistory() {
  const { t, language, allServices } = useApp();
  const [searchContact, setSearchContact] = useState('');

  const customerServices = useMemo(() => {
    if (!searchContact) return [];
    return allServices
      .filter(s => s.customerContact === searchContact)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [searchContact, allServices]);

  const fullWashCount = useMemo(() => {
    return customerServices.filter(s => s.serviceType === 'full-wash' && s.isPaid).length;
  }, [customerServices]);

  const lastVisitDays = useMemo(() => {
    if (customerServices.length === 0) return null;
    const lastVisitDate = new Date(customerServices[0].timestamp);
    return differenceInDays(new Date(), lastVisitDate);
  }, [customerServices]);
  
  const getServiceTypeName = (s: Service) => {
    const key = s.serviceType as keyof typeof import('@/lib/translations').translations.en;
    const baseName = t(key) || s.serviceType;
    return s.waxAddOn ? `${baseName} + ${t('wax-add-on')}` : baseName;
  };
  
  const getCarSizeName = (carSizeId: string | null) => {
    if (!carSizeId) return '-';
    const key = `${carSizeId}-car` as keyof typeof import('@/lib/translations').translations.en;
    return t(key) || carSizeId;
  };

  const handleSendWhatsApp = () => {
    const locationUrl = 'https://share.google/UB0m98HiDNbftnJAc';
    const remainingWashes = 6 - (fullWashCount % 6);
    let message = '';

    if (lastVisitDays !== null && lastVisitDays > 30) {
      message = t('whatsapp-reengagement-message').replace('{location}', locationUrl);
    } else if (fullWashCount > 0 && fullWashCount % 6 === 0) {
      message = t('whatsapp-free-wash-message').replace('{location}', locationUrl);
    } else {
      message = t('whatsapp-standard-message')
        .replace('{count}', remainingWashes.toString())
        .replace('{location}', locationUrl);
    }
    
    const whatsappUrl = `https://wa.me/${searchContact}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('customer-history-title')}</CardTitle>
          <CardDescription>{t('customer-history-description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="customer-search">{t('customer-contact-label')}</Label>
              <Input
                id="customer-search"
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                placeholder={t('customer-contact-placeholder')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {searchContact && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>{t('service-history-for')} {searchContact}</CardTitle>
                    <CardDescription className="pt-2">
                        {t('full-wash-count')}: {fullWashCount}
                    </CardDescription>
                </div>
                <Button onClick={handleSendWhatsApp} disabled={customerServices.length === 0} className="bg-[#25D366] hover:bg-[#128C7E] text-white">
                    <WhatsAppIcon />
                    <span>{t('send-whatsapp-notification')}</span>
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table-header-date')}</TableHead>
                  <TableHead>{t('table-header-service')}</TableHead>
                  <TableHead>{t('table-header-size')}</TableHead>
                  <TableHead className="text-right">{t('table-header-price')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerServices.length > 0 ? (
                  customerServices.map((s: Service) => (
                    <TableRow key={s.id}>
                      <TableCell>{format(new Date(s.timestamp), 'PPP', { locale: language === 'ar' ? arSA : undefined })}</TableCell>
                      <TableCell>{getServiceTypeName(s)}</TableCell>
                      <TableCell>{getCarSizeName(s.carSize)}</TableCell>
                      <TableCell className="text-right">{s.price} {t('sar')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">{t('no-history-for-customer')}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
