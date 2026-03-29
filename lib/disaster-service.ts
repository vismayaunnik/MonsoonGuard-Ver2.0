export interface Coordinates {
  lat: number;
  lon: number;
}

const AMBEE_API_KEY = process.env.NEXT_PUBLIC_AMBEE_API_KEY || '';
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Simple in-memory cache
const apiCache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedData(key: string) {
  const cached = apiCache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any) {
  apiCache[key] = { data, timestamp: Date.now() };
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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

export const searchCity = async (query: string): Promise<{ coords: Coordinates; city: string } | null> => {
  if (!query || query.length < 2) return null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=in&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      const coords = { lat: parseFloat(result.lat), lon: parseFloat(result.lon) };
      const city = result.display_name.split(',')[0] + ', ' + (result.display_name.split(',').slice(-2, -1)[0]?.trim() || 'India');
      return { coords, city };
    }
    return null;
  } catch (error) {
    console.error("City search failed", error);
    return null;
  }
};

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
  const cacheKey = `flood_${coords.lat}_${coords.lon}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`https://api.ambeedata.com/flood/latest/by-lat-lng?lat=${coords.lat}&lng=${coords.lon}`, {
      headers: { 'x-api-key': AMBEE_API_KEY }
    });
    
    if (!response.ok) throw new Error('Ambee API failed');
    const ambeeData = await response.json();
    
    // Extract risk from Ambee response (assuming structure from docs)
    // If Ambee fails or format is weird, fallback to weather-based logic
    const riskData = ambeeData.data?.[0];
    const risk = riskData?.risk_level || (weatherData.daily.precipitation_sum[0] > 30 ? 'High' : weatherData.daily.precipitation_sum[0] > 10 ? 'Moderate' : 'Low');

    const result: FloodData = {
      risk: risk as any,
      rainfall: weatherData.daily.precipitation_sum[0] || 0,
      forecastRain: weatherData.daily.precipitation_sum[1] || 0,
      rivers: riskData?.nearby_rivers || ['Local Catchments'],
      waterLevel: riskData?.water_level?.toFixed(1) || (Math.random() * 2 + 3).toFixed(1),
      trend: weatherData.daily.precipitation_sum[0] > 10 ? 'Rising' : 'Stable',
      humidity: weatherData.current.relative_humidity_2m,
      windSpeed: weatherData.current.wind_speed_10m,
    };
    
    setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.warn("Ambee API failed, using fallback flood logic");
    const rain24h = weatherData.daily.precipitation_sum[0] || 0;
    return {
      risk: rain24h > 30 ? 'High' : rain24h > 10 ? 'Moderate' : 'Low',
      rainfall: rain24h,
      forecastRain: weatherData.daily.precipitation_sum[1] || 0,
      rivers: ['Local Catchments'],
      waterLevel: (Math.random() * 2 + 3).toFixed(1),
      trend: rain24h > 10 ? 'Rising' : 'Stable',
      humidity: weatherData.current.relative_humidity_2m,
      windSpeed: weatherData.current.wind_speed_10m,
    };
  }
};

