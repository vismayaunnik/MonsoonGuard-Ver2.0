"use client";

import React from 'react';
import { useDisasterData } from '@/components/providers/DisasterProvider';
import { ArrowLeft, Loader2, Waves, Droplets, CloudRain } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MonitoringPage() {
  const { data, loading, t } = useDisasterData();
  const router = useRouter();

  if (loading || !data) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="text-blue-400 flex flex-col items-center gap-4">
          <Loader2 className="animate-spin" size={48} />
          <p>{t('detecting-location') || 'Loading Monitoring Data...'}</p>
        </div>
      </div>
    );
  }

  const flood = data.flood;
  const level = parseFloat(flood.waterLevel);
  const saturation = flood.humidity || Math.floor(Math.random() * 40) + 30;

  const getTrendColor = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'rising': return 'text-red-400 bg-red-500/20';
      case 'falling': return 'text-green-400 bg-green-500/20';
      default: return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">

      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-[#050d1f] border border-blue-900/40 text-[#f8fafc] hover:bg-blue-900/40 p-2.5 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[#f8fafc]">{t('flood-monitoring')}</h2>
          <p className="text-sm text-[#94a3b8]">Real-time River Status & Risk Indicators</p>
        </div>
      </div>

      <div className="bg-[#0a1228] border-t-4 border-t-blue-500 rounded-xl p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-[#f8fafc] mb-6">{t('current-status')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-[#050d1f] p-5 rounded-xl border border-blue-900/40 shadow-inner">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-[#94a3b8] uppercase font-bold tracking-wider">{t('water-level')}</p>
              <Waves size={16} className="text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-4">{level}m</div>
            <div className="h-1.5 bg-blue-900/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-1000"
                style={{ width: `${Math.min((level / 10) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-[#050d1f] p-5 rounded-xl border border-blue-900/40 shadow-inner">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-[#94a3b8] uppercase font-bold tracking-wider">{t('rainfall-24h')}</p>
              <CloudRain size={16} className="text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400">{flood.rainfall}mm</div>
          </div>

          <div className="bg-[#050d1f] p-5 rounded-xl border border-blue-900/40 shadow-inner">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-[#94a3b8] uppercase font-bold tracking-wider">{t('soil-saturation')}</p>
              <Droplets size={16} className="text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-4">{saturation}%</div>
            <div className="h-1.5 bg-blue-900/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 transition-all duration-1000"
                style={{ width: `${saturation}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-[#f8fafc] mb-4">{t('river-stations')}</h3>
        <div className="flex flex-col gap-4">
          {flood.rivers.map((river, idx) => (
            <div key={idx} className="bg-[#0a1228] border border-blue-900/40 rounded-xl p-5 shadow-xl flex justify-between items-center hover:-translate-y-1 transition-transform">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Waves size={24} />
                </div>
                <div>
                  <div className="font-bold text-[#f8fafc] text-lg">
                    {river === 'Local Catchments' ? t('local-catchments') : river}
                  </div>
                  <div className="text-sm text-[#94a3b8]">{t('main-stream-channel')}</div>
                </div>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${getTrendColor(flood.trend)}`}>
                {t(flood.trend.toLowerCase())}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
