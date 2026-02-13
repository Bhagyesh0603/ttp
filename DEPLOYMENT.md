# 🚀 Deployment Guide - SimpleData API

This guide covers deploying your full-stack application (Backend + Frontend + Database) for **FREE**.

## 📋 Prerequisites

- GitHub account
- Render account (render.com)
- Vercel account (vercel.com)

---

## 🗄️ Step 1: Setup Database (Render PostgreSQL)

### 1.1 Create PostgreSQL Database on Render

1. Go to https://render.com
2. Sign up / Login
3. Click **"New +"** → **"PostgreSQL"**
4. Configure:
   - **Name:** `simpledata-db`
   - **Region:** Choose closest to you
   - **Plan:** **Free** (Important!)
5. Click **"Create Database"**
6. Wait for provisioning (~2 minutes)
7. **Copy the "External Database URL"** - you'll need this!

---

## 🔧 Step 2: Deploy Backend (Render Web Service)

### 2.1 Push Code to GitHub (if not already)

```bash
cd C:\Users\Admin\Desktop\ttp
git init
git add .
git commit -m "Initial commit"
gh repo create simpledata-api --public
git push origin main
```

### 2.2 Deploy on Render

1. Go to Render Dashboard → Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `simpledata-api`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
   - **Plan:** **Free** ✅

### 2.3 Add Environment Variables

In Render, go to **Environment** tab and add:

```
DATABASE_URL = [Paste your Render PostgreSQL External URL]
JWT_SECRET = your-super-secret-jwt-key-change-this-in-production
PORT = 5000
NODE_ENV = production
FRONTEND_URL = https://your-app.vercel.app
```

### 2.4 Deploy

- Click **"Create Web Service"**
- Wait 3-5 minutes for deployment
- Copy your backend URL (e.g., `https://simpledata-api.onrender.com`)

### 2.5 Initialize Database

Open Render Shell and run:
```bash
node setup-db.js
node add-auth-tables.js
```

---

## 🎨 Step 3: Deploy Frontend (Vercel)

### 3.1 Update Frontend API URL

In `frontend/src/pages/ProjectDetail.jsx`, replace all `http://localhost:5000` with your Render backend URL.

Or create `.env.production` in frontend:
```
VITE_API_URL=https://simpledata-api.onrender.com
```

### 3.2 Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

**Option B: Using Vercel Dashboard**
1. Go to https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variable:
   ```
   VITE_API_URL = https://your-backend.onrender.com
   ```
6. Click **"Deploy"**

### 3.3 Get Your URL

- Vercel will give you a URL like: `https://simpledata.vercel.app`
- Copy this URL

### 3.4 Update Backend CORS

Go back to Render → Your Backend → Environment:
- Update `FRONTEND_URL` to your Vercel URL

---

## ✅ Step 4: Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Register a new account
3. Create a project
4. Test API calls
5. Done! 🎉

---

## 🔒 Security Checklist

- ✅ Change `JWT_SECRET` to a strong random string
- ✅ Never commit `.env` files
- ✅ Use environment variables for all secrets
- ✅ Enable HTTPS (automatic on Render/Vercel)

---

## 💰 Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Render PostgreSQL | Free | $0 |
| Render Web Service | Free | $0 |
| Vercel Hosting | Hobby | $0 |
| **TOTAL** | | **$0/month** |

**Note:** Free tiers have limitations:
- Render free tier sleeps after 15 min inactivity (first request takes ~30s)
- 750 hours/month included
- Perfect for portfolio/demo projects

---

## 🔄 Alternative: Deploy Everything on Render

If you want single platform:

1. Deploy Backend (as above)
2. Deploy Frontend as **Static Site**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Root: `frontend`

---

## 📱 Custom Domain (Optional)

### Add Custom Domain to Vercel:
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `api.yourdomain.com`)
3. Update DNS records as instructed

### Add Custom Domain to Render:
1. Render → Your Service → Settings → Custom Domain
2. Add domain and update DNS

---

## 🐛 Troubleshooting

### Backend not starting:
- Check Render logs
- Verify DATABASE_URL is correct
- Ensure Node version compatibility

### Frontend can't reach backend:
- Check CORS settings
- Verify VITE_API_URL is correct
- Check browser console for errors

### Database connection failed:
- Verify DATABASE_URL format
- Check if database is running
- Run setup scripts

---

## 📊 Monitoring

**Render:**
- View logs in real-time
- Monitor CPU/Memory usage
- Check deployment history

**Vercel:**
- View deployment logs
- Analytics dashboard
- Performance insights

---

## 🎯 Next Steps

1. Add custom domain
2. Set up monitoring (e.g., UptimeRobot)
3. Add error tracking (e.g., Sentry - free tier)
4. Create API documentation with Swagger
5. Add unit tests

---

## 📞 Support

If you encounter issues:
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Check service status pages

---

**Your app is now live! Share it with the world! 🌍**
