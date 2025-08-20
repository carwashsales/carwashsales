'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/hooks/use-app';
import { useToast } from '@/hooks/use-toast';
import { SERVICE_TYPES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings } from 'lucide-react';
import type { Service } from '@/types';

export function NewServiceForm() {
  const { 
    t, 
    language, 
    staff, 
    addService, 
    user
  } = useApp();
  const { toast } = useToast();
  
  const [serviceType, setServiceType] = useState('');
  const [carSize, setCarSize] = useState('');
  const [staffId, setStaffId] = useState('');
  const [useCoupon, setUseCoupon] = useState(false);
  const [price, setPrice] = useState<number | string>('');
  const [commission, setCommission] = useState<number | string>('');
  const [customerContact, setCustomerContact] = useState('');
   const [paymentMethod, setPaymentMethod] = useState<'cash' | 'machine' | undefined>(undefined);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});


  const serviceConfig = serviceType ? SERVICE_TYPES[serviceType] : null;

  const resetForm = useCallback(() => {
    setServiceType('');
    setCarSize('');
    setStaffId('');
    setUseCoupon(false);
    setPrice('');
    setCommission('');
    setCustomerContact('');
    setPaymentMethod(undefined);
    setErrors({});
  }, []);

  useEffect(() => {
    if (!serviceConfig) {
      setPrice('');
      setCommission('');
      setCarSize('');
      setUseCoupon(false);
      return;
    }

    if (!serviceConfig.needsSize) {
      setCarSize('');
    }

    if (!serviceConfig.hasCoupon) {
      setUseCoupon(false);
    }

    const priceKey = serviceConfig.needsSize ? carSize : 'default';
    if (!priceKey) {
      setPrice('');
      setCommission('');
      return;
    }

    const priceObj = serviceConfig.prices[priceKey];
    if (priceObj) {
      if (useCoupon && serviceConfig.hasCoupon && priceObj.couponCommission !== undefined) {
        setPrice(0);
        setCommission(priceObj.couponCommission);
      } else {
        setPrice(priceObj.price);
        setCommission(priceObj.commission);
      }
    } else {
      setPrice('');
      setCommission('');
    }
  }, [serviceType, carSize, useCoupon, serviceConfig]);

  const validateForm = () => {
    const newErrors: { [key: string]: boolean } = {};
    if (!serviceType) newErrors.serviceType = true;
    if (serviceConfig?.needsSize && !carSize) newErrors.carSize = true;
    if (!staffId) newErrors.staffId = true;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

   const handlePaymentMethodChange = (method: 'cash' | 'machine') => {
    setPaymentMethod(prev => prev === method ? undefined : method);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) {
       toast({
        title: t('fix-errors-title'),
        description: t('fix-errors-description'),
        variant: 'destructive',
      });
      return;
    }

    const selectedStaff = staff.find(s => s.id === staffId);
    if (!selectedStaff) return;
    
    const servicePayload: Omit<Service, 'id' | 'timestamp'> = {
      userId: user.uid,
      serviceType,
      carSize: carSize || null,
      hasCoupon: useCoupon,
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      staffNameEn: selectedStaff.nameEn,
      price: Number(price),
      commission: Number(commission),
      paymentMethod,
    };

    if (customerContact) {
      servicePayload.customerContact = customerContact;
    }
    
    addService(servicePayload);

    resetForm();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('new-service-title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="service-type">{t('service-type-label')}</Label>
              <Select 
                value={serviceType} 
                onValueChange={(value) => {
                  setServiceType(value);
                  setErrors(prev => ({...prev, serviceType: false}));
                }}
              >
                <SelectTrigger id="service-type" data-invalid={errors.serviceType}>
                  <SelectValue placeholder={t('select-service-type')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(SERVICE_TYPES).map((key) => (
                    <SelectItem key={key} value={key}>
                      {t(key as keyof typeof import('@/lib/translations').translations.en)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="car-size">{t('car-size-label')}</Label>
              <Select 
                value={carSize} 
                onValueChange={(value) => {
                  setCarSize(value);
                  setErrors(prev => ({...prev, carSize: false}));
                }}
                disabled={!serviceConfig?.needsSize}
              >
                <SelectTrigger id="car-size" data-invalid={errors.carSize}>
                  <SelectValue placeholder={t('select-car-size')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">{t('small-car')}</SelectItem>
                  <SelectItem value="medium">{t('medium-car')}</SelectItem>
                  <SelectItem value="big">{t('big-car')}</SelectItem>
                  <SelectItem value="long-gmc">{t('long-gmc')}</SelectItem>
                  <SelectItem value="microbus">{t('microbus')}</SelectItem>
                  <SelectItem value="long-coaster">{t('long-coaster')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="staff-member">{t('staff-member-label')}</Label>
              <Select 
                value={staffId} 
                onValueChange={(value) => {
                  setStaffId(value);
                  setErrors(prev => ({...prev, staffId: false}));
                }}
              >
                <SelectTrigger id="staff-member" data-invalid={errors.staffId}>
                  <SelectValue placeholder={t('select-staff-member')} />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {language === 'ar' ? s.name : s.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-contact">{t('customer-contact-label')}</Label>
              <Input 
                id="customer-contact"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
                placeholder={t('customer-contact-placeholder')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">{t('price-label')}</Label>
              <Input id="price" value={price} readOnly />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="commission">{t('commission-label')}</Label>
              <Input id="commission" value={commission} readOnly />
            </div>
            
          <div className="flex items-center space-x-4 rtl:space-x-reverse pt-8 md:col-start-1">
              {serviceConfig?.hasCoupon && (
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox id="coupon-checkbox" checked={useCoupon} onCheckedChange={(checked) => setUseCoupon(Boolean(checked))} disabled={noStaff} />
                  <Label htmlFor="coupon-checkbox" className="cursor-pointer">{t('coupon-label')}</Label>
                </div>
              )}
               <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox id="payment-cash" checked={paymentMethod === 'cash'} onCheckedChange={() => handlePaymentMethodChange('cash')} disabled={noStaff} />
                <Label htmlFor="payment-cash" className="cursor-pointer">{t('payment-method-cash')}</Label>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox id="payment-machine" checked={paymentMethod === 'machine'} onCheckedChange={() => handlePaymentMethodChange('machine')} disabled={noStaff} />
                <Label htmlFor="payment-machine" className="cursor-pointer">{t('payment-method-machine')}</Label>
              </div>
            </div>
          </div>

          
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={resetForm}>{t('clear-btn')}</Button>
            <Button type="submit">{t('submit-btn')}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
