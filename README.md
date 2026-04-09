# MonsoonGuard 

MonsoonGuard is a comprehensive Flood Management & Emergency Response System designed to help communities prepare for and respond to flooding events. The platform provides real-time weather alerts, flood risk monitoring, evacuation center discovery, and offline map support to ensure accessibility even during network disruptions.

## Key Features

### Flood Monitoring

* Real-time monitoring of river conditions and water levels
* Flood risk assessment based on environmental data

### Weather Alerts

* Live weather data and multi-day forecasts
* Automatic risk alerts for extreme rainfall and storm conditions

### Evacuation Centers

* Locate nearby evacuation shelters and relief centers
* Quick routing and map guidance during emergencies

### Offline Maps

* Emergency map tile caching
* Maps remain accessible even without an internet connection

### Multilingual Support

Available in:

* English
* Hindi
* Bengali
* Malayalam
* Telugu

## Technology Stack

Next.js 15  
React 19  
TypeScript  
HTML5 & CSS3  
JavaScript  
Tailwind CSS  
Three.js  
Leaflet

## Live Link

**https://monsoon-guard-ver2-0.vercel.app/**

## Local Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vismayaunnik/MonsoonGuard-Ver2.0.git
   cd MonsoonGuard-Ver2.0
   ```
2. **Install core dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env.local` file with the following keys:
   ```env
   NEXT_PUBLIC_AMBEE_API_KEY=your_ambee_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_key
   ```
4. **Boot the development server:**
   ```bash
   npm run dev
   ```
5. **Launch the application:**
   Open `http://localhost:3000` in your browser.

## Architecture

```text
/monsoonguard-react
├── app/                 # Next.js App Router (Dashboard & API Routes)
├── components/          # Reusable UI architecture (Providers & Widgets)
├── lib/                 # Core utilities & Translation Dictionary
└── public/              # Static assets & Deployment configs
```
## APIs Used

1. **Open-Meteo**: Current weather tracking, 24-hour precipitation monitoring, and multi-day forecasting.
2. **Overpass API (OSM)**: Map data querying used to detect main rivers (waterways) and identify evacuation centers dynamically based on user coordinates.
3. **OpenStreetMap (Nominatim)**: For reverse-geocoding coordinates to detect the user's city/state and as a secondary fallback for location searched
4. **Google Places API**: Primary API for precise nearby search of emergency services and medical facilities across different regions.
5. **Leaflet / OpenStreetMap Tiles:** For renderinginteractive map layers and providing offline-capable map visual data.

## Future Improvements

* AI-based flood prediction models
* Government disaster data integration
* SMS emergency alerts for rural areas
* Crowdsourced flood reporting

## Project Purpose

This project was created to demonstrate how modern web technologies can assist in **disaster preparedness and climate resilience**, particularly for flood-prone regions.

## 📄 License

MIT License
