"use client";

import React, { useState, useEffect } from 'react';
import { useDisasterData } from '@/components/providers/DisasterProvider';
import { Map, Download, ArrowLeft, RefreshCw, Trash2, HardDrive } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OfflineMapsPage() {
  const { coords, t } = useDisasterData();
  const router = useRouter();

  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);

  useEffect(() => {
    const isDownloaded = localStorage.getItem('mapsDownloaded') === 'true';
    if (isDownloaded) {
      setDownloadState('complete');
      setStorageUsed(parseFloat(localStorage.getItem('mapStorageUsed') || '0'));
    }
  }, []);

  const handleDownload = () => {
    if (!coords) {
      alert("Please wait for location detection...");
      return;
    }

    setDownloadState('downloading');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 8;
        if (next >= 100) {
          clearInterval(interval);
          completeDownload();
          return 100;
        }
        return next;
      });
    }, 200);
  };

  const completeDownload = () => {
    setTimeout(() => {
      const simulatedSize = (400 * 0.05).toFixed(1); // 400 tiles * 50kb
      localStorage.setItem('mapsDownloaded', 'true');
      localStorage.setItem('mapStorageUsed', simulatedSize);
      setStorageUsed(parseFloat(simulatedSize));
      setDownloadState('complete');
    }, 500);
  };

  const handleDelete = () => {
    if (confirm(t('delete') + " ?")) {
      localStorage.removeItem('mapsDownloaded');
      localStorage.removeItem('mapStorageUsed');
      setDownloadState('idle');
      setStorageUsed(0);
      setProgress(0);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => router.push('/dashboard')}
          className="bg-[#050d1f] border border-blue-900/40 text-[#f8fafc] hover:bg-blue-900/40 p-2.5 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[#f8fafc]">{t('offline-maps')}</h2>
          <p className="text-sm text-[#94a3b8]">{t('offline-maps-info')}</p>
        </div>
      </div>

        <div className="bg-red-500 text-white text-center py-3 font-bold shadow-lg shadow-red-500/20 w-full mb-8">
          {t('safe') ? t('safe').replace('Safe', 'Offline Mode Available') : 'Offline Mode Available'} {/* Fallback hack */}
        </div>

      {/* Storage Indicator */}
      <div className="bg-[#0a1228] border border-blue-900/40 rounded-xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
            <HardDrive size={24} />
          </div>
          <div>
            <h3 className="font-bold text-[#f8fafc]">Device Storage</h3>
            <p className="text-sm text-[#94a3b8]">Local Cache Status</p>
          </div>
        </div>
        
        <div className="w-full sm:w-64">
          <div className="flex justify-between text-xs text-[#94a3b8] mb-2 font-medium">
            <span>{t('storage-used')}</span>
            <span className={storageUsed > 40 ? 'text-red-400' : 'text-[#f8fafc]'}>
              {storageUsed} MB / 50 MB
            </span>
          </div>
          <div className="h-2 w-full bg-blue-900/50 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${storageUsed > 40 ? 'bg-red-500' : 'bg-blue-500'}`} 
              style={{ width: `${Math.min((storageUsed / 50) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-900/10 border-l-4 border-blue-500 p-6 rounded-r-xl shadow-inner">
        <p className="text-[#e2e8f0] leading-relaxed">
          {t('offline-download-desc') || "Download map tiles for a 10km radius around your current location for offline emergency use. (Max 50MB storage limit)"}
        </p>
      </div>

      <h3 className="text-xl font-bold mt-8 mb-4">{t('available-packages')}</h3>

      {/* Download Card */}
      <div className="bg-[#0a1228] border border-blue-900/40 rounded-xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 shrink-0">
            <Map size={28} />
          </div>
          <div>
            <h4 className="font-bold text-lg text-[#f8fafc]">{t('current-region-map')}</h4>
            <p className="text-sm text-[#94a3b8] mt-1">{t('radius-tiles-info')}</p>
          </div>
        </div>

        <div className="w-full md:w-auto md:min-w-[250px] flex justify-end">
          
          {downloadState === 'idle' && (
            <button 
              onClick={handleDownload}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all shadow-lg hover:shadow-blue-600/20"
            >
              <Download size={18} /> Download Maps
            </button>
          )}

          {downloadState === 'downloading' && (
            <div className="w-full">
              <div className="flex justify-between text-xs text-blue-400 mb-2 font-medium">
                <span>{t('downloading-tiles')}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full bg-blue-900/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-200" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {downloadState === 'complete' && (
            <div className="flex flex-col items-end w-full">
              <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block tracking-wide">
                {t('saved-offline')}
              </span>
              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={handleDownload}
                  className="flex-1 md:flex-none border border-blue-900 hover:bg-blue-900/30 text-blue-400 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                >
                  <RefreshCw size={14} /> {t('update')}
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 md:flex-none border border-red-900/50 hover:bg-red-500/10 text-red-500 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                >
                  <Trash2 size={14} /> {t('delete')}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
