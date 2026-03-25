"use client";

import React, { useEffect, useState } from 'react';
import { LogOut, MapPin } from 'lucide-react';
import { useDisasterData } from '@/components/providers/DisasterProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Language } from '@/lib/translations';

export const AppHeader = () => {
  const router = useRouter();
  const { language, setLanguage, t, setShowLocationModal } = useDisasterData();
  
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  return (
    <header className="flex justify-between items-center p-5 bg-[#0a1228cc] backdrop-blur-md sticky top-0 z-50 border-b border-blue-900/30">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center shrink-0">
          <Image src="/logo.png" alt="MonsoonGuard Logo" width={40} height={40} className="object-contain" />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-[#f8fafc] m-0 text-3xl font-black tracking-tighter">MonsoonGuard</h1>
        </div>
      </div>
      
      <div className="flex gap-4 items-center">
        <select 
          className="bg-[#050d1f] text-[#f8fafc] border border-white/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="bn">বাংলা</option>
          <option value="ml">മലയാളം</option>
          <option value="te">తెలుగు</option>
        </select>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-md hover:bg-red-500 hover:text-white transition-colors text-sm font-medium"
        >
          <LogOut size={16} /> <span>{t('logout')}</span>
        </button>

        <button 
          onClick={() => setShowLocationModal(true)}
          className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md hover:bg-blue-500/20 transition-colors"
          title="Location Settings"
        >
          <MapPin size={20} />
        </button>
      </div>
    </header>
  );
};

export const UserPanel = () => {
  const { city, data, t } = useDisasterData();
  const [userName, setUserName] = useState("Guest");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.userName) setUserName(user.userName);
  }, []);

  return (
    <div className="flex justify-between items-center p-5 bg-[#0a1228] border-b border-blue-900/30">
      <div className="flex flex-col">
        <h2 className="text-[#f8fafc] m-0 text-lg font-semibold">{t('welcome-user')} {userName}</h2>
        <div className="flex items-center gap-1.5 text-blue-400 text-sm mt-1">
          <MapPin size={16} />
          <span>{t('location-prefix')} {city}</span>
        </div>
      </div>
      
      <div className="text-right flex flex-col items-end">
        <p className="text-[#94a3b8] m-0 text-xs">
          {t('last-updated')}: <span className="text-[#f8fafc] font-medium ml-1">
            {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'Loading...'}
          </span>
        </p>
      </div>
    </div>
  );
};

export const CursorBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 transition duration-300"
      style={{
        // A deeper, pronounced blue glow 
        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(37, 99, 235, 0.15), transparent 80%)`,
      }}
    />
  );
};
