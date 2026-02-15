# Deployment Guide: BackCash

We will deploy the **Frontend** to **Cloudflare Pages** (Fast, Free, Custom Subdomains) and the **Backend** to **Render** (Easy Python Support, Free Tier).

## Part 1: Backend (Render)

1.  **Sign Up/Login**: Go to [dashboard.render.com](https://dashboard.render.com/).
2.  **New Web Service**:
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository (`sunil-7777/cback`).
3.  **Configuration**:
    *   **Name**: `cback-api` (or similar short name).
    *   **Root Directory**: `backend`
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
    *   **Instance Type**: Free
4.  **Environment Variables**:
    *   Add `Key`: `DATABASE_URL` | `Value`: `sqlite:///./backend_app.db`
    *   Add `Key`: `SUPABASE_URL` | `Value`: (Your Supabase URL)
    *   Add `Key`: `SUPABASE_KEY` | `Value`: (Your Supabase Anon Key)
5.  **Deploy**: Click **Create Web Service**.
    *   **Note:** Your URL will look like `https://cback-api.onrender.com`. Copy this URL.

## Part 2: Frontend (Cloudflare Pages)

1.  **Sign Up/Login**: Go to [dash.cloudflare.com](https://dash.cloudflare.com/).
2.  **Create Application**:
    *   Go to **Workers & Pages** -> **Create Application** -> **Pages** -> **Connect to Git**.
    *   Select your repository (`sunil-7777/cback`).
3.  **Build Configuration**:
    *   **Project Name**: `cback` (This determines your subdomain: `cback.pages.dev`).
    *   **Framework Preset**: **Vite**
    *   **Build Command**: `npm run build`
    *   **Build Output Directory**: `dist`
    *   **Root Directory**: `cashback-website` (Very Important!)
4.  **Environment Variables**:
    *   `VITE_SUPABASE_URL`: (Your Supabase URL)
    *   `VITE_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)
    *   `VITE_API_BASE_URL`: (Paste your Render Backend URL here, e.g., `https://cback-api.onrender.com`)
5.  **Deploy**: Click **Save and Deploy**.

## Part 3: Minimal Subdomains

*   **Frontend**: When creating the Cloudflare Pages project, name it `cback` or `bcash` to get `cback.pages.dev`.
*   **Backend**: When creating the Render service, name it `cback-api` to get `cback-api.onrender.com`.

## Note on Database (SQLite)
Since we are using SQLite on Render's free tier, the database file is **ephemeral**. This means:
*   The database will work fine for testing.
*   **Warning**: If the Render service restarts or redeploys, **all data (users, entries) will be wiped and reset to empty**.
*   **fix**: To make it permanent later, switch to using Supabase PostgreSQL (change `DATABASE_URL` env var).
