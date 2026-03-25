"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EvacuationCenter, Coordinates } from '@/lib/disaster-service';

// Custom icons to avoid Leaflet marker bug in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapUpdater = ({ coords, selectedCoords }: { coords: Coordinates | null, selectedCoords: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedCoords) {
      map.flyTo(selectedCoords, 16, { duration: 1.5 });
    } else if (coords) {
      map.setView([coords.lat, coords.lon], 13);
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
  const defaultCenter = [19.0760, 72.8777] as [number, number];
  const center = userCoords ? [userCoords.lat, userCoords.lon] as [number, number] : defaultCenter;

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

        {centers.map((c, i) => (
          c.lat && c.lon && (
            <Marker key={i} position={[c.lat, c.lon]} icon={customIcon}>
              <Popup>
                <strong>{c.name}</strong><br/>
                {c.type}<br/>
                {c.capacity} capacity<br/>
                <a 
                  href={c.directionsUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-2 inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs no-underline"
                >
                  Get Directions
                </a>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
