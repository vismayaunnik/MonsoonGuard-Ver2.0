# MonsoonGuard ⛈️🛡️

MonsoonGuard is a comprehensive Flood Management & Emergency Response System designed to help communities prepare for and respond to flooding events. The platform provides real-time weather alerts, flood risk monitoring, evacuation center discovery, and offline map support to ensure accessibility even during network disruptions.

## Features

**Flood Monitoring**
- Real-time monitoring of river conditions and water levels
- Flood risk assessment based on environmental data

**Weather Alerts**
- Live weather data and multi-day forecasts
- Automatic risk alerts for extreme rainfall and storm conditions

**Evacuation Centers**
- Locate nearby evacuation shelters and relief centers
- Quick routing and map guidance during emergencies

**Offline Maps**
- Emergency map tile caching
- Maps remain accessible even without an internet connection

**Premium 3D Interfaces & Micro-Animations**
- Interactive 3D login portal using Three.js and React-Three-Fiber
- Dynamic tracking background gradients and hover-reveals

**Multilingual Support (Zero-Refresh Context Routing)**
Available in:
- English
- Hindi
- Bengali
- Malayalam
- Telugu

## Tech Stack
- **Languages:** Java, HTML5, CSS3, JavaScript (ES6+), TypeScript
- **Frameworks:** Next.js 15 (App Router), React 19
- **Styling Libraries:** Tailwind CSS, Shadcn UI, Framer Motion
- **Map Architecture:** React-Leaflet (`react-leaflet`)
- **3D Visualization:** `@react-three/fiber`, `@react-three/drei`

## How to Run Locally

1. **Clone the repository:** 
If you are downloading this project for the first time, clone it and navigate into the folder:
```bash
git clone https://github.com/vismayaunnik/MonsoonGuard-Ver2.0.git
cd MonsoonGuard-Ver2.0
```

2. **Install Dependencies:** 
Ensure you have Node.js installed, then run the following command to initialize the project:
```bash
npm install
```

3. **Start the Server:** 
This starts the local Next.js development server:
```bash
npm run dev
```

4. **Open the App in your Browser:** 
Navigate your web browser to: http://localhost:3000

## APIs & Endpoints Used

- **Ambee Flood API**: Core service used for real-time flood risk assessment and water level telemetry (`/flood/latest/by-lat-lng`).
- **Google Places API**: Powering the discovery of schools, hospitals, and places of worship for evacuation centers.
- **Open-Meteo API**: Fetches current regional telemetry and multi-day meteorological forecasting dynamically.
- **OpenStreetMap & Nominatim**: Mapping protocol and India-restricted geocoding for city-based location validation.

## 🚀 Deployment (Vercel)

1. **Push to GitHub**: Every push to the `main` branch triggers an automatic Vercel deployment.
2. **Environment Variables**: You MUST configure the following in your Vercel Dashboard:
   - `NEXT_PUBLIC_AMBEE_API_KEY`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Future Improvements
- AI-based flood prediction models utilizing historical telemetry
- Government disaster data & alert siren integration
- SMS fallback emergency alerts for rural areas without active data
- Crowdsourced local flood reporting and image verification

## Project Purpose
This project was created to demonstrate how modern web technologies can assist in disaster preparedness and climate resilience, particularly for flood-prone regions. It serves to bridge the gap between complex metric algorithms and highly accessible human interfaces.

## License
MIT License
