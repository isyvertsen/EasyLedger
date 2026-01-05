# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Norwegian invoice and accounting system (Faktura- og Regnskapssystem) built with:
- **Framework**: Next.js 15+ with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (Google OAuth)
- **UI**: shadcn/ui components with Tailwind CSS
- **Email**: Resend
- **PDF Generation**: @react-pdf/renderer
- **Form Validation**: Zod + React Hook Form
- **Data Mutations**: Next.js Server Actions

## Development Commands

### Database
```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Seed database
npx prisma db seed
```

### Development Server
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Architecture

### Authentication Flow
- NextAuth.js middleware protects all routes except `/sign-in` and `/api/auth`
- JWT-based sessions for Edge Runtime compatibility
- User data synced to PostgreSQL on sign-in via NextAuth events
- All database operations MUST filter by `userId` for multi-tenant data isolation
- Get user in Server Components/Actions: `const session = await auth(); const userId = session?.user?.id;`

### Data Access Pattern
**CRITICAL**: All queries must use the `getUserId()` helper to ensure multi-tenant isolation:

```typescript
async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Ikke autentisert");
  return session.user.id;
}
```

### Project Structure
```
/app
  /(auth)                    # Public auth routes
  /(protected)               # Protected app routes with shared layout
    /dashboard               # Main dashboard with stats
    /kunder                  # Customer management
    /leverandorer            # Supplier management
    /fakturaer               # Invoice management with PDF generation
    /utgifter                # Expense tracking with attachments
    /kategorier              # Income/expense categories
    /innstillinger           # User settings (company info, defaults)
  /api
    /webhooks/clerk          # Clerk user sync webhook

/components
  /ui                        # shadcn components
  /forms                     # Form components with React Hook Form + Zod
  /tables                    # Data tables for CRUD operations
  /pdf                       # Invoice PDF template
  /layout                    # Header, sidebar, nav

/lib
  /actions                   # Server Actions (customers, invoices, etc.)
  /validations               # Zod schemas
  /db.ts                     # Prisma client singleton
  /email.ts                  # Resend email functions
  /utils.ts                  # Utilities
```

## Database Schema

### Core Models
- **User**: Synced from Clerk via webhook, owns all tenant data
- **Settings**: Per-user company settings (logo, bank account, VAT rate, invoice prefix)
- **Customer**: Invoice recipients with contact info
- **Supplier**: Expense vendors
- **Category**: Income/expense categories (enum: INCOME | EXPENSE)
- **Invoice**: With dynamic lines, statuses (DRAFT, SENT, PAID, OVERDUE, CANCELLED)
- **InvoiceLine**: Line items with quantity, price, VAT rate
- **Payment**: Invoice payment tracking (supports partial payments)
- **Expense**: With optional supplier, category, and attachments
- **Attachment**: File uploads for expense receipts

### Important Schema Details
- Invoice numbers are unique per user: `@@unique([userId, invoiceNumber])`
- All user-owned models have `onDelete: Cascade` for data cleanup
- Settings auto-created on user creation via webhook
- VAT rate defaults to 25% (Norwegian standard)

## Key Implementation Patterns

### Server Actions
- All mutations use Server Actions in `/lib/actions`
- Always call `revalidatePath()` after mutations
- Use Zod validation before database operations
- Pattern: `getUserId()` → validate → DB operation → revalidate

### PDF Generation
- Invoice PDFs generated with `@react-pdf/renderer`
- Template in `/components/pdf/invoice-pdf.tsx`
- Includes company info, customer details, line items, VAT calculations, payment info
- Norwegian date format: `toLocaleDateString("nb-NO")`

### Email Integration
- Use Resend to send invoices with PDF attachments
- Email template in `/lib/email.ts`
- Updates invoice `sentAt` and `sentTo` fields after sending

### Form Handling
- React Hook Form with Zod resolvers
- All validation schemas in `/lib/validations`
- All user-facing text in Norwegian

## Environment Variables

Required in `.env.local` (development):
```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth v5 Authentication
# Generate with: openssl rand -base64 32
AUTH_SECRET=your-generated-secret-here
AUTH_URL=http://localhost:3000

# Google OAuth (required)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret

# Optional: Azure AD (Entra ID)
# AZURE_AD_CLIENT_ID=your-azure-client-id
# AZURE_AD_CLIENT_SECRET=your-azure-client-secret
# AZURE_AD_TENANT_ID=your-azure-tenant-id

# Email
RESEND_API_KEY=re_...

# OpenAI (for invoice recognition)
OPENAI_API_KEY=sk-proj-...

# Feedback System (optional - see Feedback System section)
GITHUB_TOKEN=ghp_xxxxx
GITHUB_REPO=username/repo-name
FEEDBACK_AI_PROVIDER=openai
FEEDBACK_AI_API_KEY=sk_xxxxx
FEEDBACK_AI_MODEL=gpt-4o
```

