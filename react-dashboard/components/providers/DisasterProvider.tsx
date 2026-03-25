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
  locationError: 'PERMISSION_DENIED' | 'TECHNICAL_ERROR' | null;
  retryLocation: (useDefault?: boolean) => Promise<void>;
  showLocationModal: boolean;
  setShowLocationModal: (show: boolean) => void;
  setManualLocation: (lat: number, lon: number, city: string) => Promise<void>;
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
  locationError: null,
  retryLocation: async () => {},
  showLocationModal: false,
  setShowLocationModal: () => {},
  setManualLocation: async () => {},
});

export const useDisasterData = () => useContext(DisasterContext);

export const DisasterProvider = ({ children }: { children: React.ReactNode }) => {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [city, setCity] = useState('Detecting location...');
  const [data, setData] = useState<DisasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>('en');
  const [locationError, setLocationError] = useState<'PERMISSION_DENIED' | 'TECHNICAL_ERROR' | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

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

  const initData = async (forceDefault = false) => {
    setLoading(true);
    setLocationError(null);
    try {
      // 1. Get coords
      const locationInfo = await detectLocation();
      
      if (locationInfo.errorType && !forceDefault) {
        setLocationError(locationInfo.errorType);
        setShowLocationModal(true);
      }

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

  const retryLocation = async (useDefault = false) => {
    setLocationError(null);
    await initData(useDefault);
  };

  const setManualLocation = async (lat: number, lon: number, cityName: string) => {
    setLoading(true);
    const coords = { lat, lon };
    setCoords(coords);
    setCity(cityName);
    const disasterData = await fetchAllDisasterData(coords);
    setData(disasterData);
    setLocationError(null);
    setShowLocationModal(false);
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, []);

  return (
    <DisasterContext.Provider value={{ 
      coords, city, data, loading, refreshData: initData, language, setLanguage, t,
      locationError, retryLocation, showLocationModal, setShowLocationModal, setManualLocation
    }}>
      {children}
    </DisasterContext.Provider>
  );
};
