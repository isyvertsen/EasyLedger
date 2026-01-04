# Faktura- og Regnskapssystem - Prompt for Claude Code

Lag et enkelt faktura- og regnskapssystem med følgende krav:

## Teknisk stack

- Next.js 15+ med App Router
- Database: PostgreSQL
- ORM: Prisma
- Auth: Clerk med Google login
- UI: shadcn/ui komponenter
- Styling: Tailwind CSS
- E-post: Resend
- PDF-generering: @react-pdf/renderer
- Skjemavalidering: Zod + React Hook Form
- Server Actions for mutasjoner

## Autentisering med Clerk

Sett opp Clerk med:

- Google OAuth som primær login-metode
- Clerk middleware som beskytter alle ruter unntatt /sign-in og /sign-up
- Synkroniser Clerk-bruker til database via webhook eller ved første innlogging
- Bruk Clerk sine innebygde komponenter: `<SignIn />`, `<SignUp />`, `<UserButton />`

### Clerk konfigurasjon

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### Layout med Clerk

```typescript
// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { nbNO } from "@clerk/localizations";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={nbNO}>
      <html lang="nb">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Hent bruker i Server Components

```typescript
import { auth, currentUser } from "@clerk/nextjs/server";

// I Server Component eller Server Action
const { userId } = await auth();
const user = await currentUser();
```

## Kjernefunksjonalitet

### 1. Konfigurasjon (settings)

Alt skal være konfigurerbart via admin-panel:

- Firmanavn, org.nr, adresse, logo
- Bankkontonummer
- MVA-sats (standard 25%)
- Fakturanummer-prefix og startverdi
- E-post avsenderadresse
- Betalingsfrist (antall dager)
- Knyttet til innlogget bruker (multi-tenant klar)

### 2. Kunder

- CRUD med shadcn DataTable
- Felter: navn, org.nr (valgfri), e-post, adresse, telefon
- Søk og filtrering
- Tilhører brukerens firma

### 3. Leverandører

- CRUD med shadcn DataTable
- Felter: navn, org.nr, kontaktinfo

### 4. Kategorier/Kontoer

- Konfigurerbare inntekts- og utgiftskategorier
- Eksempler: "Salg av tjenester", "Kontorrekvisita", "Reise", "Telefon"
- Type: inntekt | utgift

### 5. Fakturaer (inntekt)

- Opprett faktura med dynamiske linjer (beskrivelse, antall, enhetspris, mva)
- Generer PDF av faktura med @react-pdf/renderer
- Send faktura på e-post direkte fra systemet
- Status: utkast, sendt, betalt, forfalt
- Registrer betaling mot faktura (delbetalinger støttes)

### 6. Utgifter

- Registrer utgift med dato, beløp, mva, kategori, leverandør
- Last opp kvittering/bilag med Next.js file upload
- Status: registrert, betalt

### 7. Dashboard

- Oversiktskort med nøkkeltall
- Totalt fakturert (valgfri periode)
- Utestående fakturaer
- Totale utgifter (periode)
- Enkelt resultat (inntekt - utgift)
- Bruk shadcn charts for visualisering

## Prosjektstruktur

```
/app
  /(auth)
    /sign-in/[[...sign-in]]/page.tsx
    /sign-up/[[...sign-up]]/page.tsx
  /(protected)
    /layout.tsx (med Sidebar og Header)
    /dashboard/page.tsx
    /kunder
      /page.tsx
      /[id]/page.tsx
    /leverandorer
      /page.tsx
      /[id]/page.tsx
    /fakturaer
      /page.tsx
      /ny/page.tsx
      /[id]/page.tsx
    /utgifter
      /page.tsx
      /ny/page.tsx
      /[id]/page.tsx
    /kategorier/page.tsx
    /innstillinger/page.tsx
  /api
    /webhooks/clerk/route.ts
    /send-faktura/route.ts
    /upload/route.ts
