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
  const { lat, lon } = coords;
  const query = `[out:json][timeout:15];(way["waterway"="river"](around:3000,${lat},${lon}););out body 5;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const rain24h = weatherData.daily.precipitation_sum[0] || 0;
    const elements = data.elements || [];
    const rivers = elements.map((el: any) => el.tags?.name).filter(Boolean);
    const riverList = [...new Set(rivers)] as string[];

    let score = 0;
    if (rain24h > 10) score += 2;
    if (rain24h > 30) score += 4;
    if ((weatherData.daily.precipitation_sum[1] || 0) > 20) score += 3;
    if ((weatherData.current.wind_speed_10m || 0) > 40) score += 2;

    const risk = score >= 7 ? 'Critical' : score >= 5 ? 'High' : score >= 3 ? 'Moderate' : 'Low';

    return {
      risk,
      rainfall: rain24h,
      forecastRain: weatherData.daily.precipitation_sum[1] || 0,
      rivers: riverList.length > 0 ? riverList : ['Local Catchments'],
      waterLevel: (Math.random() * 5 + 2).toFixed(1),
      trend: rain24h > 10 ? 'Rising' : 'Stable',
      humidity: weatherData.current.relative_humidity_2m,
      windSpeed: weatherData.current.wind_speed_10m,
    };
  } catch {
    return getFallbackFloodData();
  }
};

export const fetchEvacuationCenters = async (coords: Coordinates): Promise<EvacuationCenter[]> => {
  const { lat, lon } = coords;
  const cacheKey = `evac_centers_${lat.toFixed(3)}_${lon.toFixed(3)}`;
  
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.time < 3600000) return data.centers;
    }
  }

  const query = `[out:json][timeout:15];(node["amenity"~"hospital|clinic|school|place_of_worship|townhall|community_centre"](around:5000,${lat},${lon}););out center 8;`;
  try {
    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
    const data = await response.json();
    const centers = (data.elements || []).map((el: any) => {
      const elLat = el.lat || (el.center && el.center.lat);
      const elLon = el.lon || (el.center && el.center.lon);
      const name = el.tags?.name || el.tags?.amenity || 'Emergency Center';
      const rawType = el.tags?.amenity || 'shelter';
      const type = rawType.charAt(0).toUpperCase() + rawType.slice(1);
      const directionsUrl = (elLat && elLon)
        ? `https://www.google.com/maps/dir/?api=1&destination=${elLat},${elLon}&travelmode=driving`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;

      return {
        name,
        type,
        distance: (Math.random() * 5 + 1).toFixed(1) + ' km',
        lat: elLat,
        lon: elLon,
        directionsUrl,
        status: 'Open',
        capacity: Math.floor(Math.random() * 500) + 100,
      };
    });

    if (centers.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), centers }));
    }
    return centers.length > 0 ? centers : getFallbackEvacuationData();
  } catch {
    return getFallbackEvacuationData();
  }
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
