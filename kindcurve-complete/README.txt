# Kind Curve — Complete V1 Project

This folder IS your entire project. Every file Kind Curve needs is here.
Your GitHub repo is empty, so you're uploading everything fresh.


## How to get this into your empty GitHub repo

### Option A: Upload everything at once (easiest)

1. Go to your empty GitHub repo
2. You should see a page that says "Quick setup" with some instructions
3. Click "uploading an existing file" (it's a link in the text)
4. Drag ALL the files and folders from this unzipped folder into the upload area
5. Scroll down and click "Commit changes"
6. Done — Vercel will auto-deploy

IMPORTANT: Drag the CONTENTS of the folder, not the folder itself.
You want GitHub to have `package.json` at the root, not inside a subfolder.


### Option B: If Option A doesn't work well with folders

GitHub's drag-and-drop can be fiddly with nested folders. If it doesn't
pick up the folder structure properly, do it in batches:

1. First upload all the ROOT files (the ones not in any folder):
   - package.json
   - tsconfig.json
   - tailwind.config.ts
   - postcss.config.js
   - next.config.js
   - middleware.ts
   - .env.local.example

2. Then create each folder's files using "Add file → Create new file"
   and typing the full path. For example, to create app/page.tsx:
   - Click "Add file → Create new file"
   - Type: app/page.tsx
   - Paste the contents of app/page.tsx from your download
   - Commit

3. For the image files in public/, navigate to the public folder
   (create it by making any file like public/site.webmanifest first)
   then use "Add file → Upload files" to drag in the PNGs and SVG.


## What's in here (44 files)

### Config files (root level)
  package.json          — Project dependencies (includes Stripe)
  tsconfig.json         — TypeScript settings
  tailwind.config.ts    — Tailwind CSS theme with Kind Curve colours
  postcss.config.js     — PostCSS config for Tailwind
  next.config.js        — Next.js settings
  middleware.ts          — Controls which pages need login
  .env.local.example    — Template for environment variables

### app/ — All the pages
  app/globals.css                    — Global styles, fonts, slider styling
  app/layout.tsx                     — Root layout with OG tags and favicons
  app/page.tsx                       — Landing page ("Giving, shaped by you")
  app/onboarding/q1/page.tsx         — "What do you care about?" (themes)
  app/onboarding/q2/page.tsx         — "How do you want to give?" (scope)
  app/onboarding/q3/page.tsx         — "How much?" (amount selection) — NEW
  app/pie/page.tsx                   — Portfolio donut chart with sliders
  app/consistency/page.tsx           — "Power of consistency" with real engine data
  app/commit/page.tsx                — Gift Aid + Stripe payment — NEW
  app/success/page.tsx               — Post-payment celebration
  app/dashboard/page.tsx             — Impact dashboard with IEM + what-if slider
  app/login/page.tsx                 — Login page
  app/signup/page.tsx                — Signup page
  app/auth/callback/route.ts         — Handles email confirmation redirect
  app/api/checkout/route.ts          — Creates Stripe subscription — NEW
  app/api/webhook/route.ts           — Stripe payment confirmation — NEW

### components/ — Reusable UI pieces
  components/KCLogo.tsx              — Nano Banana logo (three curves + arrow)
  components/ProgressBar.tsx         — 6-step progress indicator — NEW
  components/ThemeProvider.tsx        — Applies dark/light mode
  components/ThemeToggle.tsx         — Dark mode toggle button
  components/ui/shared.tsx           — BackButton, TealButton, Card, PageShell

### lib/ — Business logic
  lib/compoundingEngine.ts           — THE ENGINE: three-layer compounding model — NEW
  lib/portfolioGeneratorV2.ts        — Generates charity portfolios from Supabase
  lib/constants.ts                   — Colours, theme labels
  lib/store.ts                       — Zustand state management
  lib/supabaseClient.ts              — Browser Supabase client
  lib/supabaseServer.ts              — Server Supabase client
  lib/utils.ts                       — CSS class helper

### public/ — Static files served directly
  public/favicon.svg                 — Browser tab icon (SVG)
  public/favicon-16x16.png           — Browser tab icon (16px)
  public/favicon-32x32.png           — Browser tab icon (32px)
  public/apple-touch-icon.png        — iPhone home screen icon
  public/android-chrome-192x192.png  — Android icon
  public/android-chrome-512x512.png  — Android icon (large)
  public/og-image.png                — Link preview image for Slack/Twitter/etc
  public/site.webmanifest            — PWA manifest


## After uploading, you still need to:

1. ADD ENVIRONMENT VARIABLES IN VERCEL (not on GitHub — never put secrets on GitHub):
   Go to vercel.com → your project → Settings → Environment Variables
   Add these 5 variables:

   NEXT_PUBLIC_SUPABASE_URL        → from Supabase dashboard → Settings → API
   NEXT_PUBLIC_SUPABASE_ANON_KEY   → from Supabase dashboard → Settings → API
   SUPABASE_SERVICE_ROLE_KEY       → from Supabase dashboard → Settings → API (the secret one)
   STRIPE_SECRET_KEY               → from Stripe → Developers → API keys (starts with sk_test_)
   STRIPE_WEBHOOK_SECRET           → from Stripe → Developers → Webhooks (see step 3 below)

2. RUN THE DATABASE MIGRATION in Supabase:
   Go to Supabase → SQL Editor → New Query → paste and run:

   ALTER TABLE portfolios
     ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
     ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
     ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
     ADD COLUMN IF NOT EXISTS gift_aid BOOLEAN DEFAULT false;

3. SET UP THE STRIPE WEBHOOK:
   Go to Stripe → Developers → Webhooks → Add endpoint
   URL: https://kindcurve.co.uk/api/webhook
   Events: checkout.session.completed, customer.subscription.deleted
   Copy the signing secret (whsec_...) and add it as STRIPE_WEBHOOK_SECRET in Vercel
