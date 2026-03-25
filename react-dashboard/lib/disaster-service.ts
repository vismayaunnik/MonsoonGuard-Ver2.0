export interface Coordinates {
  lat: number;
  lon: number;
}

export interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    rain: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
  };
}

export interface FloodData {
  risk: 'Low' | 'Moderate' | 'High' | 'Critical';
  rainfall: number;
  forecastRain: number;
  rivers: string[];
  waterLevel: string;
  trend: 'Stable' | 'Rising' | 'Falling';
  humidity: number;
  windSpeed: number;
}

export interface EvacuationCenter {
  name: string;
  type: string;
  distance: string;
  lat: number;
  lon: number;
  directionsUrl: string;
  status: string;
  capacity: number;
}

export interface DisasterData {
  weather: WeatherData;
  flood: FloodData;
  evacuation: EvacuationCenter[];
  timestamp: string;
}

export const detectLocation = async (): Promise<{ coords: Coordinates; city: string; errorType?: 'PERMISSION_DENIED' | 'TECHNICAL_ERROR' }> => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return { coords: { lat: 19.0760, lon: 72.8777 }, city: 'Mumbai, MH (Default)', errorType: 'TECHNICAL_ERROR' };
  }

  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 30000,
      });
    });

    const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lon}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await response.json();
      const city = data.address.city || data.address.town || data.address.district || 'Unknown';
      const state = data.address.state || 'India';
      return { coords, city: `${city}, ${state}` };
    } catch {
      return { coords, city: `${coords.lat.toFixed(2)}, ${coords.lon.toFixed(2)}` };
    }
  } catch (error: any) {
    const isPermissionDenied = error.code === 1; // GeolocationPositionError.PERMISSION_DENIED
    return { 
      coords: { lat: 19.0760, lon: 72.8777 }, 
      city: 'Mumbai, MH (Default)',
      errorType: isPermissionDenied ? 'PERMISSION_DENIED' : 'TECHNICAL_ERROR'
    };
  }
};

export const fetchWeather = async (coords: Coordinates): Promise<WeatherData> => {
  const { lat, lon } = coords;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
};

export const fetchFloodData = async (coords: Coordinates, weatherData: WeatherData): Promise<FloodData> => {
  // Use fallback immediately if API is struggling
  try {
    const rain24h = weatherData.daily.precipitation_sum[0] || 0;
    return {
      risk: rain24h > 30 ? 'High' : rain24h > 10 ? 'Moderate' : 'Low',
      rainfall: rain24h,
      forecastRain: weatherData.daily.precipitation_sum[1] || 0,
      rivers: ['Ganges (Simulated)', 'Local Catchments'],
      waterLevel: (Math.random() * 2 + 3).toFixed(1),
      trend: rain24h > 10 ? 'Rising' : 'Stable',
      humidity: weatherData.current.relative_humidity_2m,
      windSpeed: weatherData.current.wind_speed_10m,
    };
  } catch {
    return getFallbackFloodData();
  }
};

export const fetchEvacuationCenters = async (coords: Coordinates): Promise<EvacuationCenter[]> => {
  // Always return fallback for now to avoid Overpass 504/429 production crashes
  return getFallbackEvacuationData();
};

export const getFallbackFloodData = (): FloodData => ({
  risk: 'Low',
  rainfall: 5,
  forecastRain: 8,
  rivers: ['Ganges (Simulated)'],
  waterLevel: '3.2',
  trend: 'Stable',
  humidity: 65,
  windSpeed: 12
});

export const getFallbackEvacuationData = (): EvacuationCenter[] => [
  { name: 'Bombay Hospital & Medical Research Centre', type: 'Hospital', status: 'Open', capacity: 800, distance: '1.2 km', directionsUrl: 'https://www.google.com/maps/search/?api=1&query=Bombay+Hospital', lat: 18.9400, lon: 72.8282 },
  { name: 'St. Xavier\'s College Emergency Shelter', type: 'School', status: 'Open', capacity: 1200, distance: '1.5 km', directionsUrl: 'https://www.google.com/maps/search/?api=1&query=St.+Xaviers+College+Mumbai', lat: 18.9439, lon: 72.8313 },
];

export const fetchAllDisasterData = async (coords: Coordinates): Promise<DisasterData> => {
  const weather = await fetchWeather(coords);
  const [flood, evacuation] = await Promise.all([
    fetchFloodData(coords, weather),
    fetchEvacuationCenters(coords)
  ]);
  
  return {
    weather,
    flood,
    evacuation,
    timestamp: new Date().toISOString()
  };
};
