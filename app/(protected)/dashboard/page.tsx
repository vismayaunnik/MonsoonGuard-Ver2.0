"use client";

import React from 'react';
import { useDisasterData } from '@/components/providers/DisasterProvider';
import { CloudLightning, Thermometer, Droplets, Home, Navigation, Map as MapIcon, PhoneCall, Download, Layers, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data, loading, t } = useDisasterData();

  if (loading || !data) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="text-blue-400 flex flex-col items-center gap-4">
          <Droplets className="animate-bounce" size={48} />
          <p>{t('detecting-location') || 'Loading Dashboard...'}</p>
        </div>
      </div>
    );
  }

  const risk = data.flood.risk;
  let riskColor = 'border-green-500';
  let riskTextClass = 'text-green-500';
  if (risk === 'High' || risk === 'Critical') {
    riskColor = 'border-red-500';
    riskTextClass = 'text-red-500';
  } else if (risk === 'Low') {
    riskColor = 'border-green-500';
    riskTextClass = 'text-green-400 bg-green-500/20';
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Flood Risk Status Hero Badge */}
      <div className={`bg-[#0a1228] border border-blue-900/40 border-l-8 ${riskColor} rounded-xl p-8 shadow-2xl`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="text-center md:border-r border-blue-900/40">
            <div className={`inline-block px-5 py-2 rounded-full text-sm font-bold mb-3 ${riskTextClass}`}>
              {t(risk.toLowerCase() + '-risk')}
            </div>
            <div className="text-sm text-[#94a3b8]">{t('flood-risk-level')}</div>
          </div>
          <div className="md:col-span-2 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-400">{data.flood.rainfall || 0}mm</div>
              <div className="text-[10px] sm:text-xs text-[#94a3b8] uppercase mt-1">{t('rainfall-24h')}</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-400">{data.flood.forecastRain || 0}mm</div>
              <div className="text-[10px] sm:text-xs text-[#94a3b8] uppercase mt-1">{t('forecast-rain')}</div>
            </div>
            <div>
              <div className={`text-2xl sm:text-3xl font-bold ${riskTextClass.split(' ')[0]}`}>
                {risk === 'Low' ? t('safe') : risk === 'Moderate' ? t('warning') : t('danger')}
              </div>
              <div className="text-[10px] sm:text-xs text-[#94a3b8] uppercase mt-1">{t('current-status')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Major Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Weather Alerts Card */}
        <div className="bg-[#0a1228] border border-blue-900/40 rounded-xl p-6 hover:-translate-y-1 transition-transform cursor-pointer group shadow-xl flex flex-col h-full">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CloudLightning size={24} />
          </div>
          <h3 className="text-lg font-bold text-[#f8fafc]">{t('weather-alerts')}</h3>
          <div className="relative overflow-hidden my-4 bg-[#050d1f]/60 rounded-lg h-[72px]">
            {/* Primary Details (Moves up on hover) */}
            <div className="absolute inset-0 p-3 border-l-2 border-blue-500 flex flex-col justify-center transition-transform duration-300 group-hover:-translate-y-full">
              <span className="text-xl font-bold block leading-none">{Math.round(data.weather.current.temperature_2m)}°C</span>
              <span className="text-xs text-[#94a3b8] mt-1">{data.weather.current.cloud_cover < 30 ? t('clear-sky') : t('rain')}</span>
            </div>
            {/* Secondary Details (Moves in from bottom on hover) */}
            <div className="absolute inset-0 p-3 border-l-2 border-green-500 flex flex-col justify-center translate-y-full transition-transform duration-300 group-hover:translate-y-0">
              <span className="text-xl font-bold block leading-none">{data.weather.current.wind_speed_10m}km/h</span>
              <span className="text-xs text-green-400 uppercase mt-1">{t('wind-speed')}</span>
            </div>
          </div>
          <Link 
            href="/alerts"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors mt-auto"
          >
            <Thermometer size={18} /> {t('check-forecast')}
          </Link>
        </div>

        {/* Flood Monitoring Card */}
        <div className="bg-[#0a1228] border border-blue-900/40 rounded-xl p-6 hover:-translate-y-1 transition-transform shadow-xl group flex flex-col h-full">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Droplets size={24} />
          </div>
          <h3 className="text-lg font-bold text-[#f8fafc]">{t('flood-monitoring')}</h3>
          <div className="my-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#94a3b8]">{t('water-level')}</span>
              <span className="text-[#f8fafc] font-medium">{data.flood.waterLevel}m</span>
            </div>
            <div className="h-2 bg-blue-900/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000" 
                style={{ width: `${Math.min((parseFloat(data.flood.waterLevel) / 10) * 100, 100)}%` }}
              />
            </div>
          </div>
          <Link href="/monitoring" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors mt-auto">
            <BarChart2 size={18} /> {t('view-details')}
          </Link>
        </div>

        {/* Evacuation Centers Card */}
        <div className="bg-[#0a1228] border border-blue-900/40 rounded-xl p-6 shadow-xl hover:-translate-y-1 transition-transform group cursor-pointer flex flex-col h-full">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MapIcon size={24} />
          </div>
          <h3 className="text-lg font-bold text-[#f8fafc]">{t('evacuation-centers')}</h3>
          <div className="my-5 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#f8fafc]">{data.evacuation.length}</span>
            <span className="text-sm font-medium text-[#94a3b8] uppercase tracking-wide">{t('available-centers')}</span>
          </div>
          <Link 
            href="/evacuation"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors mt-auto"
          >
            <MapIcon size={18} /> {t('locate-centers')}
          </Link>
        </div>

        {/* Emergency Helpline Card */}
        <div className="bg-blue-600 rounded-xl p-6 hover:-translate-y-1 transition-transform shadow-xl shadow-blue-900/20 group text-white">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <PhoneCall size={24} />
          </div>
          <h3 className="text-lg font-bold">{t('emergency-helpline')}</h3>
          <p className="text-3xl font-bold my-3">108</p>
          <button 
            onClick={() => window.location.href='tel:108'}
            className="w-full bg-[#0a1228] hover:bg-[#050d1f] text-white py-2.5 rounded-lg font-bold transition-colors mt-4"
          >
            {t('call-now')}
          </button>
        </div>

        {/* Offline Maps Card */}
        <div className="bg-[#0a1228] border border-blue-900/40 rounded-xl p-6 hover:-translate-y-1 transition-transform shadow-xl group sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Download size={24} />
          </div>
          <h3 className="text-lg font-bold text-[#f8fafc]">{t('offline-maps')}</h3>
          <p className="text-sm text-[#94a3b8] my-4 leading-relaxed">{t('offline-maps-info')}</p>
          <Link 
            href="/maps"
            className="w-full bg-transparent border border-blue-500 text-blue-400 hover:bg-blue-500/10 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors mt-[14px]"
          >
            <Layers size={18} /> {t('download-center')}
          </Link>
        </div>
      </div>

      {/* Regional Impact & Live Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
        
        {/* Live Alerts */}
        <div className="lg:col-span-3 bg-[#0a1228] border border-blue-900/40 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">{t('live-alerts')}</h3>
            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">{t('alert-feed-ready')}</span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {[
              { time: "5m ago", type: "success", text: t('alert-1') },
              { time: "15m ago", type: "warning", text: t('alert-2') },
              { time: "45m ago", type: "info", text: t('alert-3') }
            ].map((alert, i) => {
              let alertTypeClass = '';
              if (alert.type === 'success') {
                alertTypeClass = 'text-green-400 border-green-500/50';
              } else if (alert.type === 'warning') {
                alertTypeClass = 'text-yellow-400 border-yellow-500/50';
              } else if (alert.type === 'info') {
                alertTypeClass = 'text-blue-400 border-blue-500/50';
              }
              return (
                <div key={i} className={`flex gap-4 p-3 bg-[#050d1f]/50 rounded-lg border-l-2 ${alertTypeClass}`}>
                  <div className="text-xs text-[#94a3b8] min-w-[50px] pt-0.5">{alert.time}</div>
                  <div className="text-sm text-[#e2e8f0] leading-snug">{alert.text}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional Impact stats */}
        <div className="lg:col-span-2 bg-[#0a1228] border border-blue-900/40 rounded-xl p-6 shadow-xl">
          <h3 className="text-lg font-bold mb-6">{t('regional-impact')}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[#94a3b8] text-sm">{t('affected-pop')}</span>
              <span className="text-red-400 font-bold">~2,400</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#94a3b8] text-sm">{t('active-rescue')}</span>
              <span className="text-blue-400 font-bold">18 {t('units')}</span>
            </div>
            <div className="mt-4 p-3 bg-blue-900/10 rounded-lg border border-blue-900/20">
              <p className="text-xs text-[#94a3b8] leading-relaxed">{t('data-disclaimer')}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