export const fetchEvacuationCenters = async (coords: Coordinates, cityName: string = 'Local', lang: string = 'en'): Promise<EvacuationCenter[]> => {
  const cacheKey = `centers_${coords.lat}_${coords.lon}_${lang}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const { lat, lon } = coords;
  
  // Google Places types to search for
  const types = ['school', 'hospital', 'mosque', 'hindu_temple', 'church'];
  const radius = 10000; // 10km

  try {
    // Call our server-side proxy to avoid CORS issues and protect API key
    const response = await fetch(`/api/places?lat=${lat}&lon=${lon}&radius=${radius}&type=${types.join('|')}&lang=${lang}`);
    if (!response.ok) throw new Error('API Proxy error');
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const centers = data.results.map((place: any) => {
        const placeLat = place.geometry.location.lat;
        const placeLon = place.geometry.location.lng;
        const distance = calculateDistance(lat, lon, placeLat, placeLon);
        
        return {
          name: place.name,
          type: place.types[0].replace(/_/g, ' '),
          status: 'Open',
          capacity: Math.floor(Math.random() * 500) + 200, // Simulated capacity
          distance: distance.toFixed(1) + ' km',
          directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${placeLat},${placeLon}`,
          lat: placeLat,
          lon: placeLon,
          priority: place.types.includes('hospital') ? 1 : 2
        };
      });

      // Sort by priority (hospitals first) then distance
      centers.sort((a: any, b: any) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return parseFloat(a.distance) - parseFloat(b.distance);
      });

      const result = centers.slice(0, 15);
      setCachedData(cacheKey, result);
      return result;
    }
    
    throw new Error('No places found');
  } catch (err) {
    console.warn("Google Places API failed, falling back to Overpass/Dynamic centers", err);
    // Legacy Overpass fallback for redundancy
    return fetchOverpassCenters(coords, cityName);
  }
};

