# Supabase Setup Guide

Follow these steps to configure your Supabase project for the Cashback Application.

## 1. Create a Supabase Project

1.  Go to [Supabase Dashboard](https://supabase.com/dashboard) and sign in.
2.  Click **"New project"**.
3.  Choose your organization and enter a name (e.g., `BackCash`).
4.  Set a strong database password and save it.
5.  Select a region close to your users (e.g., Mumbai, Singapore).
6.  Click **"Create new project"**.

## 2. Get API Keys and URL

1.  Once the project is created, go to **Settings** (cog icon) -> **API**.
2.  Copy the **Project URL**.
3.  Copy the **anon** public key.
4.  Copy the **service_role** secret key (needed for backend acting as admin, though we use JWT secret mainly).
5.  Also note the **JWT Secret** under **Settings** -> **API** -> **JWT Settings**.

## 3. Configure Environment Variables

### Frontend (`cashback-website/.env`)

Open `d:/cback/cashback-website/.env` and update:

```ini
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:8000
```

### Backend (`backend/.env`)

Open `d:/cback/backend/.env` and update:

```ini
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-db-url]:5432/postgres
SUPABASE_JWT_SECRET=your_jwt_secret
```
*   **DATABASE_URL**: You can find the connection string in **Settings** -> **Database** -> **Connection string** -> **URI**. Replace `[YOUR-PASSWORD]` with the password you set in Step 1.

## 4. Run SQL Schema

1.  In the Supabase Dashboard, go to the **SQL Editor** (icon with `>_`).
2.  Click **"New query"**.
3.  Copy the contents of `d:/cback/backend/supabase_schema.sql`.
4.  Paste it into the SQL Editor and click **"Run"**.

This will:
*   Create `merchant` and `user` tables.
*   Set up a trigger to automatically add new users to the `user` table when they sign up.
*   Enable Row Level Security (RLS) policies.

## 5. Deployment (Optional/Final Step)

If deploying to Render (Backend) and Vercel/Netlify (Frontend), ensure you add these same environment variables in their respective configuration dashboards.
