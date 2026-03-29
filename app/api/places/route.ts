import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const radius = searchParams.get('radius') || '10000';
  const type = searchParams.get('type') || 'hospital|school|place_of_worship';
  const lang = searchParams.get('lang') || 'en';
  
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (!GOOGLE_MAPS_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=${type}&key=${GOOGLE_MAPS_API_KEY}&language=${lang}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return NextResponse.json(data);
    }
    
    // Fallback to Nominatim if Google returns no results
    throw new Error('No results from Google');
  } catch (error) {
    console.warn('Google Places failed, trying Nominatim:', error);
    
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=hospital+school+near+${lat},${lon}&format=json&limit=10&addressdetails=1`;
      const nResponse = await fetch(nominatimUrl, {
        headers: { 'User-Agent': 'MonsoonGuard/2.0' }
      });
      const nData = await nResponse.json();
      
      // Transform Nominatim data to match the expected format roughly
      const transformedResults = nData.map((item: any) => ({
        name: item.display_name.split(',')[0],
        geometry: {
          location: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          }
        },
        types: [item.type || 'amenity'],
        vicinity: item.display_name
      }));
      
      return NextResponse.json({ results: transformedResults, status: 'OK' });
    } catch (nError) {
      console.error('Nominatim also failed:', nError);
      return NextResponse.json({ error: 'All real-time sources failed' }, { status: 500 });
    }
  }
}
