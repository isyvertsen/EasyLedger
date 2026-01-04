# Faktura-opplasting med AI-gjenkjenning

Dette systemet støtter automatisk gjenkjenning av fakturaer ved hjelp av OpenAI Vision API.

## Funksjonalitet

- Last opp bilder (JPG, PNG, WebP) eller PDF-filer av fakturaer
- AI ekstraerer automatisk:
  - Leverandørnavn
  - Fakturanummer
  - Fakturadato
  - Totalt beløp (inkl. MVA)
  - MVA-beløp
  - Beskrivelse av varer/tjenester
- Viser sikkerhetsnivå (høy/medium/lav) på ekstraherte data
- Automatisk oppretting av leverandør hvis ikke funnet
- Valgfri kategorisering før opprettelse
- Oppretter utgift direkte i systemet

## Oppsett

1. **Legg til OpenAI API-nøkkel i `.env.local`:**
   ```env
   OPENAI_API_KEY=sk-...
   ```

2. **Få en OpenAI API-nøkkel:**
   - Gå til [platform.openai.com](https://platform.openai.com)
   - Opprett en konto
   - Gå til API keys og opprett en ny nøkkel
   - Kopier nøkkelen og lim inn i `.env.local`

3. **Modell som brukes:**
   - `gpt-4o` - OpenAI's multimodale modell med Vision-støtte

## Bruk

1. Gå til **Utgifter**-siden
2. Klikk på **Last opp faktura**-knappen
3. Velg en fil (bilde eller PDF)
4. Klikk **Analyser faktura**
5. Gjennomgå de ekstraherte dataene
6. Velg eventuell kategori (valgfritt)
7. Klikk **Opprett utgift**

## Sikkerhetsnivåer

- **Høy (grønn):** AI er svært sikker på dataene
- **Medium (gul):** AI er noe usikker, gjennomgå dataene
- **Lav (rød):** AI er usikker, dobbelsjekk alle felter før opprettelse

## Filbegrensninger

- Maks filstørrelse: 10 MB
- Støttede formater: JPG, PNG, WebP, PDF

## Hvordan fungerer det?

- **Bilder (JPG, PNG, WebP):** Bruker OpenAI Vision API (gpt-4o) for visuell analyse
- **PDF:** Ekstraerer tekst fra PDF og analyserer med GPT-4o (billigere enn Vision!)

## Kostnader

OpenAI Vision API har en pris per request:
- gpt-4o: ~$0.01 per bilde (avhenger av størrelse)

Se [OpenAI Pricing](https://openai.com/api/pricing/) for oppdaterte priser.

## Feilsøking

### "OpenAI API key is not configured"
- Sjekk at `OPENAI_API_KEY` er satt i `.env.local`
- Restart development server

### "Failed to parse invoice data"
- Bildet kan være uklart eller uleselig
- Prøv å ta et bedre bilde med god belysning
- Sørg for at all tekst er leselig

### Feil leverandør/beløp ekstrahert
- Dette kan skje med komplekse eller uvanlige fakturaer
- Rediger utgiften manuelt etter opprettelse
- Rapporter gjerne eksempler for å forbedre systemet
