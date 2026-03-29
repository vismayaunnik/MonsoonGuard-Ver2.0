"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, RefreshCw, Search, X, AlertTriangle } from 'lucide-react';
import { useDisasterData } from '@/components/providers/DisasterProvider';
import { useState } from 'react';
import { searchCity } from '@/lib/disaster-service';

export const LocationModal = () => {
  const { locationError, retryLocation, loading, city, showLocationModal, setShowLocationModal, setManualLocation, t } = useDisasterData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(false);
    try {
      const result = await searchCity(searchQuery);
      if (result) {
        await setManualLocation(result.coords.lat, result.coords.lon, result.city);
        setShowLocationModal(false);
      } else {
        setSearchError(true);
      }
    } catch (err) {
      console.error(err);
      setSearchError(true);
    } finally {
      setIsSearching(false);
    }
  };

  if (!showLocationModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/20 blur-[60px] pointer-events-none" />

          {/* Close Button */}
          <button 
            onClick={() => setShowLocationModal(false)}
            className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
              <MapPin className="w-10 h-10 text-blue-400 animate-pulse" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              {t('location-refused-title') || 'Location Access Required'}
            </h2>
            
            <p className="text-zinc-400 mb-8 leading-relaxed">
              {t('location-refused-msg') || (locationError === 'PERMISSION_DENIED' 
                ? "It looks like location access was denied. For accurate real-time disaster monitoring and evacuation center discovery, please enable GPS in your browser settings."
                : "We're having trouble pinpointing your exact location. Please ensure your device's location services are turned on.")}
            </p>

            <div className="space-y-4">
              <button 
                onClick={() => retryLocation(false)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white py-4 px-6 rounded-2xl font-bold transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/25"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? (t('detecting') || 'Detecting...') : (t('retry-detection') || 'Retry Detection')}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-zinc-900 px-3 text-zinc-500 font-medium tracking-widest">{t('or-enter-city') || 'Or enter city'}</span>
                </div>
              </div>

              {searchError && (
                <p className="text-red-400 text-xs mb-2 text-left px-4 italic">
                  {t('invalid-city-error') || 'Invalid city or not in India. Please try again.'}
                </p>
              )}

              <form onSubmit={handleSearch} className="relative group">
                <input
                  type="text"
                  placeholder={t('city-placeholder') || "e.g. Mumbai, Kochi..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full bg-zinc-800/50 border ${searchError ? 'border-red-500/50' : 'border-zinc-700/50'} focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 rounded-2xl py-4 pl-12 pr-6 text-zinc-200 placeholder:text-zinc-600 transition-all outline-none`}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-blue-400 transition-colors" />
                <button 
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-zinc-700 hover:bg-blue-600 disabled:bg-transparent text-white p-2 rounded-xl transition-all"
                >
                  {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </form>

              <button 
                onClick={() => retryLocation(true)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 py-3 px-6 rounded-2xl font-medium transition-all"
              >
                {t('use-default-location') || 'Use Default (Mumbai, MH)'}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-800/50 flex items-center justify-center gap-2 text-xs text-zinc-500">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span>Current fallback: {city}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
