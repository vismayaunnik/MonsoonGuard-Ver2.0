"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EvacuationCenter, Coordinates } from '@/lib/disaster-service';

// Custom icon creation moved inside to avoid SSR crashes
// Custom icon creation based on type
const getIcon = (type: string) => {
  if (typeof window === 'undefined') return null;
  
  let color = 'blue';
  const t = type.toLowerCase();
  if (t.includes('hospital')) color = 'red';
  else if (t.includes('school')) color = 'orange';
  else if (t.includes('worship') || t.includes('mosque') || t.includes('temple') || t.includes('church')) color = 'green';

  // Using standard Leaflet icons with filter or custom URLs if available
  // For now, let's use a colored div icon for more flexibility
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

const MapUpdater = ({ coords, selectedCoords }: { coords: Coordinates | null, selectedCoords: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    try {
      if (selectedCoords && typeof selectedCoords[0] === 'number' && typeof selectedCoords[1] === 'number') {
        map.flyTo(selectedCoords, 16, { duration: 1.5 });
      } else if (coords && typeof coords.lat === 'number' && typeof coords.lon === 'number') {
        map.setView([coords.lat, coords.lon], 13);
      }
    } catch (err) {
      console.error("Leaflet map update error:", err);
    }
  }, [coords, selectedCoords, map]);
  return null;
};

interface EvacuationMapProps {
  centers: EvacuationCenter[];
  userCoords: Coordinates | null;
  selectedCoords?: [number, number] | null;
}

export default function EvacuationMap({ centers, userCoords, selectedCoords }: EvacuationMapProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const defaultCenter = [19.0760, 72.8777] as [number, number];
  const center = userCoords ? [userCoords.lat, userCoords.lon] as [number, number] : defaultCenter;

  if (!mounted || typeof window === 'undefined') {
    return (
      <div className="w-full h-full bg-[#0a1228] flex items-center justify-center text-blue-400">
        <p>Loading secure map...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl relative z-0">
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userCoords && (
          <>
            <CircleMarker 
              center={[userCoords.lat, userCoords.lon]} 
              radius={8} 
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.6 }}
            >
              <Popup>Your Location</Popup>
            </CircleMarker>
          </>
        )}
        <MapUpdater coords={userCoords} selectedCoords={selectedCoords || null} />

        {centers.map((c, i) => {
          const icon = getIcon(c.type);
          return c.lat && c.lon && icon && (
            <Marker key={i} position={[c.lat, c.lon]} icon={icon}>
              <Popup>
                <div className="text-[#0f172a] p-1">
                  <div className="font-bold border-b mb-1 pb-1">{c.name}</div>
                  <div className="text-xs mb-3">{c.distance} {t('from-your-location') || 'from your location'}</div>
                  <a 
                    href={c.directionsUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full block text-center bg-[#2563eb] hover:bg-blue-700 text-white !text-white px-2 py-2 rounded text-xs no-underline font-bold transition-colors shadow-sm"
                    style={{ color: 'white !important' }}
                  >
                    {t('get-directions')}
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
