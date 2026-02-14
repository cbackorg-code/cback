# Deployment Guide

## 1. Prerequisites
- GitHub account
- Render account (for hosting FastAPI)
- Supabase account (for PostgreSQL database)

## 2. Database Setup (Supabase)
1. Create a new project in Supabase.
2. Go to Project Settings -> Database -> Connection string.
3. Copy the URL (replace `[YOUR-PASSWORD]` with your actual db password).
   - It should look like: `postgresql://postgres:[PASSWORD]@db.Ref.supabase.co:5432/postgres`

## 3. Web Service Setup (Render)
1. Create a new **Web Service** on Render.
2. Connect your GitHub repository.
3. Settings:
   - **Environment**: Python 3
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `.` (or `backend` if you want to keep it clean, but adjusting paths might be needed)
     - *Recommendation*: Set Root Directory to `backend`.
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Environment Variables**:
   - Add `DATABASE_URL`: Paste your Supabase connection string.
   - Add `PYTHON_VERSION`: `3.11.0` (optional but good practice)

## 4. Deploy
- Click "Create Web Service".
- Render will build and deploy.

## 5. API Usage
- Once deployed, your API URL will be `https://<your-service>.onrender.com`.
- Swagger UI: `https://<your-service>.onrender.com/docs`
- Merchants Endpoint: `GET /merchants`