**Production Environment Variables:**
```env
# CRITICAL: Set these in production
AUTH_SECRET=your-production-secret  # Must be different from dev
AUTH_URL=https://yourdomain.com     # Your production domain
DATABASE_URL="postgresql://..."
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Important Rules

1. **Multi-tenancy**: NEVER query database without filtering by `userId`
2. **Language**: All UI text, labels, and messages must be in Norwegian
3. **Server Components**: Prefer Server Components over Client Components
4. **Security**: Never expose sensitive data; validate all inputs with Zod
5. **Revalidation**: Always call `revalidatePath()` after Server Action mutations
6. **Invoice Numbers**: Auto-increment based on `Settings.invoiceNextNumber`
7. **VAT Calculations**: Support per-line VAT rates (default 25%)
8. **Testing**: According to user instructions, tests must involve the database and servers must be manually started first

## NextAuth Configuration

Middleware pattern in `middleware.ts`:
```typescript
export { auth as middleware } from "~/lib/auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

Authentication configuration split between:
- `auth.config.ts`: Edge-compatible config (providers, callbacks) used by middleware
- `lib/auth.ts`: Full config with Prisma adapter for database operations

**Important**: NextAuth v5 uses `AUTH_*` environment variables (not `NEXTAUTH_*`)

## shadcn/ui Components

Install components as needed:
```bash
npx shadcn@latest add button input label textarea select dialog card form toast table
```

Use DataTable pattern for all CRUD list views (customers, suppliers, invoices, expenses).

## Common Workflows

### Creating an Invoice
1. Select customer from database
2. Add line items (description, quantity, unit price, VAT rate)
3. Generate invoice number from Settings
4. Calculate totals (subtotal, VAT, grand total)
5. Save with status DRAFT
6. Generate PDF on demand
7. Send via email → update status to SENT
8. Register payments → update status to PAID when fully paid

### Expense Tracking
1. Select supplier and category
2. Enter amount and VAT
3. Upload receipt/attachment files
4. Mark as REGISTERED or PAID

### Dashboard Stats
- Total invoiced (filtered by date range)
- Outstanding invoices (SENT, OVERDUE)
- Total expenses (filtered by date range)
- Profit/loss calculation (income - expenses)
- Use shadcn charts for visualization

## Feedback System

This project includes an AI-powered feedback system with GitHub Issues integration. See `FEEDBACK_SYSTEM.md` for complete documentation.

### Overview
- AI-assisted bug reports and feature requests
- Automatically creates GitHub Issues with proper formatting
- Multi-step workflow with follow-up questions
- Detects if user mixes bugs and features
- Checks if requested features already exist

### Files
- `app/actions/github.ts` - Server Actions for AI analysis and GitHub API
- `components/admin/ReportIssueDialog.tsx` - UI component with 5-step workflow
- `lib/release-notes.ts` - List of existing features for AI reference

### Additional Environment Variables
```env
# GitHub Integration
GITHUB_TOKEN=ghp_xxxxx
GITHUB_REPO=username/repo-name

# AI Provider (choose one)
FEEDBACK_AI_PROVIDER=openai  # or azure, openai-compatible
FEEDBACK_AI_API_KEY=sk_xxxxx
FEEDBACK_AI_MODEL=gpt-4o

# Optional: Azure OpenAI
FEEDBACK_AI_AZURE_ENDPOINT=https://your-resource.openai.azure.com
FEEDBACK_AI_AZURE_DEPLOYMENT=your-deployment-name
FEEDBACK_AI_AZURE_API_VERSION=2024-02-15-preview
```

### Key Features
1. **AI Analysis**: Analyzes user input, asks follow-up questions if unclear
2. **Type Detection**: Identifies if report is bug, feature, or both
3. **Existing Feature Check**: Validates against known features
4. **Structured Issues**: Creates well-formatted GitHub Issues with system info
5. **Norwegian Language**: All UI and prompts in Norwegian

### Implementation
The feedback dialog can be added to any page:
```tsx
import { ReportIssueDialog } from '~/components/admin/ReportIssueDialog';

const [feedbackOpen, setFeedbackOpen] = useState(false);

<ReportIssueDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
```
