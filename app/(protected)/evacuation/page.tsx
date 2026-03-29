"use client";

import React, { useMemo, useState } from 'react';
import { useDisasterData } from '@/components/providers/DisasterProvider';
import { ArrowLeft, Loader2, Navigation, MapPin, Users, Target, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import the Leaflet map with SSR disabled. moved outside for correctness
const EvacuationMap = dynamic(() => import('@/components/ui/evacuation-map'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[550px] bg-[#0a1228] border border-blue-900/40 rounded-2xl flex flex-col items-center justify-center text-blue-400">
      <Loader2 className="animate-spin mb-4" size={32} />
      <p>Preparing emergency map...</p>
    </div>
  )
});

export default function EvacuationPage() {
  const { data, coords, loading, t, refreshData } = useDisasterData();
  const router = useRouter();
  const toggleFilter = (filter: string) => {
    setActiveFilters((prev: string[]) => 
      prev.includes(filter) ? prev.filter((f: string) => f !== filter) : [...prev, filter]
    );
  };

  const centers = useMemo(() => {
    if (!data?.evacuation) return [];
    let filtered = data.evacuation;
    if (activeFilters.length > 0) {
      filtered = filtered.filter((center: any) => 
        activeFilters.some((filter: string) => center.type.toLowerCase().includes(filter.toLowerCase()))
      );
    }
    return filtered;
  }, [data?.evacuation, activeFilters]);

  // Safest 3 (assuming already sorted by priority/distance in service)
  const topSafest = useMemo(() => centers.slice(0, 3), [centers]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="text-blue-400 flex flex-col items-center gap-4">
          <Loader2 className="animate-spin" size={48} />
          <p>{t('loading-centers')}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="text-red-400 bg-red-500/10 border border-red-500/30 p-8 rounded-2xl max-w-md text-center">
          <AlertTriangle className="mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">Service Unavailable</h2>
          <p className="text-sm opacity-80 mb-6">We encountered an error while fetching emergency data. Please check your connection and try again.</p>
          <button 
            onClick={() => refreshData()}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-bold transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-[#050d1f] border border-blue-900/40 text-[#f8fafc] hover:bg-blue-900/40 p-2.5 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[#f8fafc]">{t('evacuation-centers')}</h2>
            <p className="text-sm text-[#94a3b8]">{t('nearby-centers-desc') || 'Safe Zones & Emergency Shelters'}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {['Hospital', 'School', 'Worship'].map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter.toLowerCase())}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                activeFilters.includes(filter.toLowerCase())
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40'
                  : 'bg-[#0a1228] border-blue-900/40 text-blue-400 hover:border-blue-700'
              }`}
            >
              {filter}s
            </button>
          ))}
        </div>
      </div>

      {/* Flood Risk Banner if High */}
      {data.flood.risk === 'High' || data.flood.risk === 'Critical' ? (
        <div className="bg-red-500/10 border border-red-500/40 p-4 rounded-xl flex items-center gap-3 text-red-400">
          <div className="bg-red-500 p-2 rounded-lg">
            <Loader2 className="animate-pulse" size={20} />
          </div>
          <div>
            <p className="font-bold">High Flood Risk Detected</p>
            <p className="text-sm opacity-80">Immediate evacuation may be necessary in low-lying areas.</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        
        {/* Map Card */}
        <div className="min-h-[550px] relative rounded-2xl z-0 border border-blue-900/40 shadow-2xl">
          <EvacuationMap centers={centers} userCoords={coords} selectedCoords={selectedCoords} />
        </div>

        {/* Centers List */}
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-[#f8fafc]">{t('nearby-centers')}</h3>
            <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${centers.length > 5 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {centers.length} {t('centers-found') || 'FOUND'}
            </span>
          </div>
          
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[550px] pr-2 custom-scrollbar">
            {centers.length === 0 ? (
              <div className="bg-[#0a1228] p-6 rounded-xl text-center text-[#94a3b8] border border-blue-900/40 shadow-xl">
                {t('no-centers')}
              </div>
            ) : (
              centers.map((center, index) => {
                const isSafest = topSafest.includes(center);
                return (
                  <div 
                    key={index} 
                    className={`bg-[#0a1228] border ${isSafest ? 'border-blue-500/50 shadow-blue-900/20' : 'border-blue-900/40'} p-5 rounded-xl shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {isSafest && (
                      <div className="absolute top-0 right-0 bg-blue-600 text-[8px] font-black text-white px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                        Safest Priority
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-3 pb-3 border-b border-white/10">
                      <div className="font-bold text-[#f8fafc] leading-tight pr-4">{center.name || 'Emergency Center'}</div>
                      <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded shrink-0 uppercase">{t('status-open') || 'OPEN'}</span>
                    </div>
                    
                    <div className="flex gap-4 text-sm text-[#94a3b8] mb-4">
                      <span className="flex items-center gap-1.5 text-blue-400 font-medium"><Navigation size={14} /> {center.distance}</span>
                      <span className="flex items-center gap-1.5"><Users size={14} /> {center.capacity || 200} {t('capacity-label')}</span>
                    </div>

                    <div className="text-[10px] text-[#64748b] mb-4 flex gap-2">
                       <span className="bg-white/5 px-2 py-0.5 rounded italic">{center.type}</span>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <a 
                        href={center.directionsUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold transition-colors shadow-lg shadow-blue-900/20 text-sm"
                      >
                        <MapPin size={16} /> {t('get-directions')}
                      </a>
                      <button 
                        onClick={() => {
                          if (center.lat && center.lon) {
                            setSelectedCoords([center.lat, center.lon]);
                          }
                        }}
                        className="w-full bg-transparent border border-blue-900 text-blue-400 hover:bg-blue-900/30 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors text-sm"
                      >
                        <Target size={16} /> {t('locate-on-map')}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
