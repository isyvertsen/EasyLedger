import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Note: Kategorier er brukersp esifikke, så vi kan ikke opprette dem her
  // uten å ha en bruker. Kategorier vil bli opprettet når en bruker logger inn
  // eller kan legges til manuelt av brukeren.

  console.log("Seed completed! (No default data - users will create their own categories)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
