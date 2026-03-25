"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';
import { useDisasterData } from '@/components/providers/DisasterProvider';

export const LocationModal = () => {
  const { locationError, retryLocation, loading, city, showLocationModal, setShowLocationModal } = useDisasterData();

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
            className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
          >
            <RefreshCw className="w-5 h-5 rotate-45" />
          </button>

          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
              <MapPin className="w-10 h-10 text-blue-400 animate-pulse" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              Location Access Required
            </h2>
            
            <p className="text-zinc-400 mb-8 leading-relaxed">
              {locationError === 'PERMISSION_DENIED' 
                ? "It looks like location access was denied. For accurate real-time disaster monitoring and evacuation center discovery, please enable GPS in your browser settings."
                : "We're having trouble pinpointing your exact location. Please ensure your device's location services are turned on."}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => retryLocation()}
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-900/20"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Navigation className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                )}
                <span>Retry Detection</span>
              </button>

              <button
                onClick={() => retryLocation(true)}
                disabled={loading}
                className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl font-medium transition-colors"
              >
                Use Default (Taliparamba, Kerala)
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
