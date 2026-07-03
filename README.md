<div align="center">

# ✈️ Voyaz

### AI-powered travel planner that turns a sentence into a full day-by-day itinerary

Describe your dream trip and Voyaz builds a complete plan with real places, prices, weather and an interactive map, then lets you share it, fork it, and plan together with friends in realtime.

**[🌍 Live Demo](https://voyaz-app-k13s.vercel.app)**

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)

</div>

---

> [!NOTE]
> **Demo mode:** registration, onboarding and browsing work out of the box. AI trip generation is intentionally disabled on the live demo (it needs a paid-tier friendly key), so the app shows a graceful notice instead of failing. Interactive maps require a Google Maps key with billing enabled.

> This project was originally developed in a separate private repository and has been migrated here as a public portfolio piece, so the commit history starts fresh in this repository.

## ✨ Features

- 🤖 **AI itinerary generation:** Gemini 2.5 Pro builds a structured, day-by-day plan (places, time slots, price estimates, budget breakdown) validated end-to-end with Zod schemas
- 🗺️ **Interactive maps:** Google Maps with walking/driving directions between stops, plus place details, ratings and photos pulled from the Places API
- 🌤️ **Live weather:** real per-destination forecasts via Open-Meteo (no API key required)
- 👥 **Social layer:** profiles, friends, followers, blocking and reporting
- 💬 **Realtime group chat & notifications:** plan trips together, powered by Ably
- 🔀 **Trip sharing & forking:** copy a public trip to your profile and edit it freely
- 🔐 **Full auth:** email/password and Google OAuth via Supabase, onboarding flow, session management and account deletion
- 🎨 **Polished UI:** Tailwind CSS 4, Framer Motion animations and buttery-smooth scrolling (Lenis)

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Route Handlers), React 19, TypeScript |
| **Styling** | Tailwind CSS 4, Framer Motion, Lenis |
| **Backend / Data** | Supabase (Postgres + Auth + Row Level Security), TanStack Query |
| **AI** | Vercel AI SDK with `@ai-sdk/google` (Gemini), Zod structured output |
| **Maps** | `@vis.gl/react-google-maps`, Google Places API (New), Leaflet |
| **Realtime** | Ably |
| **Tooling** | ESLint, Prettier, Turbopack |

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
#    fill in at least the two Supabase variables (free tier)

# 3. Set up the database
#    run supabase/schema.sql in the Supabase SQL Editor

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Only **Supabase** is required to run the app and register an account. Everything else degrades gracefully when its key is missing.

| Variable | Required | Used for |
|---|:---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Auth + database |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | Auth + database (anon/public key) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | optional | AI trip generation ([free key](https://aistudio.google.com)) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | optional | Interactive maps |
| `GOOGLE_PLACES_API_KEY` | optional | Place search & city validation |
| `ABLY_API_KEY` | optional | Realtime chat & notifications |
| `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | optional | Destination cover images |

See [.env.example](.env.example) for details and links to obtain each key.

### Scripts

```bash
npm run dev           # dev server (Turbopack)
npm run build         # production build
npm run start         # serve production build
npm run lint          # ESLint
npm run typecheck     # TypeScript check
npm run format        # Prettier
```

## ☁️ Deployment

Deployed on [Vercel](https://vercel.com), where every push to `main` triggers a production deploy.

1. Push the repository to GitHub
2. Import it in Vercel (framework auto-detected)
3. Add the environment variables from the table above
4. Run [`supabase/schema.sql`](supabase/schema.sql) in your Supabase project
5. In Supabase, open **Authentication → URL Configuration** and add your Vercel URL to **Site URL** and the **Redirect URLs** allow-list

## 📁 Project Structure

```
src/
├── app/            # App Router pages + API route handlers
│   ├── (pages)/    # auth, onboarding, plan-trip, trips, profile, settings...
│   └── actions/    # server actions
├── components/     # UI components (plan-trip steps, settings, ui primitives...)
├── context/        # React contexts (auth, trip, realtime, preferences)
├── features/       # feature modules (social, trips)
├── hooks/          # shared hooks
└── utils/          # supabase clients, formatters, weather, maps helpers
supabase/
└── schema.sql      # profiles table, RLS policies, triggers, storage buckets
```

<div align="center">

Built with Next.js, Supabase and Gemini · [Live Demo](https://voyaz-app-k13s.vercel.app)

</div>
