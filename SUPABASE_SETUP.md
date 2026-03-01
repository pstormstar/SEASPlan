# Supabase Setup Guide

## 1. Create a Supabase Project
- Go to [https://app.supabase.com/](https://app.supabase.com/) and sign in.
- Click **New Project**.
- Fill in the project name, password, and select a region.
- Wait for the project to initialize.

## 2. Get API Keys
- In your Supabase project, go to **Project Settings > API**.
- Copy the **Project URL** and **anon public key**.

## 3. Configure Authentication
- Go to **Authentication > Providers**.
- Enable **Email** authentication.
- (Optional) Set up SMTP for production email sending.

## 4. Set Up the Database Table and Security (REQUIRED)
- Open the **SQL Editor** in your Supabase dashboard.
- Open and run all the SQL in [`SUPABASE_SQL.md`](./SUPABASE_SQL.md) to create the `plans` table, enable Row Level Security, and add all required policies and triggers.
- **You must run this before using the app or setting environment variables.**

## 5. Add Environment Variables
- In your project root, create a `.env.local` file:
  ```
  VITE_SUPABASE_URL=your-project-url
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```
- Replace with your actual values from step 2.

## 6. Test Locally
- Run `npm install` if you haven't already.
- Run `npm run dev` and verify authentication and planner saving work.

## 7. Troubleshooting & Debugging
- If you see errors like `400`, `403`, or `406` in the browser console:
  - Double-check that you ran all SQL in `SUPABASE_SQL.md` and that the `plans` table has a `planner_data` column of type `jsonb`.
  - Make sure Row Level Security (RLS) is enabled and all policies are present (see the SQL file for exact policy code).
  - Ensure your environment variables are correct and match your Supabase project.
  - If you change the table schema, re-run the SQL in `SUPABASE_SQL.md`.
  - You can add `console.log` statements in your code to print Supabase errors for easier debugging.
- If you get a `406` or `403` error, it usually means RLS is enabled but the correct policy is missing or not allowing your user. Re-run the policy SQL.
- If you get a `400` error about missing columns, your table schema is incorrect—drop and recreate the table using the SQL provided.

## 8. (Optional) Deploy
- See `VERCEL_DEPLOY.md` for deployment instructions.
