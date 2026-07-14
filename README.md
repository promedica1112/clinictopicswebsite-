# Clinic Topics — Website

A video library organized by specialty, an Inshorts-style swipeable medical
news feed, and a password-protected admin panel — including an AI-assisted
intake flow that extracts, rephrases, and fact-checks articles from a source
URL before you review and publish them as news cards.

## One-time setup after this deploy

### 1. Database (if not already connected)
Vercel → Storage → Create Database → Postgres → Connect to Project → Redeploy.

### 2. Image storage (new — required for the AI intake flow's image step)
1. Vercel → Storage → Create Database → **Blob**
2. Give it any name → Create → Connect to Project
3. Redeploy

### 3. OpenAI API key (new — required for rephrase/fact-check)
1. Vercel → Project → Settings → Environment Variables
2. Name: `OPENAI_API_KEY`, Value: your OpenAI key (paste directly into Vercel,
   never into chat or a file)
3. Redeploy

### 4. Admin password
- Name: `ADMIN_PASSWORD`, Value: your own password (default is `clinictopics`
  if unset — change this before relying on the site)

## Page structure

- `/` — homepage
- `/videos`, `/videos/watch/[id]` — video library and player
- `/news` — swipeable, flippable medical update cards
- `/specialties`, `/specialties/[slug]` — browse by specialty
- `/admin` — dashboard (password protected)
  - `/admin/videos/new` — add a video
  - `/admin/cards/new` — manually create a news card
  - `/admin/cards/new-from-url` — **AI-assisted**: paste a source article URL,
    choose a tone/mood, get a rephrased draft with an automatic fact-check
    against the original, pick an image, then review and publish using the
    same form as manual cards

## How the AI intake flow works

1. **Extract** — paste a URL; the server fetches and parses the article
   (title, ~440-character body extract, images). If extraction fails on a
   particular site, there's a manual paste fallback.
2. **Rephrase & fact-check** — pick a tone (Neutral, Professional, Patient-
   Friendly, etc.); OpenAI rephrases the title and body while preserving
   facts, numbers, and clinical qualifiers, then a second AI pass checks the
   rephrase against the original and flags any factual drift.
3. **Image** — select one of the extracted images or upload your own
   (stored in Vercel Blob).
4. **Review & publish** — lands in the same form used for manual cards, with
   AI Media prefilled — add specialty, audience, key findings, clinical
   relevance, and limitation, then publish.

All OpenAI calls happen server-side; the API key never reaches the browser.

## Running locally (optional)

1. Install Node.js (LTS) from nodejs.org
2. `npm install`
3. Create `.env.local` with `DATABASE_URL` (from Vercel → Storage → your
   database → `.env.local` tab), `OPENAI_API_KEY`, and
   `BLOB_READ_WRITE_TOKEN` (from Vercel → Storage → your Blob store)
4. `npm run dev`
5. Open `http://localhost:3000`
