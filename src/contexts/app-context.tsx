'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { translations, type Language } from '@/lib/translations';
import type { Service, Staff } from '@/types';
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
} from 'firebase/firestore';
import { isSameDay } from 'date-fns';

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
  staff: Staff[];
  addStaff: (name: string, nameEn: string) => void;
  removeStaff: (id: string) => void;
  addService: (service: Omit<Service, 'id' | 'timestamp'>) => void;
  loadServicesForDate: (date: Date) => void;
  submitSupportTicket: (subject: string, message: string, email?: string) => void;
  isLoading: boolean;
  isInitialized: boolean;
}

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [user, setUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    return translations[language][key] || translations.en[key];
  }, [language]);

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  const login = async (email: string, password: string) => {
    showLoading();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      const firebaseError = error as { code?: string };
      let message = t('login-failed');
      if (firebaseError.code === 'auth/invalid-credential') {
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

  const loadAllServices = useCallback(async (currentUserId: string) => {
    showLoading();
    try {
      const servicesCol = collection(db, 'services');
      const q = query(
        servicesCol,
        where('userId', '==', currentUserId),
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
      return allServicesData;
    } catch (error) {
      console.error('Error loading all services: ', error);
      toast({ title: 'Failed to load services data.', variant: 'destructive' });
      setAllServices([]);
      return [];
    } finally {
      hideLoading();
    }
  }, [toast]);

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
      const newService = {
        ...serviceData,
        timestamp: Timestamp.fromDate(now),
      };
      const docRef = await addDoc(collection(db, 'services'), newService);

      const newServiceForState: Service = {
        ...serviceData,
        id: docRef.id,
        timestamp: now.toISOString(),
      };
      
      const updatedAllServices = [...allServices, newServiceForState];
      setAllServices(updatedAllServices);

      const dailyServices = updatedAllServices
        .filter(service => isSameDay(new Date(service.timestamp), now))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setServices(dailyServices);

      toast({ title: t('service-saved') });
    } catch (error) {
      console.error('Error adding service: ', error);
      toast({ title: 'Failed to save service', variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };

  const submitSupportTicket = async (subject: string, message: string, email?: string) => {
    if (!user && !email) {
      toast({ title: t('login-required-error'), variant: 'destructive' });
      return;
    }
    showLoading();
    try {
      await addDoc(collection(db, 'supportTickets'), {
        userId: user ? user.uid : 'anonymous',
        email: user ? user.email : email,
        subject,
        message,
        timestamp: Timestamp.now(),
        status: 'new',
      });
      toast({ title: t('message-sent-success') });
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      toast({ title: t('message-sent-failed'), variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setIsLoading(true);
        setUser(currentUser);
        if (currentUser) {
          await loadStaff(currentUser.uid);
          const services = await loadAllServices(currentUser.uid);
          const todayServices = services
            .filter(service => isSameDay(new Date(service.timestamp), new Date()))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setServices(todayServices);
        } else {
          setStaff([]);
          setServices([]);
          setAllServices([]);
        }
      } catch (error) {
        console.error("Error during auth state change:", error);
        // Ensure user is logged out and data is cleared on error
        setUser(null);
        setStaff([]);
        setServices([]);
        setAllServices([]);
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    });

    if (typeof window !== 'undefined' && !document.documentElement.lang) {
      setLanguage('ar');
    }

    return () => unsubscribe();
  }, [setLanguage, loadStaff, loadAllServices]);

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
    staff,
    addStaff,
    removeStaff,
    addService,
    loadServicesForDate,
    submitSupportTicket,
    isLoading,
    isInitialized,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
