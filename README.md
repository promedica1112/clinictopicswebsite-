# Clinic Topics — Website (v1)

This is your working Clinic Topics site: a video library organized by
specialty, an Inshorts-style swipeable medical news feed, and a
password-protected admin panel where you (the only uploader for now) add
videos and news cards.

## What's included

- **Homepage** — hero, doctor/patient pathways, featured updates, specialties, latest videos
- **/videos** — full video library with specialty and audience filters
- **/videos/watch/[id]** — individual video page with embedded YouTube/Vimeo player
- **/news** — swipeable, flippable medical update cards
- **/specialties** and **/specialties/[slug]** — browse by specialty
- **/admin** — password-protected dashboard to add videos and create news cards
- Color palette, typography, and card design taken directly from your ChatGPT design brief

No visitor login is required to browse the site — only the admin panel is
password-protected.

## Running it on your own computer (optional)

You don't need to do this to deploy — Vercel can build it for you (see
below). But if you want to preview it locally:

1. Install Node.js from nodejs.org (choose the LTS version)
2. Open a terminal in this folder and run: `npm install`
3. Run: `npm run dev`
4. Open `http://localhost:3000`

## Admin panel

- URL: `/admin`
- Default password: `clinictopics`
- **Important:** before going live, change this password by setting an
  `ADMIN_PASSWORD` environment variable (instructions below) — otherwise
  anyone can log into your admin panel.

## Deploying — no terminal required

### Step 1: Put the code on GitHub
1. Create a free account at github.com
2. Click "New repository", name it `clinic-topics`, keep it Private, and create it
3. On the new repo page, click "uploading an existing file"
4. Drag in every file and folder from this project **except** `node_modules`
   and `.next` (they're not needed and are excluded from this zip already)
5. Commit the files

### Step 2: Deploy on Vercel
1. Create a free account at vercel.com (sign up with your GitHub account — it's one click)
2. Click "Add New Project"
3. Select your `clinic-topics` repository and click "Import"
4. Before clicking Deploy, open "Environment Variables" and add:
   - Name: `ADMIN_PASSWORD`
   - Value: (choose your own private password)
5. Click "Deploy"

In a couple of minutes your site will be live at a `.vercel.app` address.
You can later add a custom domain (like clinictopics.com) from the Vercel
project's "Domains" tab.

## Important limitation to know about

Right now, new videos and cards you add in `/admin` are saved to JSON files
inside the project. This works great for local testing, but **on Vercel,
those changes will NOT be saved permanently** — Vercel's servers reset
between deployments. This is fine for showing the design and layout, but
before you rely on the admin panel day-to-day, we should connect a real
database (a good free option is Supabase). Just let Claude know when you're
ready for that step, and it can be wired in without changing how anything looks.