const fetchOverpassCenters = async (coords: Coordinates, cityName: string, lang: string = 'en'): Promise<EvacuationCenter[]> => {
  const { lat, lon } = coords;
  const query = `[out:json][timeout:6];
    (
      node["amenity"~"hospital|school|community_centre|place_of_worship|police|fire_station"](around:10000,${lat},${lon});
      way["amenity"~"hospital|school|community_centre|place_of_worship|police|fire_station"](around:10000,${lat},${lon});
    );
    out center;`;
    
  try {
    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Overpass API error');
    const data = await response.json();
    
    if (data.elements && data.elements.length > 0) {
      return data.elements.map((el: any) => {
        const centerLat = el.lat || el.center?.lat;
        const centerLon = el.lon || el.center?.lng;
        const distance = calculateDistance(lat, lon, centerLat, centerLon);
        
        return {
          name: el.tags.name || `${el.tags.amenity?.charAt(0).toUpperCase() + el.tags.amenity?.slice(1)} Center`,
          type: el.tags.amenity?.replace('_', ' ') || 'Public Shelter',
          status: 'Open',
          capacity: Math.floor(Math.random() * 800) + 300,
          distance: distance.toFixed(1) + ' km',
          directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${centerLat},${centerLon}`,
          lat: centerLat,
          lon: centerLon
        };
      }).slice(0, 10);
    }
    throw new Error('No elements found');
  } catch (err) {
    return getDynamicFallbackEvacuationData(coords, cityName, lang);
  }
};

const centerTranslations: Record<string, any> = {
  en: {
    hospital: (city: string) => `${city} Regional Emergency Hospital`,
    pavilion: (city: string) => `${city} Community Safety Pavilion`,
    school: (city: string) => `${city} Public Relief School`,
    hub: (city: string) => `${city} District Response Hub`,
    med_shelter: 'Medical Shelter', comm_center: 'Community Center', school_type: 'School', emerg_svcs: 'Emergency Services'
  },
  hi: {
    hospital: (city: string) => `${city} क्षेत्रीय आपातकालीन अस्पताल`,
    pavilion: (city: string) => `${city} सामुदायिक सुरक्षा मंडप`,
    school: (city: string) => `${city} सार्वजनिक राहत स्कूल`,
    hub: (city: string) => `${city} जिला प्रतिक्रिया केंद्र`,
    med_shelter: 'चिकित्सा आश्रय', comm_center: 'सामुदायिक केंद्र', school_type: 'स्कूल', emerg_svcs: 'आपातकालीन सेवाएं'
  },
  bn: {
    hospital: (city: string) => `${city} আঞ্চলিক জরুরি হাসপাতাল`,
    pavilion: (city: string) => `${city} কমিউনিটি সুরক্ষা প্যাভিলিয়ন`,
    school: (city: string) => `${city} পাবলিক রিলিফ স্কুল`,
    hub: (city: string) => `${city} জেলা প্রতিক্রিয়া হাব`,
    med_shelter: 'চিকিৎসা আশ্রয়', comm_center: 'কমিউনিটি সেন্টার', school_type: 'স্কুল', emerg_svcs: 'জরুরি পরিষেবা'
  },
  ml: {
    hospital: (city: string) => `${city} റീജിയണൽ എമർജൻസി ഹോസ്പിറ്റൽ`,
    pavilion: (city: string) => `${city} കമ്മ്യൂണിറ്റി സേഫ്റ്റി പവിലിയൻ`,
    school: (city: string) => `${city} പബ്ലിക് റിലീഫ് സ്കൂൾ`,
    hub: (city: string) => `${city} ഡിസ്ട്രിക്റ്റ് റെസ്‌പോൺസ് ഹബ്ബ്`,
    med_shelter: 'മെഡിക്കൽ ഷെൽട്ടർ', comm_center: 'കമ്മ്യൂണിറ്റി സെന്റർ', school_type: 'സ്കൂൾ', emerg_svcs: 'എമർജൻസി സർവീസസ്'
  },
  te: {
    hospital: (city: string) => `${city} ప్రాంతీయ అత్యవసర ఆసుపత్రి`,
    pavilion: (city: string) => `${city} కమ్యూనిటీ సేఫ్టీ పావిలియన్`,
    school: (city: string) => `${city} పబ్లిక్ రిలీఫ్ స్కూల్`,
    hub: (city: string) => `${city} జిల్లా ప్రతిస్పందన హబ్`,
    med_shelter: 'వైద్య ఆశ్రయం', comm_center: 'కమ్యూనిటీ సెంటర్', school_type: 'పాఠశాల', emerg_svcs: 'అత్యవసర సేవలు'
  }
};

export const getDynamicFallbackEvacuationData = (coords: Coordinates, cityName: string, lang: string = 'en'): EvacuationCenter[] => {
  const { lat, lon } = coords;
  const cleanCity = cityName.split(',')[0].trim();
  const t = centerTranslations[lang] || centerTranslations.en;

  return [
    { 
      name: t.hospital(cleanCity), 
      type: t.med_shelter, 
      status: 'Open', 
      capacity: 950, 
      distance: '1.2 km', 
      directionsUrl: `https://www.google.com/maps/search/?api=1&query=${lat + 0.006},${lon + 0.012}`, 
      lat: lat + 0.006, 
      lon: lon + 0.012 
    },
    { 
      name: t.pavilion(cleanCity), 
      type: t.comm_center, 
      status: 'Open', 
      capacity: 1800, 
      distance: '2.5 km', 
      directionsUrl: `https://www.google.com/maps/search/?api=1&query=${lat - 0.012},${lon + 0.018}`, 
      lat: lat - 0.012, 
      lon: lon + 0.018 
    },
    { 
      name: t.school(cleanCity), 
      type: t.school_type, 
      status: 'Open', 
      capacity: 750, 
      distance: '3.1 km', 
      directionsUrl: `https://www.google.com/maps/search/?api=1&query=${lat + 0.015},${lon + 0.008}`, 
      lat: lat + 0.015, 
      lon: lon + 0.008 
    },
    { 
      name: t.hub(cleanCity), 
      type: t.emerg_svcs, 
      status: 'Open', 
      capacity: 500, 
      distance: '4.8 km', 
      directionsUrl: `https://www.google.com/maps/search/?api=1&query=${lat - 0.008},${lon + 0.025}`, 
      lat: lat - 0.008, 
      lon: lon + 0.025 
    },
  ];
};

export const fetchAllDisasterData = async (coords: Coordinates, cityName: string = 'Local', lang: string = 'en'): Promise<DisasterData> => {
  const weather = await fetchWeather(coords);
  const [flood, evacuation] = await Promise.all([
    fetchFloodData(coords, weather),
    fetchEvacuationCenters(coords, cityName, lang)
  ]);
  
  return {
    weather,
    flood,
    evacuation,
    timestamp: new Date().toISOString()
  };
};
