# TigerGraph DevHub

AI-powered developer portal for TigerGraph - Learn, Build, and Master Graph Databases.

## Features

- **Resource Wall**: Searchable hub with all TigerGraph content - docs, videos, tutorials
- **AI Chat**: Gemini-powered assistant to guide your learning journey
- **Learner Pathfinder**: Personalized learning paths based on your goals

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works great)
- Google Gemini API key (optional)

### 1. Clone and Install

```bash
git clone <repo-url>
cd tigergraph-devhub
npm run install:all
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **SQL Editor** and run the schema in `backend/supabase-schema.sql`
3. Go to **Settings > API** to get your credentials

### 3. Configure Environment Variables

**Backend** - Create `backend/.env`:
```env
PORT=3001
FRONTEND_URL=http://localhost:3000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Google Gemini (optional)
GEMINI_API_KEY=your-gemini-api-key
```

**Frontend** - Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4. Run Development Servers

```bash
npm run dev
```

This starts:
- Frontend at http://localhost:3000
- Backend at http://localhost:3001

> **Note**: The app works without Supabase credentials using mock data. Add credentials for persistence.

### 5. Seed the Database (Optional)

To populate the Pathfinder and Resource Wall with real TigerGraph content:

```bash
cd backend
npm run seed:resources   # Scrapes TigerGraph docs (takes a few minutes)
npm run seed:courses     # Imports courses from Teachable
```

**Pathfinder**: Works even without seeding. If the database is empty, Pathfinder uses curated fallback resources so you always get a useful learning path.

## Project Structure

```
tigergraph-devhub/
├── frontend/                 # Next.js frontend
│   ├── app/
│   │   ├── page.tsx         # Home/Dashboard
│   │   ├── resources/       # Resource Wall
│   │   ├── chat/            # AI Chat
│   │   └── pathfinder/      # Learner Pathfinder
│   ├── components/
│   │   └── layout/          # Sidebar, Header
│   └── lib/
│       └── api.ts           # API client
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── index.js         # Express server
│   │   ├── config/          # Supabase config
│   │   └── routes/          # API routes
│   └── supabase-schema.sql  # Database schema
└── README.md
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/resources` | GET | List resources with filters |
| `/api/resources/:id` | GET | Get single resource |
| `/api/resources` | POST | Create new resource |
| `/api/chat` | POST | Send message to AI assistant |
| `/api/pathfinder/generate` | POST | Generate learning path |

## Database Schema

### Resources Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Resource title |
| description | TEXT | Resource description |
| type | TEXT | video, tutorial, docs, blog |
| skill_level | TEXT | beginner, intermediate, advanced |
| use_cases | TEXT[] | Array of use case tags |
| url | TEXT | Link to resource |
| thumbnail | TEXT | Thumbnail URL |
| duration | TEXT | Estimated time |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
