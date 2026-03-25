"use client";

import React from 'react';
import { useDisasterData } from '@/components/providers/DisasterProvider';
import { Droplet, Wind, CloudRain, AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AlertsPage() {
  const { data, loading, t, language } = useDisasterData();
  const router = useRouter();

  if (loading || !data) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="text-blue-400 flex flex-col items-center gap-4">
          <CloudRain className="animate-bounce" size={48} />
          <p>{t('detecting-location') || 'Loading Weather Data...'}</p>
        </div>
      </div>
    );
  }

  const getWeatherIcon = (code: number) => {
    if (code === 0) return '☀️';
    if (code < 3) return '⛅';
    if (code < 50) return '☁️';
    if (code < 60) return '🌦️';
    if (code < 70) return '🌧️';
    if (code < 80) return '❄️';
    return '⛈️';
  };

  const risk = data.flood.risk;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => router.push('/dashboard')}
          className="bg-[#050d1f] border border-blue-900/40 text-[#f8fafc] hover:bg-blue-900/40 p-2.5 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[#f8fafc]">{t('weather-alerts')}</h2>
          <p className="text-sm text-[#94a3b8]">{t('alert-details') || 'Current Forecast & Detailed Metrics'}</p>
        </div>
      </div>

      <div className="flex justify-between items-center bg-[#0a1228] p-6 rounded-xl border border-blue-900/40 shadow-xl">
        <div className="flex items-center gap-2 text-blue-400">
          <AlertCircle size={24} />
          <span className="font-semibold text-lg max-w-xs text-white">
            {data.weather.current.precipitation > 0 ? t('rain') : t('clear-sky')}
          </span>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-blue-400">{Math.round(data.weather.current.temperature_2m)}°C</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-[#0a1228] border border-blue-900/40 rounded-xl p-6 text-center shadow-xl hover:-translate-y-1 transition-transform">
          <Droplet className="mx-auto mb-3 text-blue-300" size={28} />
          <div className="text-2xl font-bold text-[#f8fafc]">{data.weather.current.relative_humidity_2m}%</div>
          <div className="text-xs text-[#94a3b8] mt-1 uppercase">{t('humidity')}</div>
        </div>
        
        <div className="bg-[#0a1228] border border-blue-900/40 rounded-xl p-6 text-center shadow-xl hover:-translate-y-1 transition-transform">
          <Wind className="mx-auto mb-3 text-yellow-500" size={28} />
          <div className="text-2xl font-bold text-[#f8fafc]">{data.weather.current.wind_speed_10m}km/h</div>
          <div className="text-xs text-[#94a3b8] mt-1 uppercase">{t('wind-speed')}</div>
        </div>

        <div className="bg-[#0a1228] border border-blue-900/40 rounded-xl p-6 text-center shadow-xl hover:-translate-y-1 transition-transform">
          <CloudRain className="mx-auto mb-3 text-blue-500" size={28} />
          <div className="text-2xl font-bold text-[#f8fafc]">{data.flood.rainfall || 0}mm</div>
          <div className="text-xs text-[#94a3b8] mt-1 uppercase">{t('rainfall')}</div>
        </div>

        <div className="bg-[#0a1228] border border-blue-900/40 rounded-xl p-6 text-center shadow-xl hover:-translate-y-1 transition-transform">
          <AlertCircle className="mx-auto mb-3 text-red-500" size={28} />
          <div className={`text-xl font-bold ${risk === 'Critical' || risk === 'High' ? 'text-red-500' : risk === 'Moderate' ? 'text-yellow-500' : 'text-green-500'}`}>
            {t(risk.toLowerCase() + '-risk') || risk}
          </div>
          <div className="text-xs text-[#94a3b8] mt-1 uppercase">{t('flood-risk-level')}</div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-[#f8fafc] mb-6 inline-block border-b-2 border-blue-500 pb-2">{t('forecast-6-day')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {data.weather.daily.time.slice(1, 7).map((time, i) => {
            const day = new Date(time).toLocaleDateString(language, { weekday: 'short' });
            return (
              <div key={time} className="bg-[#0a1228] border border-blue-900/40 rounded-xl p-4 text-center shadow-lg hover:shadow-blue-900/20 transition-all hover:-translate-y-1">
                <div className="font-bold text-[#f8fafc] mb-2 capitalize">{day}</div>
                <div className="text-4xl mb-3 drop-shadow-md">{getWeatherIcon(data.weather.daily.weather_code[i+1])}</div>
                <div className="font-bold text-blue-400 text-lg">{Math.round(data.weather.daily.temperature_2m_max[i+1])}°C</div>
                <div className="text-sm text-[#94a3b8]">{Math.round(data.weather.daily.temperature_2m_min[i+1])}°C</div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