/components
  /ui (shadcn)
  /forms
    /customer-form.tsx
    /supplier-form.tsx
    /invoice-form.tsx
    /expense-form.tsx
    /settings-form.tsx
  /tables
    /customers-table.tsx
    /suppliers-table.tsx
    /invoices-table.tsx
    /expenses-table.tsx
  /pdf
    /invoice-pdf.tsx
  /layout
    /header.tsx
    /sidebar.tsx
    /nav.tsx
/lib
  /db.ts (Prisma client)
  /actions
    /customers.ts
    /suppliers.ts
    /invoices.ts
    /expenses.ts
    /categories.ts
    /settings.ts
  /validations
    /customer.ts
    /supplier.ts
    /invoice.ts
    /expense.ts
  /utils.ts
  /email.ts
/prisma
  /schema.prisma
  /seed.ts
/middleware.ts
```

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id visning      String    @id @default(cuid())
  clerkId   String    @unique
  email     String    @unique
  name      String?
  image     String?
  
  settings   Settings?
  customers  Customer[]
  suppliers  Supplier[]
  categories Category[]
  invoices   Invoice[]
  expenses   Expense[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Settings {
  id                 String  @id @default(cuid())
  userId             String  @unique
  user               User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  companyName        String?
  orgNumber          String?
  address            String?
  postalCode         String?
  city               String?
  logo               String?
  bankAccount        String?
  vatRate            Float   @default(25)
  invoicePrefix      String  @default("FAK")
  invoiceNextNumber  Int     @default(1000)
  emailFrom          String?
  paymentDueDays     Int     @default(14)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Customer {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  orgNumber String?
  email     String?
  address   String?
  postalCode String?
  city      String?
  phone     String?
  invoices  Invoice[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

model Supplier {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  orgNumber String?
  email     String?
  address   String?
  postalCode String?
  city      String?
  phone     String?
  expenses  Expense[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

model Category {
  id       String       @id @default(cuid())
  userId   String
  user     User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  name     String
  type     CategoryType
  expenses Expense[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

enum CategoryType {
  INCOME
  EXPENSE
}

model Invoice {
  id            String        @id @default(cuid())
  userId        String
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  customerId    String
  customer      Customer      @relation(fields: [customerId], references: [id])
  invoiceNumber String
  issueDate     DateTime      @default(now())
  dueDate       DateTime
  status        InvoiceStatus @default(DRAFT)
  notes         String?
  lines         InvoiceLine[]
  payments      Payment[]
  sentAt        DateTime?
  sentTo        String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, invoiceNumber])
  @@index([userId])
  @@index([customerId])
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
  CANCELLED
}

model InvoiceLine {
  id          String  @id @default(cuid())
  invoiceId   String
  invoice     Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  description String
  quantity    Float
  unitPrice   Float
  vatRate     Float   @default(25)
  sortOrder   Int     @default(0)
}

model Payment {
  id        String   @id @default(cuid())
  invoiceId String
  invoice   Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  amount    Float
  date      DateTime @default(now())
  note      String?
  
  createdAt DateTime @default(now())
}

model Expense {
  id          String        @id @default(cuid())
  userId      String
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  supplierId  String?
  supplier    Supplier?     @relation(fields: [supplierId], references: [id])
  categoryId  String?
  category    Category?     @relation(fields: [categoryId], references: [id])
  description String
  amount      Float
  vatAmount   Float?
  date        DateTime
  status      ExpenseStatus @default(REGISTERED)
  attachments Attachment[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([supplierId])
  @@index([categoryId])
}

enum ExpenseStatus {
  REGISTERED
  PAID
}

model Attachment {
  id        String  @id @default(cuid())
  expenseId String
  expense   Expense @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  filename  String
  url       String
  mimeType  String?
  size      Int?
  
  createdAt DateTime @default(now())
}
```

## UI-komponenter fra shadcn

Installer og bruk disse komponentene:

```bash
npx shadcn@latest init
npx shadcn@latest add button input label textarea select combobox dialog sheet card form toast dropdown-menu avatar badge tabs separator table skeleton alert-dialog popover calendar
```

Legg også til for charts:

```bash
npx shadcn@latest add chart
```

## E-postfunksjon med Resend

