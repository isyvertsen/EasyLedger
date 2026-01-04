import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Bruk din faktiske Clerk user ID her
  // Du finner den i Clerk Dashboard -> Users
  const clerkId = process.argv[2];
  const email = process.argv[3];

  if (!clerkId || !email) {
    console.log("Usage: npm run create-test-user <clerk_user_id> <email>");
    console.log(
      "Example: npm run create-test-user user_2abc123xyz test@example.com"
    );
    process.exit(1);
  }

  console.log("Oppretter test-bruker...");

  const user = await prisma.user.create({
    data: {
      clerkId,
      email,
      name: "Test User",
      settings: {
        create: {
          companyName: "Test Firma AS",
          vatRate: 25,
          invoicePrefix: "FAK",
          invoiceNextNumber: 1000,
          paymentDueDays: 14,
        },
      },
    },
    include: {
      settings: true,
    },
  });

  console.log("✅ Test-bruker opprettet:");
  console.log("  Clerk ID:", user.clerkId);
  console.log("  Email:", user.email);
  console.log("  Database ID:", user.id);
  console.log("  Settings ID:", user.settings?.id);

  await pool.end();
}

main()
  .catch((e) => {
    console.error("❌ Feil:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
