# MonsoonGuard ⛈️🛡️

> **Next-Generation Flood Management & Emergency Response System**

MonsoonGuard is a comprehensive, full-stack disaster management dashboard built to provide real-time telemetry, location-aware weather alerts, and emergency coordination. Designed to minimize latency and maximize clarity during critical climatic events, it ensures communities and emergency responders have instant access to potentially life-saving data.

## 🌟 Key Features

- **Live Meteorological Tracking**: Instantly view weather alerts, 6-day forecasts, and river station telemetry.
- **Evacuation Center Routing**: Integrated distance detection and real-time capacity tracking for emergency shelters.
- **Global Reactive Localization**: Full support for absolute, zero-refresh translation across English, Hindi, Bengali, Malayalam, and Telugu.
- **Premium User-Interface**: Built with Tailwind CSS, featuring subtle hover-reveals, responsive grid architecture, and dynamic layout scaling.
- **Offline Maps Protocol**: Simulated pre-caching for emergency cartography downloads when regional grid networks fail.

## 🛠️ Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS (with arbitrary value integration)
- **Icons:** Lucide-React
- **Type Safety:** TypeScript
- **Deployment & Hosting:** Vercel (target configuration)

## 📦 Local Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-github-repo-url>
   cd monsoonguard-react
   ```
2. **Install core dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Rename `.env.example` to `.env.local` and substitute the mocked secrets if integrating live APIs.
   ```bash
   cp .env.example .env.local
   ```
4. **Boot the development server:**
   ```bash
   npm run dev
   ```
5. **Launch the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Environment Configuration

Currently, critical systems respond to a local simulated data context to guarantee zero-latency execution. However, scaling it up requires connecting keys in the `.env` root:
- `NEXT_PUBLIC_WEATHER_API_KEY`: Keys for integrating upstream meteorological telemetry.
- `NEXT_PUBLIC_MAPBOX_TOKEN`: For downstream map tile generation.

## 📂 Architecture & Directory Structure

```text
/monsoonguard-react
├── app/                  # Next.js App Router root
│   ├── (auth)/          # Authentication flow boundaries
│   ├── (protected)/     # Encapsulated Dashboard sub-routes
│   └── globals.css      # Core Tailwind and variable registers
├── components/          # Reusable frontend architecture
│   ├── providers/       # Global React Contexts (DisasterProvider)
│   └── ui/              # Modular interface widgets
├── lib/                 # Core utilities
│   └── translations.ts  # System language dictionary
├── public/              # Static assets, logos, and manifest configs
└── next.config.ts       # Protocol restrictions and UI overrides
```

## 🚀 Future Roadmap & Optimizations

- [ ] **PWA Integration:** Establish true service workers caching arrays for total sub-grid networking survival.
- [ ] **Live OpenWeatherMap Hooks:** Fully swap the mocked response nodes for active remote endpoints.
- [ ] **Real-time WebSockets:** Implement bidirectional push infrastructure for sub-second emergency broadcast overlays.
- [ ] **Data Persistence:** Bind user profile preferences and location nodes to a remote store (e.g., PostgreSQL/Supabase).
