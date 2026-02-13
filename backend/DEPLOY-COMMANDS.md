# 🚀 Quick Deploy to Vercel - Command Reference

## 1️⃣ Deploy Backend (First Time)
```bash
cd c:\Users\Admin\Desktop\ttp\backend
vercel login
vercel
```

## 2️⃣ Deploy to Production
```bash
vercel --prod
```

## 3️⃣ Add Environment Variables
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add FRONTEND_URL
vercel env add NODE_ENV
```

Or add in Vercel Dashboard: https://vercel.com/dashboard

## 4️⃣ Setup Database (After First Deploy)
```bash
# Pull env variables locally
vercel env pull .env.production

# Run setup with production env
DATABASE_URL=your_cloud_db_url node setup-database-production.js
```

## 5️⃣ Update Frontend API URL
Vercel Dashboard → Frontend Project → Settings → Environment Variables:
- Key: `VITE_API_URL`
- Value: `https://your-backend.vercel.app`
- Redeploy frontend

## 6️⃣ Test Backend
```bash
curl https://your-backend.vercel.app
```

## 📋 Environment Variables Needed

```env
DATABASE_URL=postgres://user:pass@host:5432/db?sslmode=require
JWT_SECRET=simpledata-secret-key-2026-change-me-in-production
FRONTEND_URL=https://ttp-lime.vercel.app
NODE_ENV=production
```

## 🔗 Database Options (Free Tier)

### Vercel Postgres (Easiest)
1. Vercel Dashboard → Storage → Create Database → Postgres
2. Copy connection string
3. Add as DATABASE_URL

### Neon (Best Performance)
1. https://neon.tech → Create Project
2. Copy connection string
3. Add as DATABASE_URL

### Supabase
1. https://supabase.com → New Project
2. Settings → Database → Connection String (Transaction)
3. Add as DATABASE_URL

## 🎯 Your Backend URL
After deployment, you'll get:
`https://simpledata-api-backend.vercel.app`

Use this in frontend VITE_API_URL!

## 💡 Quick Commands

```bash
# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel rm [deployment-url]

# Link to existing project
vercel link
```

---
**Full Guide:** See VERCEL-BACKEND-DEPLOY.md
