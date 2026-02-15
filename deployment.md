# Deployment Guide: Cloudflare Pages + Workers + Supabase

This configuration uses:
*   **Frontend**: Cloudflare Pages
*   **Backend**: Cloudflare Workers (Python)
*   **Database**: Supabase (PostgreSQL)

## Part 1: Database (Supabase)

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Go to **Project Settings** -> **Database**.
3.  Under **Connection String**, select **URI**.
    *   Copy the URI (e.g., `postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`).
    *   **Important**: Use port `5432` (Direct) or `6543` (Pooler). For Workers, the **Session Pooler (port 5432 or 6543)** is recommended if available, but Direct works too for low traffic.
    *   **Replace `[password]`** with your actual database password.

## Part 2: Backend (Cloudflare Workers)

1.  **Install Wrangler**: `npm install -g wrangler`
2.  **Login**: `wrangler login`
3.  **Set Database Secret**:
    ```bash
    # Run this in your project root
    npx wrangler secret put DATABASE_URL
    ```
    *   Paste your Supabase Connection URI when prompted.
    *   **Note**: Our code automatically converts `postgresql://` to `postgresql+pg8000://` to work with Python Workers.
4.  **Deploy**:
    ```bash
    npx wrangler deploy
    ```
    *   Copy the **Worker URL** (e.g., `https://cback-api.your-subdomain.workers.dev`).

## Part 3: Frontend (Cloudflare Pages)

1.  **Cloudflare Dashboard** -> **Workers & Pages** -> **Create Application** -> **Pages** -> **Connect to Git**.
2.  Select Repo `sunil-7777/cback`.
3.  **Settings**:
    *   **Preset**: Vite
    *   **Output Dir**: `dist`
    *   **Root Dir**: `cashback-website`
4.  **Environment Variables**:
    *   `VITE_API_BASE_URL`: (Paste your Worker URL from Part 2)
    *   `VITE_SUPABASE_URL`: (Your Supabase URL)
    *   `VITE_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)
5.  **Deploy**.

## Part 4: Data Migration (Important!)

Since your local dev used SQLite (`backend_app.db`) and Supabase is empty (for data), you need to create the tables in Supabase.

**Option A: Developer Machine Migration (Simplest)**
1.  In your `backend/.env` file, temporarily change `DATABASE_URL` to your Supabase Connection String.
2.  Run the backend locally once:
    ```bash
    cd backend
    uvicorn main:app
    ```
    *   `SQLModel` will automatically create the tables (`create_db_and_tables` in `main.py`).
3.  (Optional) If you want to transfer your *local data* (merchants/cards) to Supabase, you'll need to write a script to copy from SQLite to Postgres, or just re-add them via the UI/API.

**Option B: SQL Editor**
1.  You can also inspect `models.py` and write the `CREATE TABLE` statements in the Supabase SQL Editor manually.
