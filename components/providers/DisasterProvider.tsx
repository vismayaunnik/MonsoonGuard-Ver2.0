"use client";

import React, { createContext, useContext, useState } from 'react';
import { translations, Language } from '@/lib/translations';

const MOCK_DATA = {
  weather: {
    current: { temperature_2m: 28, relative_humidity_2m: 75, apparent_temperature: 31, precipitation: 0, rain: 0, weather_code: 1, wind_speed_10m: 12 },
    daily: { time: ['2026-03-25'], weather_code: [1], temperature_2m_max: [31], temperature_2m_min: [25], precipitation_sum: [5] }
  },
  flood: { risk: 'Low' as const, rainfall: 5, forecastRain: 8, rivers: ['Ganges (Simulated)'], waterLevel: '3.2', trend: 'Stable' as const, humidity: 75, windSpeed: 12 },
  evacuation: [
    { name: 'Bombay Hospital Emergency Shelter', type: 'Medical Shelter', distance: '1.2 km', lat: 18.9412, lon: 72.8285, directionsUrl: '#', status: 'Open', capacity: 500 },
    { name: 'St. Xavier\'s College Safety Zone', type: 'Community Shelter', distance: '2.5 km', lat: 18.9443, lon: 72.8322, directionsUrl: '#', status: 'Open', capacity: 800 }
  ],
  timestamp: new Date().toISOString()
};

const DisasterContext = createContext<any>(null);

export const useDisasterData = () => {
  const context = useContext(DisasterContext);
  if (!context) throw new Error("useDisasterData must be used within a DisasterProvider");
  return context;
};

export const DisasterProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const t = (key: string): string => translations[language][key] || translations['en'][key] || key;

  return (
    <DisasterContext.Provider value={{ 
      coords: { lat: 19.0760, lon: 72.8777 },
      city: 'Mumbai, MH',
      data: MOCK_DATA,
      loading: false,
      refreshData: async () => {},
      language,
      setLanguage,
      t,
      locationError: null,
      retryLocation: async () => {},
      showLocationModal: false,
      setShowLocationModal: () => {},
      setManualLocation: async () => {}
    }}>
      {children}
    </DisasterContext.Provider>
  );
};
