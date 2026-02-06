# Deployment Checklist

## ✅ Changes Made

### 1. Fixed TypeScript Error
- **File**: `frontend/components/AuthProvider.tsx`
- **Change**: Added `AuthChangeEvent` type import and typed the callback parameters
- **Status**: ✅ Fixed

### 2. Updated Backend CORS
- **File**: `backend/src/index.js`
- **Change**: Updated CORS to support multiple origins (localhost + production URL)
- **Status**: ✅ Updated

## 📋 Next Steps

### Step 1: Commit and Push Changes
```bash
git add .
git commit -m "Fix TypeScript errors and update CORS for deployment"
git push
```

### Step 2: Vercel Deployment (Frontend)
1. Vercel will auto-redeploy after push
2. Or manually redeploy in Vercel dashboard
3. Verify build succeeds

### Step 3: Deploy Backend on Railway

1. **Go to Railway**: https://railway.app
2. **Sign up** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select your repository**
5. **Add Service** → **Empty Service**
6. **Settings**:
   - Root Directory: `backend`
7. **Variables** tab - Add these:
   ```
   PORT=3001
   FRONTEND_URL=https://your-project.vercel.app
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   GEMINI_API_KEY=your-gemini-api-key
   NODE_ENV=production
   ```
8. **Settings** → **Generate Domain**
9. **Copy the backend URL** (e.g., `https://your-backend.railway.app`)

### Step 4: Update Frontend Environment Variable

1. **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. **Edit** `NEXT_PUBLIC_API_URL`
3. **Change to**: `https://your-backend.railway.app/api`
4. **Save**
5. **Redeploy** frontend

### Step 5: Update Backend CORS (if needed)

If your Vercel URL is different, update `backend/src/index.js`:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-actual-vercel-url.vercel.app', // Add your actual Vercel URL
  process.env.FRONTEND_URL,
].filter(Boolean);
```

Then commit and push - Railway will auto-redeploy.

## 🔍 Verification

After deployment, verify:

- [ ] Frontend loads at Vercel URL
- [ ] Backend responds at Railway URL
- [ ] API calls work (check browser console)
- [ ] Authentication works
- [ ] GSQL AI feature works
- [ ] No CORS errors

## 🐛 Troubleshooting

**Build fails on Vercel:**
- Check build logs in Vercel dashboard
- Verify Root Directory is set to `frontend`
- Check environment variables are set

**Backend not accessible:**
- Check Railway logs
- Verify environment variables
- Check CORS configuration

**CORS errors:**
- Verify `FRONTEND_URL` in backend matches Vercel URL
- Check `NEXT_PUBLIC_API_URL` in frontend matches Railway URL
- Redeploy both after changes

## 📝 Environment Variables Summary

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

### Backend (Railway)
```
PORT=3001
FRONTEND_URL=https://your-frontend.vercel.app
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
NODE_ENV=production
```
