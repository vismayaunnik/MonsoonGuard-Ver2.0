# MonsoonGuard ⛈️🛡️

> **Next-Generation Flood Management & Emergency Response System**

MonsoonGuard is a comprehensive, full-stack disaster management platform built to provide real-time telemetry, location-aware weather alerts, and emergency coordination. Designed for high resilience during critical climatic events, it ensures communities and responders have instant access to potentially life-saving data.

## 🌟 Key Features

- **Multi-Source Location Engine**: Real-time discovery of evacuation centers (Schools, Hospitals, Worship Places) using **Google Places**, **Nominatim (OSM)**, and **Overpass API** for maximum reliability.
- **Live Meteorological Tracking**: Instantly view weather alerts, 6-day forecasts, and river station telemetry via Open-Meteo and Ambee.
- **Global Reactive Localization**: Full UI support across **English, Hindi, Bengali, Malayalam, and Telugu** with zero-refresh context routing.
- **Secure API Proxy Architecture**: Server-side request handling (`/api/places`) to bypass CORS and protect sensitive API keys.
- **Emergency UI/UX**: High-visibility "Action Grid" design ensuring critical buttons (Directions, Locate on Map) are never clipped or obstructed.
- **Offline Maps Protocol**: Simulated pre-caching for emergency cartography downloads when regional grid networks fail.

## 🛠️ Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Library:** React 19
- **3D Visuals:** Three.js / React-Three-Fiber
- **Styling:** Tailwind CSS (with arbitrary value integration)
- **Maps:** Leaflet / React-Leaflet
- **Icons:** Lucide-React
- **Type Safety:** TypeScript

## 📦 Local Setup Instructions

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
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Environment Configuration (Vercel)

For production deployment, ensure the following are set in your Vercel Dashboard:
- `NEXT_PUBLIC_AMBEE_API_KEY`: Powering live flood risk assessment.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Powering evacuation center discovery (proxied via `/api/places`).

## 📂 Architecture

```text
/monsoonguard-react
├── app/                  # Next.js App Router (Dashboard & API Routes)
├── components/          # Reusable UI architecture (Providers & Widgets)
├── lib/                 # Core utilities & Translation Dictionary
└── public/              # Static assets & Deployment configs
```

## 🚀 Future Roadmap
- [ ] **PWA Integration:** True service workers for total offline survival.
- [ ] **AI Forecasting:** Predictive flood models utilizing historical telemetry.
- [ ] **SMS Fallback:** Emergency alert integration for low-data scenarios.

## 📄 License
MIT License
