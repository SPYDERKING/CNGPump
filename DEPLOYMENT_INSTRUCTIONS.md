# Smart CNG Pump Project - Deployment Guide

This guide will help you deploy the Smart CNG Pump project to cloud platforms for free.

## Architecture

- **Frontend**: React/Vite application hosted on Vercel
- **Backend**: FastAPI application hosted on Railway
- **Database**: Supabase (for authentication and user data)

## Prerequisites

1. Create accounts on:
   - [Vercel](https://vercel.com/)
   - [Railway](https://railway.app/)
   - [Supabase](https://supabase.com/)

2. Ensure your project is in a GitHub repository

## Deploy Backend to Railway

1. Go to [Railway](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub Repo"
3. Select your repository containing the Smart CNG Pump project
4. Select the `backend` directory
5. Railway will automatically detect the `railway.json` configuration
6. Add environment variables in the "Variables" section:
   - `DATABASE_URL`: Your database connection string
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_KEY`: Your Supabase anon key
   - Any other environment variables needed by your backend
7. Click "Deploy"

## Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com/)
2. Click "New Project" → "Import Git Repository"
3. Select your repository
4. In the project settings:
   - Framework Preset: `Other`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `/` (root of your project)
5. Add environment variables:
   - `VITE_API_BASE_URL`: The URL of your deployed backend (from Railway)
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon key
6. Click "Deploy"

## Configuration

### Environment Variables

For the **Backend** (on Railway):
```
DATABASE_URL=your_database_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

For the **Frontend** (on Vercel):
```
VITE_API_BASE_URL=https://your-railway-backend-url.railway.app
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## Updating Environment Variables

After deployment, if you need to change environment variables:

1. **For Railway**: Go to your project → Settings → Environment Variables
2. **For Vercel**: Go to your project → Settings → Environment Variables

## Notes

- The free tiers have usage limits, which should be sufficient for development and low-traffic production
- For production use, consider upgrading to paid plans as needed
- Monitor your usage on each platform to avoid hitting limits
- The application uses CORS settings that allow all origins - consider restricting this for production

## Troubleshooting

If you encounter issues:
1. Check that environment variables are correctly set
2. Verify that the frontend `VITE_API_BASE_URL` points to your deployed backend
3. Ensure Supabase configuration is consistent between frontend and backend
4. Check the deployment logs on both platforms for error messages