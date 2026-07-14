# Clinic Topics — Website (v1)

A video library organized by specialty, an Inshorts-style swipeable medical
news feed, and a password-protected admin panel for adding videos and news
cards. Content is stored in a real Postgres database.

## Setting up the database (one-time, ~3 minutes)

1. Open your project at **vercel.com**
2. Click the **Storage** tab
3. Click **Create Database** → choose **Postgres** (powered by Neon) → give it
   any name → **Create**
4. On the next screen, click **Connect Project** and select this project —
   this automatically adds the `POSTGRES_URL` and related environment
   variables for you
5. Go to **Deployments** → click the **⋯** menu on the latest deployment →
   **Redeploy**

That's it. The first time any page loads, the app automatically creates its
tables and fills them with the sample videos/cards you've already seen.
From then on, anything you add through `/admin` is saved permanently.

## Admin panel

- URL: `/admin`
- Default password: `clinictopics`
- **Change this** by adding an environment variable in Vercel:
  - Project → Settings → Environment Variables
  - Name: `ADMIN_PASSWORD`, Value: your own password
  - Redeploy afterward

## Page structure

- `/` — homepage
- `/videos` — video library with specialty/audience filters
- `/videos/watch/[id]` — individual video with embedded player
- `/news` — swipeable, flippable medical update cards
- `/specialties`, `/specialties/[slug]` — browse by specialty
- `/admin` — dashboard, add video, create card (password protected)

## Running locally (optional)

1. Install Node.js (LTS) from nodejs.org
2. `npm install`
3. Create a `.env.local` file with a `POSTGRES_URL` pointing at your Vercel
   Postgres database (find it in Vercel → Storage → your database → `.env.local` tab, copy the values)
4. `npm run dev`
5. Open `http://localhost:3000`
