# Deploy Backend to Vercel - Step by Step Guide

## 🎯 Overview
Deploy your SimpleData API backend to Vercel in under 10 minutes. Your frontend is already on Vercel, now let's get the backend there too!

---

## 📋 Prerequisites
- Vercel account (same one where frontend is deployed)
- Vercel CLI installed: `npm install -g vercel`
- Git repository (optional but recommended)

---

## STEP 1: Set Up Cloud PostgreSQL Database (5 min)

### Option A: Vercel Postgres (RECOMMENDED - Free Tier)
1. Go to https://vercel.com/dashboard
2. Select your project or create new
3. Click **"Storage"** tab
4. Click **"Create Database"**
5. Select **"Postgres"**
6. Choose **"Hobby"** plan (FREE)
7. Click **"Create"**
8. Copy the connection string (starts with `postgres://`)

**Connection string format:**
```
postgres://default:ABC123xyz@ep-xxx-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require
```

### Option B: Neon (Free Tier - Better Performance)
1. Go to https://neon.tech
2. Sign up/login (can use GitHub)
3. Click **"Create Project"**
4. Choose region closest to you
5. Copy connection string from dashboard

### Option C: Supabase (Free Tier)
1. Go to https://supabase.com
2. Create new project
3. Go to Project Settings → Database
4. Copy connection string (Transaction mode)
5. Replace `[YOUR-PASSWORD]` with your actual password

---

## STEP 2: Deploy Backend to Vercel (3 min)

### Method 1: Using Vercel CLI (Fastest)

1. **Navigate to backend folder:**
```bash
cd c:\Users\Admin\Desktop\ttp\backend
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy (will ask questions):**
```bash
vercel
```

Answer the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your Vercel account
- **Link to existing project?** → No
- **Project name?** → `simpledata-api-backend` (or any name)
- **Directory?** → `.` (current directory)
- **Override settings?** → No

4. **Add environment variables during deployment:**
When prompted, or add them manually in Vercel dashboard:

```
DATABASE_URL=your_cloud_postgres_connection_string
JWT_SECRET=simpledata-secret-key-2026-change-me-in-production
FRONTEND_URL=https://ttp-lime.vercel.app
NODE_ENV=production
```

5. **Deploy to production:**
```bash
vercel --prod
```

**You'll get a URL like:** `https://simpledata-api-backend.vercel.app`

### Method 2: Using Vercel Dashboard (Alternative)

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Import your Git repository OR drag & drop backend folder
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `backend` (if whole project) or `.` (if backend only)
   - **Build Command:** Leave empty
   - **Output Directory:** Leave empty
5. Add Environment Variables (see above)
6. Click **"Deploy"**

---

## STEP 3: Initialize Database Tables (2 min)

After backend is deployed, you need to create tables:

1. **Go to Vercel project dashboard**
2. Click **"Settings"** → **"Functions"**
3. Or use Vercel CLI:

```bash
vercel env pull
```

Then run locally with production env:
```bash
node setup-db.js
node add-auth-tables.js
```

**OR use a temporary script endpoint:**

Add this to your `src/server.js` temporarily:
```javascript
app.get('/setup-database-once', async (req, res) => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create projects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        api_key VARCHAR(255) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create collections table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS collections (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, name)
      );
    `);

    // Create records table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS records (
        id SERIAL PRIMARY KEY,
        collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    res.json({ success: true, message: 'Database tables created!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

Then visit: `https://your-backend.vercel.app/setup-database-once`

**IMPORTANT:** Delete this endpoint after running once!

---

## STEP 4: Update Frontend Environment Variable (1 min)

1. Go to https://vercel.com/dashboard
2. Select your frontend project (**ttp-lime**)
3. Click **"Settings"** → **"Environment Variables"**
4. Add new variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://simpledata-api-backend.vercel.app` (your backend URL)
   - **Environment:** Production, Preview, Development (select all)
5. Click **"Save"**
6. Go to **"Deployments"** tab
7. Click **"..."** on latest deployment → **"Redeploy"**

---

## STEP 5: Test Your Deployment (2 min)

### Test Backend Health:
```bash
curl https://your-backend.vercel.app
```

Expected response:
```json
{
  "success": true,
  "message": "SimpleData API is running",
  "version": "1.0.0",
  "docs": "/docs"
}
```

### Test Full Flow:
1. Visit https://ttp-lime.vercel.app
2. Sign up with new account
3. Create a project
4. Create a collection
5. Add some data
6. Check if everything works!

---

## 🔧 Environment Variables Reference

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | Your cloud PostgreSQL connection string | ✅ Yes |
| `JWT_SECRET` | `simpledata-secret-key-2026-change-me-in-production` | ✅ Yes |
| `FRONTEND_URL` | `https://ttp-lime.vercel.app` | ✅ Yes |
| `NODE_ENV` | `production` | ✅ Yes |
| `PORT` | (Vercel sets automatically) | ❌ No |

---

## 🐛 Troubleshooting

### 1. "Database connection failed"
- ✅ Check DATABASE_URL is correct
- ✅ Ensure connection string includes `?sslmode=require` for Vercel Postgres
- ✅ Whitelist Vercel IPs (if using restricted database)

### 2. "CORS error from frontend"
- ✅ Check FRONTEND_URL is set correctly in backend
- ✅ Ensure no trailing slash in URL

### 3. "Cannot GET /api/..."
- ✅ Check routes are registered in server.js
- ✅ Verify vercel.json routes configuration

### 4. "Module not found"
- ✅ Ensure package.json has `"type": "module"`
- ✅ Check all imports use `.js` extension

### 5. "Tables don't exist"
- ✅ Run database setup script (see Step 3)
- ✅ Check database connection works first

---

## 📊 Verification Checklist

- [ ] Backend deployed successfully
- [ ] Backend health endpoint returns 200 OK
- [ ] Database tables created (users, projects, collections, records)
- [ ] Frontend VITE_API_URL updated
- [ ] Frontend redeployed
- [ ] Can register new account
- [ ] Can create project
- [ ] Can create collection and add data
- [ ] API key authentication works
- [ ] Code snippets show correct backend URL

---

## 🎉 Success!

Your backend URL: `https://simpledata-api-backend.vercel.app`
Your frontend URL: `https://ttp-lime.vercel.app`

Both are now deployed and connected!

---

## 💡 Pro Tips

1. **Custom Domain:** Add custom domain in Vercel → Settings → Domains
2. **Monitor Logs:** Vercel → Project → Logs (see real-time errors)
3. **Database GUI:** Use tool like TablePlus or DBeaver to connect to cloud database
4. **Environment Secrets:** Change JWT_SECRET to something more secure
5. **Git Integration:** Connect to GitHub for automatic deployments on push

---

## 🔄 Future Updates

When you make code changes:

```bash
cd backend
git add .
git commit -m "Update feature"
git push
# Vercel auto-deploys if Git connected

# OR manually:
vercel --prod
```

---

**Need help?** Check Vercel docs: https://vercel.com/docs
