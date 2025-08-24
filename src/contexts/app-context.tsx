'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { translations, type Language } from '@/lib/translations';
import type { Service, Staff, ServiceConfig } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  deleteDoc,
  doc,
  orderBy,
  writeBatch,
  updateDoc,
} from 'firebase/firestore';
import { isSameDay } from 'date-fns';
import { SERVICE_TYPES } from '@/lib/constants';

export interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  isAuthenticated: boolean;
  user: User | null;
  login: (user: string, pass: string) => void;
  signUp: (user: string, pass: string) => void;
  logout: () => void;
  services: Service[];
  allServices: Service[];
  loadAllServices: () => Promise<void>;
  staff: Staff[];
  addStaff: (name: string, nameEn: string) => void;
  removeStaff: (id: string) => void;
  addService: (service: Omit<Service, 'id' | 'timestamp'>) => void;
  loadServicesForDate: (date: Date) => void;
  isLoading: boolean;
  isInitialized: boolean;
  serviceConfigs: ServiceConfig[];
  addServiceConfig: (config: Omit<ServiceConfig, 'id' | 'userId'>) => Promise<void>;
  updateServiceConfig: (config: ServiceConfig) => Promise<void>;
  removeServiceConfig: (id: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [user, setUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [serviceConfigs, setServiceConfigs] = useState<ServiceConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const isAuthenticated = !!user;

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const t = useCallback((key: keyof typeof translations.en): string => {
    const translation = translations[language][key] || translations.en[key];
    if (!translation) {
      const keyStr = key as string;
      return keyStr.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return translation;
  }, [language]);

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  const loadServiceConfigs = useCallback(async (currentUserId: string): Promise<ServiceConfig[]> => {
    try {
      const configsCol = collection(db, 'service_configs');
      const q = query(configsCol, where('userId', '==', currentUserId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        const batch = writeBatch(db);
        const enTranslations = translations.en;
        const arTranslations = translations.ar;
        
        const newConfigs: ServiceConfig[] = [];

        Object.entries(SERVICE_TYPES).forEach(([key, config]) => {
          const newDocRef = doc(collection(db, 'service_configs'));
          const nameArKey = key as keyof typeof arTranslations;
          const nameEnKey = key as keyof typeof enTranslations;

          const newConfigData: Omit<ServiceConfig, 'id'> = {
            name: key,
            nameAr: arTranslations[nameArKey] || key,
            nameEn: enTranslations[nameEnKey] || key,
            userId: currentUserId,
            ...config,
          };
          batch.set(newDocRef, newConfigData);
          newConfigs.push({ ...newConfigData, id: newDocRef.id });
        });

        await batch.commit();
        setServiceConfigs(newConfigs);
        toast({ title: t('service-type-added-success')});
        return newConfigs;
      } else {
         const configs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<ServiceConfig, 'id'>),
        })).sort((a, b) => a.name.localeCompare(b.name));
        setServiceConfigs(configs);
        return configs;
      }
    } catch (error) {
      console.error("Error loading service configs:", error);
      toast({ title: t('service-type-updated-failed'), variant: "destructive" });
      return [];
    }
  }, [toast, t]);

  const addServiceConfig = async (config: Omit<ServiceConfig, 'id' | 'userId'>) => {
    if (!user) return;
    showLoading();
    try {
        const newConfig = { ...config, userId: user.uid };
        await addDoc(collection(db, 'service_configs'), newConfig);
        await loadServiceConfigs(user.uid);
        toast({ title: t('service-type-added-success')});
    } catch(e) {
        console.error("Error adding service config:", e);
        toast({ title: t('service-type-added-failed'), variant: "destructive"});
    } finally {
        hideLoading();
    }
  };

  const updateServiceConfig = async (config: ServiceConfig) => {
    if (!user) return;
    showLoading();
    try {
        const { id, ...configData } = config;
        await updateDoc(doc(db, 'service_configs', id), configData);
        await loadServiceConfigs(user.uid);
        toast({ title: t('service-type-updated-success')});
    } catch(e) {
        console.error("Error updating service config:", e);
        toast({ title: t('service-type-updated-failed'), variant: "destructive"});
    } finally {
        hideLoading();
    }
  };
  
  const removeServiceConfig = async (id: string) => {
    if (!user) return;
    showLoading();
    try {
        await deleteDoc(doc(db, 'service_configs', id));
        await loadServiceConfigs(user.uid);
        toast({ title: t('service-type-removed-success')});
    } catch(e) {
        console.error("Error deleting service config:", e);
        toast({ title: t('service-type-removed-failed'), variant: "destructive"});
    } finally {
        hideLoading();
    }
  };

  const login = async (email: string, password: string) => {
    showLoading();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      const firebaseError = error as { code?: string };
      let message = t('login-failed');
      if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
        message = t('login-failed');
      }
      toast({
        title: message,
        variant: 'destructive',
      });
    } finally {
      hideLoading();
    }
  };

  const signUp = async (email: string, password: string) => {
    showLoading();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: t('signup-success-title'),
        description: t('signup-success-description'),
        variant: 'default',
      });
    } catch (error) {
      console.error(error);
      const firebaseError = error as { code?: string };
      let message = t('signup-failed');
      if (firebaseError.code === 'auth/email-already-in-use') {
        message = t('signup-failed-email-in-use');
      } else if (firebaseError.code === 'auth/weak-password') {
        message = t('signup-failed-weak-password');
      }
      toast({
        title: message,
        variant: 'destructive',
      });
    } finally {
      hideLoading();
    }
  };

  const logout = async () => {
    showLoading();
    try {
      await signOut(auth);
      setStaff([]);
      setServices([]);
      setAllServices([]);
      setServiceConfigs([]);
    } catch (error) {
      console.error(error);
    } finally {
      hideLoading();
    }
  };

  const loadStaff = useCallback(async (currentUserId: string) => {
    try {
      const staffCol = collection(db, 'staff');
       const q = query(staffCol, where('userId', '==', currentUserId), orderBy('name'));
      const querySnapshot = await getDocs(q);
      const staffData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Staff, 'id'>),
      }));
      setStaff(staffData);
    } catch (error) {
      console.error('Error loading staff:', error);
      setStaff([]);
    }
  }, []);
  
  const addStaff = async (name: string, nameEn: string) => {
    if (!user) return;
    showLoading();
    try {
      await addDoc(collection(db, 'staff'), {
        name,
        nameEn,
        userId: user.uid,
      });
      await loadStaff(user.uid);
      toast({ title: t('staff-added-success') });
    } catch (error) {
      console.error('Error adding staff:', error);
      toast({ title: t('staff-added-failed'), variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };

  const removeStaff = async (id: string) => {
    if (!user) return;
    showLoading();
    try {
      await deleteDoc(doc(db, 'staff', id));
      await loadStaff(user.uid);
      toast({ title: t('staff-removed-success') });
    } catch (error) {
      console.error('Error removing staff:', error);
      toast({ title: t('staff-removed-failed'), variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };

  const loadAllServices = useCallback(async () => {
    if (!user) return;
    showLoading();
    try {
      const servicesCol = collection(db, 'services');
      const q = query(
        servicesCol,
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const allServicesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: (data.timestamp as Timestamp).toDate().toISOString(),
        } as Service;
      });
      setAllServices(allServicesData);
      
      const todayServices = allServicesData
        .filter(service => isSameDay(new Date(service.timestamp), new Date()))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setServices(todayServices);

    } catch (error) {
      console.error('Error loading all services: ', error);
      toast({ title: 'Failed to load services data.', variant: 'destructive' });
      setAllServices([]);
    } finally {
      hideLoading();
    }
  }, [toast, user]);

  const loadServicesForDate = useCallback((date: Date) => {
    const dailyServices = allServices
      .filter(service => isSameDay(new Date(service.timestamp), date))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setServices(dailyServices);
  }, [allServices]);

  const addService = async (serviceData: Omit<Service, 'id' | 'timestamp'>) => {
    if (!user) return;
    showLoading();
    try {
      const now = new Date();
      
      const serviceToSave: { [key: string]: any } = {
        ...serviceData,
        timestamp: Timestamp.fromDate(now),
      };

      if (serviceToSave.paymentMethod === undefined) {
        delete serviceToSave.paymentMethod;
      }

      const docRef = await addDoc(collection(db, 'services'), serviceToSave);

      const newServiceForState: Service = {
        ...serviceData,
        id: docRef.id,
        timestamp: now.toISOString(),
      };
      
      const updatedAllServices = [newServiceForState, ...allServices];
      setAllServices(updatedAllServices);

      if(isSameDay(new Date(newServiceForState.timestamp), new Date())) {
        setServices(prev => [newServiceForState, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      }

      toast({ title: t('service-saved') });
    } catch (error)
    {
      console.error('Error adding service: ', error);
      toast({ title: 'Failed to save service', variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };
  
  const loadInitialData = useCallback(async (currentUser: User) => {
    showLoading();
    try {
        await Promise.all([
            loadStaff(currentUser.uid),
            loadServiceConfigs(currentUser.uid),
        ]);
        // Only load today's services initially
        const servicesCol = collection(db, 'services');
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const q = query(
            servicesCol,
            where('userId', '==', currentUser.uid),
            where('timestamp', '>=', startOfDay),
            where('timestamp', '<=', endOfDay),
            orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const todayServicesData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
            id: doc.id,
            ...data,
            timestamp: (data.timestamp as Timestamp).toDate().toISOString(),
            } as Service;
        });
        setServices(todayServicesData);

    } catch (e) {
        console.error("Failed to load initial data", e);
        toast({ title: 'Failed to load initial data', variant: 'destructive' });
    } finally {
        hideLoading();
    }
  }, [loadStaff, loadServiceConfigs, toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      setUser(currentUser);

      if (currentUser) {
        await loadInitialData(currentUser);
      } else {
        setStaff([]);
        setServices([]);
        setAllServices([]);
        setServiceConfigs([]);
      }
      setIsInitialized(true);
      setIsLoading(false);
    });
    
    if (typeof window !== 'undefined' && !document.documentElement.lang) {
      setLanguage('ar');
    }

    return () => unsubscribe();
  }, [loadInitialData, setLanguage]);


  const value = {
    language,
    setLanguage,
    t,
    isAuthenticated,
    user,
    login,
    signUp,
    logout,
    services,
    allServices,
    loadAllServices,
    staff,
    addStaff,
    removeStaff,
    addService,
    loadServicesForDate,
    isLoading,
    isInitialized,
    serviceConfigs,
    addServiceConfig,
    updateServiceConfig,
    removeServiceConfig,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
