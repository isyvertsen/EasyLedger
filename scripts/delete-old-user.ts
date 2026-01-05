import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function deleteOldUser() {
  const email = "ivar.syvertsen@gmail.com";

  console.log(`🔍 Looking for user: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      settings: true,
      customers: true,
      suppliers: true,
      categories: true,
      invoices: true,
      expenses: true,
    },
  });

  if (!user) {
    console.log("❌ User not found");
    return;
  }

  console.log(`✅ Found user: ${user.id}`);
  console.log(`   Name: ${user.name}`);
  console.log(`   ClerkId: ${user.clerkId}`);
  console.log(`   Has Settings: ${!!user.settings}`);
  console.log(`   Customers: ${user.customers.length}`);
  console.log(`   Suppliers: ${user.suppliers.length}`);
  console.log(`   Categories: ${user.categories.length}`);
  console.log(`   Invoices: ${user.invoices.length}`);
  console.log(`   Expenses: ${user.expenses.length}`);

  if (
    user.customers.length > 0 ||
    user.suppliers.length > 0 ||
    user.invoices.length > 0 ||
    user.expenses.length > 0
  ) {
    console.log("⚠️  WARNING: User has data. Will NOT delete.");
    console.log(
      "💡 Instead, we need to allow account linking. Update auth.config.ts with allowDangerousEmailAccountLinking: true"
    );
    return;
  }

  console.log("🗑️  Deleting user (no data to lose)...");
  await prisma.user.delete({
    where: { id: user.id },
  });

  console.log("✅ User deleted successfully!");
  console.log("🎉 Try logging in with Google again - NextAuth will create a fresh user");
}

deleteOldUser()
  .catch(console.error)
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
