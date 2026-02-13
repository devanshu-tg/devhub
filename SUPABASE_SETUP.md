# Supabase Setup Checklist for TigerGraph DevHub

Use this checklist to connect your DevHub to Supabase for full functionality.

## Prerequisites

- Supabase account (free at [supabase.com](https://supabase.com))
- Project created in Supabase dashboard

## Step 1: Create Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Choose organization, name, password, region
4. Wait for project to be ready

## Step 2: Run Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `backend/supabase-schema.sql`
4. Paste and click **Run**
5. Verify: No errors. Tables created (resources, user_profiles, user_learning_paths, etc.)

## Step 3: Get Credentials

1. Go to **Settings** > **API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

## Step 4: Configure Backend

Create or edit `backend/.env`:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000

SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 5: Configure Frontend

Create or edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 6: Seed Database (Optional)

```bash
cd backend
npm run seed:resources      # Populates resources from TigerGraph docs
npm run seed:courses        # Imports TigerGraph University courses
npm run seed:learning-paths # Seeds Pathfinder path templates (if learning_paths is empty)
```

## Step 7: Restart Servers

```bash
npm run dev
```

## Verify Connection

- **Pathfinder**: Complete the quiz. You should see a path with resources (from DB or fallback).
- **Resource Wall**: Should show resources from DB if seeded, or mock data.
- **Sign up / Sign in**: Should work if frontend Supabase env vars are set.

## MCP Integration (Optional)

To use Supabase MCP tools in Cursor, add your access token:

1. Get token from [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Add to your environment: `SUPABASE_ACCESS_TOKEN=your-token`
3. Or pass via MCP server config: `--access-token your-token`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Supabase credentials not found" | Check backend/.env has SUPABASE_URL and keys |
| Pathfinder shows empty resources | Normal without seeding. Fallback resources are used. Run seed:resources for real data. |
| Auth not working | Check frontend has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY |
| RLS errors | Use SUPABASE_SERVICE_ROLE_KEY for backend (bypasses RLS) |
