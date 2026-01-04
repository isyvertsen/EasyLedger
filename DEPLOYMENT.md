# Deployment Guide - Faktura- og Regnskapssystem

Denne guiden viser hvordan du deployer systemet til produksjon.

## Oversikt

Systemet består av:
- **Frontend/Backend:** Next.js (deployes til Vercel/Railway/Render)
- **Database:** PostgreSQL (Neon/Supabase/Railway)
- **Authentication:** Clerk (allerede satt opp)
- **Email:** Resend (allerede satt opp)
- **AI:** OpenAI (allerede satt opp)

## VIKTIG: Database Oppsett

**Nei, databasen blir IKKE automatisk skapt.** Du må gjøre følgende:

### Steg 1: Opprett PostgreSQL Database

Velg en av disse:

#### Alternativ A: Neon (Anbefalt - Gratis tier)
1. Gå til [neon.tech](https://neon.tech)
2. Opprett gratis konto
3. Klikk "Create Project"
4. Velg region: **EU (Frankfurt)** for lavest latency fra Norge
5. Kopier connection string (starter med `postgresql://`)

#### Alternativ B: Supabase (Gratis tier)
1. Gå til [supabase.com](https://supabase.com)
2. Opprett gratis konto
3. Klikk "New Project"
4. Velg region: **West EU (London)**
5. Gå til Settings → Database
6. Kopier "Connection string" under "Connection pooling" (velg "Transaction" mode)

#### Alternativ C: Railway (Betalt, men enkel)
1. Gå til [railway.app](https://railway.app)
2. Opprett konto
3. Klikk "New Project" → "Provision PostgreSQL"
4. Kopier connection string fra "Connect" tab

### Steg 2: Sett Environment Variables

#### For Vercel Deployment:
1. Gå til Vercel dashboard → ditt prosjekt → Settings → Environment Variables
2. Legg til følgende:

```env
# Database (fra Steg 1)
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Clerk (kopier fra .env.local)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Resend (kopier fra .env.local)
RESEND_API_KEY=re_...

# OpenAI (kopier fra .env.local)
OPENAI_API_KEY=sk-proj-...

# Optional: GitHub Feedback
GITHUB_TOKEN=ghp_...
GITHUB_REPO=username/repo
FEEDBACK_AI_PROVIDER=openai
FEEDBACK_AI_API_KEY=sk-proj-...
FEEDBACK_AI_MODEL=gpt-4o
```

#### For Railway Deployment:
Railway vil auto-sette DATABASE_URL hvis du bruker Railway PostgreSQL. Legg til de andre variablene.

### Steg 3: Opprett Database Tabeller

**Dette må gjøres ETTER at databasen er opprettet!**

#### Metode A: Via Vercel/Railway Terminal (når deployed)
```bash
# I Vercel: Gå til prosjekt → Settings → Functions → Terminal
# I Railway: Klikk på service → Terminal

npm run db:migrate
```

#### Metode B: Fra din lokale maskin
```bash
# Sett DATABASE_URL midlertidig til production database
export DATABASE_URL="postgresql://..."  # Din production database URL

# Kjør migrations
npx prisma migrate deploy

# Nullstill til local database
unset DATABASE_URL
```

### Steg 4: (Valgfritt) Seed Testdata

**OBS:** Bare gjør dette hvis du vil ha testdata i produksjon!

```bash
# Via terminal (som i Steg 3)
npm run db:seed
```

For produksjon anbefales det å **IKKE** seede data. Clerk vil automatisk opprette User og Settings når første bruker logger inn via webhook.

## Deployment til Vercel (Anbefalt)

### Første Gang Setup

1. **Installer Vercel CLI (valgfritt)**
   ```bash
   npm i -g vercel
   ```

2. **Push koden til GitHub**
   ```bash
   git push origin feature/ai-invoice-upload-and-crud-modules

   # Merge til main hvis klar
   git checkout main
   git merge feature/ai-invoice-upload-and-crud-modules
   git push origin main
   ```

3. **Koble til Vercel**
   - Gå til [vercel.com](https://vercel.com)
   - Klikk "Add New..." → "Project"
   - Import GitHub repository
   - Velg "easyledger"
   - Klikk "Deploy"

4. **Sett Environment Variables** (fra Steg 2 over)
   - Gå til Settings → Environment Variables
   - Legg til alle variablene
   - Klikk "Redeploy" under Deployments

5. **Kjør Database Migrations** (fra Steg 3 over)
   - Vent til deployment er ferdig
   - Gå til project → Settings → Functions
   - Eller bruk lokal terminal med production DATABASE_URL

### Senere Deployments

Vercel deployer automatisk når du pusher til main:
```bash
git push origin main
```

## Deployment til Railway

1. **Push koden til GitHub** (som over)

2. **Opprett Railway prosjekt**
   - Gå til [railway.app](https://railway.app)
   - Klikk "New Project" → "Deploy from GitHub repo"
   - Velg "easyledger"

3. **Legg til PostgreSQL**
   - I samme prosjekt: Klikk "New" → "Database" → "Add PostgreSQL"
   - Railway setter automatisk DATABASE_URL

4. **Sett Environment Variables**
   - Klikk på Next.js service
   - Gå til "Variables" tab
   - Legg til Clerk, Resend, OpenAI keys

5. **Kjør Migrations**
   - Klikk på service → "Terminal"
   - Kjør: `npm run db:migrate`

## Post-Deployment Sjekkliste

### 1. Verifiser Database
```bash
# Koble til production database
npx prisma studio
# Sjekk at tabellene eksisterer
```

### 2. Test Clerk Webhook
- Gå til Clerk Dashboard → Webhooks
- Sjekk at webhook URL er satt til: `https://your-domain.vercel.app/api/webhooks/clerk`
- Verifiser at CLERK_WEBHOOK_SECRET er samme i både Clerk og Vercel
- Test ved å opprette en ny bruker

### 3. Test Hovedfunksjonalitet
- [ ] Logg inn med Google OAuth
- [ ] Sjekk at User og Settings ble opprettet automatisk
- [ ] Opprett en kunde
- [ ] Opprett en kategori
- [ ] Last opp en faktura med AI (test OpenAI integration)
- [ ] Opprett en utgift
- [ ] (Når implementert) Send en faktura via email

### 4. Sjekk Logs
**Vercel:**
- Gå til prosjekt → Deployment → "Runtime Logs"

**Railway:**
- Klikk på service → "Logs" tab

### 5. Performance Testing
- Test lastehastighet
- Sjekk database query performance i Prisma Studio
- Verifiser at bilder/PDFs lastes riktig

## Clerk Production Setup

### Overgå fra Development til Production

1. **I Clerk Dashboard:**
   - Gå til ditt application
   - Klikk "Go to Production" (øverst til høyre)
   - Følg instruksjonene for å aktivere production mode

2. **Oppdater Environment Variables:**
   - Production keys er forskjellige fra development keys
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` endres fra `pk_test_...` til `pk_live_...`
   - `CLERK_SECRET_KEY` endres fra `sk_test_...` til `sk_live_...`
   - Oppdater i Vercel/Railway environment variables

3. **Oppdater Webhook URL:**
   - I Clerk Dashboard → Webhooks
   - Oppdater endpoint URL til production domain:
     ```
     https://your-domain.vercel.app/api/webhooks/clerk
     ```
   - Kopier den nye `CLERK_WEBHOOK_SECRET` og oppdater i Vercel/Railway

## Custom Domain (Valgfritt)

### Vercel
1. Gå til prosjekt → Settings → Domains
2. Legg til ditt domene (f.eks. `easyledger.no`)
3. Følg DNS-instruksjonene fra domain registrar

### Railway
1. Klikk på service → Settings → Networking
2. Legg til custom domain
3. Oppdater DNS records hos domain registrar

## Database Migrations (Fremtidige Schema Endringer)

Når du endrer Prisma schema senere:

```bash
# Lokalt: Lag migration
npx prisma migrate dev --name beskrivende_navn

# Push til git
git add prisma/migrations
git commit -m "Add new migration: beskrivende_navn"
git push

# Vercel/Railway vil automatisk kjøre migrations via build script
# Eller kjør manuelt: npm run db:migrate
```

## Backup & Restore

### Neon Backup
- Neon tar automatisk daglige backups (gratis tier: 7 dagers historie)
- Restore via Neon dashboard → Branches → "Restore from backup"

### Supabase Backup
- Daglige backups (gratis tier: 7 dager)
- Restore via dashboard

### Manuell Backup
```bash
# Eksporter database
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

## Troubleshooting

### "Database not found"
- Sjekk at DATABASE_URL er korrekt satt
- Verifiser at du kjørte `npm run db:migrate`

### "Clerk webhook failed"
- Sjekk at CLERK_WEBHOOK_SECRET matcher i både Clerk og Vercel
- Verifiser webhook URL er riktig: `https://your-domain/api/webhooks/clerk`
- Sjekk logs for feilmeldinger

### "OpenAI API error"
- Verifiser at OPENAI_API_KEY er gyldig
- Sjekk at du har credits på OpenAI konto
- Se logs for detaljert feilmelding

### Build Errors
```bash
# Verifiser at build fungerer lokalt først
npm run build

# Sjekk Node version (må være 18+)
node --version
```

### "Prisma Client not generated"
- Dette skulle fikses av `postinstall` script
- Manuell fix: Kjør `npx prisma generate` i deployment terminal

## Kostnader (Estimat)

**Gratis Tier:**
- Vercel: Hobby plan (gratis)
- Neon/Supabase: Gratis tier (tilstrekkelig for testing/små bedrifter)
- Clerk: 10,000 gratis aktive brukere/måned
- Resend: 100 emails/dag gratis
- OpenAI: Pay-as-you-go (~kr 0.10 per faktura-analyse)

**For produksjon med flere brukere:**
- Vercel Pro: $20/måned (anbefales for bedrifter)
- Neon/Supabase Pro: $25-50/måned
- Clerk Pro: $25/måned
- Resend: $20/måned for 50,000 emails

## Monitorering

### Sentry (Anbefalt for error tracking)
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### Vercel Analytics
- Gå til prosjekt → Analytics tab
- Gratis web vitals og performance metrics

## Sikkerhet

### Før Production:
- [ ] Alle environment variables er satt som secrets (ikke hardkodet)
- [ ] CLERK_WEBHOOK_SECRET er satt og valideres
- [ ] Database har SSL enabled (`?sslmode=require` i URL)
- [ ] CORS er konfigurert riktig (Next.js håndterer dette default)
- [ ] Rate limiting vurder hvis mange brukere (Vercel har innebygd DDoS protection)

## Support

Ved problemer:
1. Sjekk logs (Vercel/Railway)
2. Verifiser environment variables
3. Test lokalt først med production DATABASE_URL
4. Sjekk Clerk/OpenAI/Resend dashboards for API errors

---

**Lykke til med deployment! 🚀**
