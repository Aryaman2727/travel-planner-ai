# WanderAI – AI-Powered Travel Planner

> Full-stack assessment submission for Trao Engineering

A multi-user AI travel planner that generates personalized day-by-day itineraries, budget breakdowns, hotel recommendations, packing lists, and insider tips — powered by Claude (Anthropic).

---

## Live Demo

- **Frontend**: `[deployed URL]`
- **Backend API**: `[deployed API URL]`
- **Walkthrough Video**: `[video link]`

---

## Tech Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Frontend | Next.js 14 (App Router) + TypeScript | Server/client split, excellent DX, great for SEO and performance |
| Styling | Tailwind CSS | Utility-first, consistent design system, zero runtime overhead |
| Backend | Node.js + Express | Lightweight, fast, perfect fit for REST API with async AI calls |
| Database | MongoDB + Mongoose | Flexible schema for complex nested trip data (itinerary, hotels, etc.) |
| AI | Anthropic Claude (claude-sonnet-4-6) | Best-in-class instruction following for structured JSON generation |
| Auth | JWT (jsonwebtoken) + bcryptjs | Stateless, scalable, no session store needed |

---

## Architecture Overview

```
┌─────────────────┐        ┌──────────────────┐        ┌──────────────┐
│   Next.js App   │──HTTP──▶  Express REST API  │──────▶│   MongoDB    │
│  (Vercel/etc.)  │        │  (Railway/Render)  │       │  (Atlas)     │
└─────────────────┘        └──────────────────┘        └──────────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │  Anthropic API    │
                           │  claude-sonnet-4-6│
                           └──────────────────┘
```

The frontend and backend are deployed as separate services. The frontend calls the backend REST API. The backend calls Anthropic's API for AI generation.

---

## Authentication & Authorization

- **Registration/Login**: Email + password, password hashed with bcryptjs (12 salt rounds)
- **Token**: JWT signed with `JWT_SECRET`, expires in 7 days
- **Protection**: Every protected route uses the `protect` middleware which verifies the token and attaches `req.user`
- **Data isolation**: Every database query on trips includes `{ user: req.user._id }` — users physically cannot access other users' data, even with valid tokens
- **Rate limiting**: 100 req/15min globally, 20 AI calls/hour per IP

---

## AI Agent Design

The AI service (`backend/src/services/ai.service.js`) uses structured prompting to generate complete trip data in a single Claude API call:

1. **Full generation** (`/api/ai/generate/:tripId`): Generates itinerary, budget, hotels, packing list, and local tips in one shot. Returns strict JSON via prompt engineering (no tools/function calling needed for this use case).

2. **Day regeneration** (`/api/ai/regenerate-day/:tripId`): Regenerates a single day based on the current plan + user's custom prompt (e.g., "More outdoor activities").

**Why one-shot JSON?** For this use case, structured prompting is more reliable and cheaper than agentic tool use. The model is told to return only valid JSON and given an exact schema. The response is stripped of any markdown fences before parsing.

---

## Creative / Custom Feature

### 🧳 AI Packing List + 💡 Local Insider Tips

**What it is**: Beyond the itinerary, WanderAI generates:
- A destination-specific **packing list** (accounts for climate, activities, trip duration)
- **Local insider tips** — genuine advice about customs, money-saving hacks, must-know etiquette, and hidden gems

**Why I built this**: Generic trip planners give you a schedule, but they don't help you *prepare*. Forgetting an adapter or not knowing to carry cash at a specific market can ruin part of a trip. These features make WanderAI a true trip companion, not just a scheduler.

**Engineering judgment**: These are generated in the same API call as the itinerary (no extra cost or latency), stored in the Trip document, and surfaced in dedicated UI tabs. The packing list is interactive — users can check off items as they pack.

---

## Key Design Decisions & Trade-offs

| Decision | Reasoning | Trade-off |
|----------|-----------|-----------|
| One-shot JSON generation | Simple, fast, cheap | Less flexible than agentic tool use |
| Separate frontend/backend services | Independent scaling, clear separation | Slightly more ops complexity |
| JWT (not sessions) | Stateless, no Redis needed | Token revocation is harder |
| MongoDB | Flexible schema for nested trip data | Less strict than relational DB |
| App Router (Next.js 14) | Modern, server components ready | More complex than Pages Router |

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Anthropic API key

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
```

Open `http://localhost:3000`

---

## Deployment

### Backend → Railway (recommended)

1. Push to GitHub
2. Create new Railway project → Deploy from GitHub
3. Set environment variables in Railway dashboard
4. Copy the generated URL as your API URL

### Frontend → Vercel

1. Import repo on Vercel
2. Set `NEXT_PUBLIC_API_URL` to your Railway backend URL
3. Deploy

### Environment Variables

**Backend** (`.env`):
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

---

## Known Limitations

- AI generation takes 10-20 seconds (Claude generating ~8000 tokens). A loading screen is shown during this time.
- No streaming support yet — the entire itinerary arrives at once.
- Rate limited to 20 AI calls/hour per IP (to control API costs).
- No email verification on registration (demo scope).

---

## Project Structure

```
travel-planner/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, error handling
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── services/        # AI service (Claude integration)
│   │   ├── utils/           # DB connection
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/             # Next.js App Router pages
    │   │   ├── auth/        # Login, Register
    │   │   ├── dashboard/   # Trip list
    │   │   └── trip/        # New trip form, Trip detail
    │   ├── lib/             # API client, auth context
    │   └── types/           # TypeScript interfaces
    └── package.json
```
