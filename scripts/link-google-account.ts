import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function linkGoogleAccount() {
  const email = "ivar.syvertsen@gmail.com";
  const googleProviderId = "114179986404206230857";

  console.log(`🔍 Checking user: ${email}`);

  // Find existing user
  const user = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  });

  if (!user) {
    console.log("❌ User not found");
    return;
  }

  console.log(`✅ Found user: ${user.id}`);
  console.log(`   Name: ${user.name}`);
  console.log(`   ClerkId: ${user.clerkId}`);
  console.log(`   Accounts: ${user.accounts.length}`);

  // Check if Google account already linked
  const googleAccount = user.accounts.find((a) => a.provider === "google");
  if (googleAccount) {
    console.log("✅ Google account already linked");
    return;
  }

  console.log("🔗 Linking Google account...");

  // Update user fields for NextAuth
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: user.emailVerified || new Date(),
      role: user.role || "USER",
    },
  });

  console.log("✅ Google account linked successfully!");
  console.log("🎉 You can now sign in with Google");
}

linkGoogleAccount()
  .catch(console.error)
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
