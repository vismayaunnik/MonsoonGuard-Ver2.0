"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Coordinates, DisasterData, detectLocation, fetchAllDisasterData } from '@/lib/disaster-service';
import { translations, Language } from '@/lib/translations';

interface DisasterContextType {
  coords: Coordinates | null;
  city: string;
  data: DisasterData | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const DisasterContext = createContext<DisasterContextType>({
  coords: null,
  city: 'Loading...',
  data: null,
  loading: true,
  refreshData: async () => {},
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export const useDisasterData = () => useContext(DisasterContext);

export const DisasterProvider = ({ children }: { children: React.ReactNode }) => {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [city, setCity] = useState('Detecting location...');
  const [data, setData] = useState<DisasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>('en');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('appLanguage', lang);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('appLanguage') as Language;
      if (savedLang && translations[savedLang]) {
        setLanguageState(savedLang);
      }
    }
  }, []);

  const initData = async () => {
    setLoading(true);
    try {
      // 1. Get coords
      const locationInfo = await detectLocation();
      setCoords(locationInfo.coords);
      setCity(locationInfo.city);

      // 2. Fetch all data
      const disasterData = await fetchAllDisasterData(locationInfo.coords);
      setData(disasterData);
    } catch (error) {
      console.error("Failed to initialize disaster data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  return (
    <DisasterContext.Provider value={{ coords, city, data, loading, refreshData: initData, language, setLanguage, t }}>
      {children}
    </DisasterContext.Provider>
  );
};