```typescript
// lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail({
  to,
  customerName,
  invoiceNumber,
  amount,
  dueDate,
  pdfBuffer,
  fromEmail,
  companyName,
}: {
  to: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: Date;
  pdfBuffer: Buffer;
  fromEmail: string;
  companyName: string;
}) {
  return resend.emails.send({
    from: `${companyName} <${fromEmail}>`,
    to,
    subject: `Faktura ${invoiceNumber} fra ${companyName}`,
    html: `
      <h1>Faktura ${invoiceNumber}</h1>
      <p>Hei ${customerName},</p>
      <p>Vedlagt finner du faktura ${invoiceNumber} på kr ${amount.toFixed(2)}.</p>
      <p>Forfallsdato: ${dueDate.toLocaleDateString("nb-NO")}</p>
      <p>Vennlig hilsen,<br>${companyName}</p>
    `,
    attachments: [
      {
        filename: `faktura-${invoiceNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}
```

## PDF-generering

```typescript
// components/pdf/invoice-pdf.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 40 },
  title: { fontSize: 24, fontWeight: "bold" },
  // ... flere styles
});

export function InvoicePDF({ invoice, settings, customer }) {
  const subtotal = invoice.lines.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice,
    0
  );
  const vatTotal = invoice.lines.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice * (line.vatRate / 100),
    0
  );
  const total = subtotal + vatTotal;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{settings.companyName}</Text>
            <Text>{settings.address}</Text>
            <Text>{settings.postalCode} {settings.city}</Text>
            <Text>Org.nr: {settings.orgNumber}</Text>
          </View>
          <View>
            <Text style={styles.title}>FAKTURA</Text>
            <Text>Fakturanr: {invoice.invoiceNumber}</Text>
            <Text>Dato: {invoice.issueDate.toLocaleDateString("nb-NO")}</Text>
            <Text>Forfall: {invoice.dueDate.toLocaleDateString("nb-NO")}</Text>
          </View>
        </View>

        <View style={styles.customerSection}>
          <Text style={styles.subtitle}>Faktureres til:</Text>
          <Text>{customer.name}</Text>
          {customer.address && <Text>{customer.address}</Text>}
          {customer.postalCode && <Text>{customer.postalCode} {customer.city}</Text>}
          {customer.orgNumber && <Text>Org.nr: {customer.orgNumber}</Text>}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDescription}>Beskrivelse</Text>
            <Text style={styles.colQty}>Antall</Text>
            <Text style={styles.colPrice}>Pris</Text>
            <Text style={styles.colVat}>MVA</Text>
            <Text style={styles.colTotal}>Sum</Text>
          </View>
          {invoice.lines.map((line, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colDescription}>{line.description}</Text>
              <Text style={styles.colQty}>{line.quantity}</Text>
              <Text style={styles.colPrice}>{line.unitPrice.toFixed(2)}</Text>
              <Text style={styles.colVat}>{line.vatRate}%</Text>
              <Text style={styles.colTotal}>
                {(line.quantity * line.unitPrice).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Sum ekskl. MVA:</Text>
            <Text>{subtotal.toFixed(2)} kr</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>MVA:</Text>
            <Text>{vatTotal.toFixed(2)} kr</Text>
          </View>
          <View style={styles.totalRowBold}>
            <Text>Totalt:</Text>
            <Text>{total.toFixed(2)} kr</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Betalingsinformasjon:</Text>
          <Text>Kontonummer: {settings.bankAccount}</Text>
          <Text>Merk betaling med fakturanummer {invoice.invoiceNumber}</Text>
        </View>
      </Page>
    </Document>
  );
}
```

## Clerk Webhook for brukersynkronisering

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", { status: 400 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(" ");

    await prisma.user.upsert({
      where: { clerkId: id },
      update: { email, name, image: image_url },
      create: {
        clerkId: id,
        email: email!,
        name,
        image: image_url,
        settings: {
          create: {},
        },
      },
    });
  }

  if (evt.type === "user.deleted") {
    const { id } = evt.data;
    await prisma.user.delete({
      where: { clerkId: id },
    }).catch(() => {});
  }

  return new Response("", { status: 200 });
}
```

## Server Actions eksempel

```typescript
// lib/actions/customers.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { customerSchema } from "@/lib/validations/customer";
import { z } from "zod";

async function getUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Ikke autentisert");
  
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  
  if (!user) throw new Error("Bruker ikke funnet");
  return user.id;
}

export async function getCustomers() {
  const userId = await getUserId();
  
  return prisma.customer.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function getCustomer(id: string) {
  const userId = await getUserId();
  
  return prisma.customer.findFirst({
    where: { id, userId },
  });
}

export async function createCustomer(data: z.infer<typeof customerSchema>) {
  const userId = await getUserId();
  const validated = customerSchema.parse(data);
  
  const customer = await prisma.customer.create({
    data: {
      ...validated,
      userId,
    },
  });
  
  revalidatePath("/kunder");
  return customer;
}

export async function updateCustomer(
  id: string,
  data: z.infer<typeof customerSchema>
) {
  const userId = await getUserId();
  const validated = customerSchema.parse(data);
  
  const customer = await prisma.customer.update({
    where: { id, userId },
    data: validated,
  });
  
  revalidatePath("/kunder");
  revalidatePath(`/kunder/${id}`);
  return customer;
}

export async function deleteCustomer(id: string) {
  const userId = await getUserId();
  
  await prisma.customer.delete({
    where: { id, userId },
  });
  
  revalidatePath("/kunder");
}
```

## Validering med Zod

```typescript
// lib/validations/customer.ts
import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  orgNumber: z.string().optional(),
  email: z.string().email("Ugyldig e-postadresse").optional().or(z.literal("")),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
});

// lib/validations/invoice.ts
import { z } from "zod";

export const invoiceLineSchema = z.object({
  description: z.string().min(1, "Beskrivelse er påkrevd"),
  quantity: z.number().positive("Må være større enn 0"),
  unitPrice: z.number().min(0, "Kan ikke være negativ"),
  vatRate: z.number().min(0).max(100),
});

export const invoiceSchema = z.object({
  customerId: z.string().min(1, "Velg en kunde"),
  issueDate: z.date(),
  dueDate: z.date(),
  notes: z.string().optional(),
  lines: z.array(invoiceLineSchema).min(1, "Legg til minst én linje"),
});
```

## Miljøvariabler

```env
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/faktura?schema=public"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Resend (for e-post)
RESEND_API_KEY=re_...

# File upload (valgfritt - f.eks. Uploadthing eller Cloudinary)
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
```

## Seed-script

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Opprett kategorier for demo
  const categories = [
    { name: "Salg av tjenester", type: "INCOME" },
    { name: "Salg av varer", type: "INCOME" },
    { name: "Kontorrekvisita", type: "EXPENSE" },
    { name: "Reise og diett", type: "EXPENSE" },
    { name: "Telefon og internett", type: "EXPENSE" },
    { name: "Programvare", type: "EXPENSE" },
    { name: "Markedsføring", type: "EXPENSE" },
    { name: "Forsikring", type: "EXPENSE" },
  ];

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Viktige prinsipper

- Bruk Server Components der det er mulig
- Server Actions for all datamutasjon
- Alle database-queries MÅ filtrere på innlogget userId
- Loading states med loading.tsx og Suspense
- Error handling med error.tsx
- All tekst og labels på norsk
- Responsivt design (mobile-first)
- Bruk shadcn/ui konsekvent
- Vis toast-varsler ved suksess og feil

## Implementeringsrekkefølge

1. Sett opp Next.js 15 med TypeScript
2. Installer og konfigurer shadcn/ui
3. Sett opp Prisma med PostgreSQL
4. Konfigurer Clerk med Google provider
5. Lag middleware og auth-sider
6. Sett opp Clerk webhook for brukersynkronisering
7. Lag layout med sidebar og header
8. Bygg innstillinger-siden
9. Implementer kunder (CRUD)
10. Implementer leverandører (CRUD)
11. Implementer kategorier (CRUD)
12. Bygg fakturamodulen med PDF-generering
13. Legg til e-postsending av faktura
14. Implementer utgiftsmodulen med filopplasting
15. Bygg dashboard med statistikk og grafer
16. Test grundig og fiks bugs
