
# Deployment to Vercel

## Prerequisites
1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **Vercel CLI**: Install globally with `npm i -g vercel`.

## Steps
1.  Open a terminal in the project folder.
2.  Run `vercel login` and authenticate.
3.  Run `vercel` to deploy.
    *   Set up and deploy: `Y`
    *   Scope: (Select your account)
    *   Link to existing project: `N`
    *   Project Name: (Enter name, e.g., `altranz-registration`)
    *   Directory: `./` (Current directory)
    *   Build Command: (Leave empty - default)
    *   Output Directory: (Leave empty - default)
    *   Development Command: (Leave empty - default)
4.  Wait for deployment to finish. You will get a production URL.

## Environment Variables
Since `.env` is not uploaded to Vercel, you must set environment variables in the Vercel dashboard.

1.  Go to your project on Vercel Dashboard.
2.  Click **Settings** -> **Environment Variables**.
3.  Add the variables from your local `.env`:
    *   `SUPABASE_URL`
    *   `SUPABASE_KEY`
    *   `EMAIL_USER`
    *   `EMAIL_PASS`
    *   *Note: `PORT` is handled by Vercel automatically.*

## Static Files
Vercel automatically serves the `public` folder.
Your API routes will be available at `/api/register` and `/api/events`.
