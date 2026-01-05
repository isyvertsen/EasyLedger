import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function migrateUsers() {
  console.log("🔄 Migrerer brukere fra Clerk til NextAuth...");

  const users = await prisma.user.findMany();

  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: "USER",
        emailVerified: new Date(),
      },
    });
  }

  console.log(`✅ Migrert ${users.length} brukere`);
  console.log("\n📋 Brukere:");
  users.forEach((user) => {
    console.log(`   - ${user.email} (ID: ${user.id})`);
  });

  console.log("\n⚠️  Etter NextAuth deployment:");
  console.log("   1. Brukere må logge inn på nytt med SSO");
  console.log("   2. NextAuth vil automatisk opprette Account records");
}

migrateUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
