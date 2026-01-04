import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Get the first user (assuming there's at least one user)
  const user = await prisma.user.findFirst();

  if (!user) {
    console.log("❌ No users found. Please create a user first by logging in.");
    return;
  }

  console.log(`✅ Found user: ${user.email}`);

  // Create categories
  console.log("Creating categories...");
  const incomeCategories = await Promise.all([
    prisma.category.create({
      data: { userId: user.id, name: "Konsulenttjenester", type: "INCOME" },
    }),
    prisma.category.create({
      data: { userId: user.id, name: "Produktsalg", type: "INCOME" },
    }),
    prisma.category.create({
      data: { userId: user.id, name: "Abonnementer", type: "INCOME" },
    }),
  ]);

  const expenseCategories = await Promise.all([
    prisma.category.create({
      data: { userId: user.id, name: "Kontorrekvisita", type: "EXPENSE" },
    }),
    prisma.category.create({
      data: { userId: user.id, name: "Programvare", type: "EXPENSE" },
    }),
    prisma.category.create({
      data: { userId: user.id, name: "Markedsføring", type: "EXPENSE" },
    }),
    prisma.category.create({
      data: { userId: user.id, name: "Reise og opphold", type: "EXPENSE" },
    }),
    prisma.category.create({
      data: { userId: user.id, name: "Strøm og internett", type: "EXPENSE" },
    }),
  ]);

  console.log(`✅ Created ${incomeCategories.length} income categories`);
  console.log(`✅ Created ${expenseCategories.length} expense categories`);

  // Create customers
  console.log("Creating customers...");
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        userId: user.id,
        name: "Acme Corporation AS",
        orgNumber: "987654321",
        email: "faktura@acme.no",
        address: "Storgata 1",
        postalCode: "0180",
        city: "Oslo",
        phone: "+47 22 00 00 00",
      },
    }),
    prisma.customer.create({
      data: {
        userId: user.id,
        name: "TechStart Norge AS",
        orgNumber: "123456789",
        email: "regnskap@techstart.no",
        address: "Drammensveien 123",
        postalCode: "0277",
        city: "Oslo",
        phone: "+47 23 11 11 11",
      },
    }),
    prisma.customer.create({
      data: {
        userId: user.id,
        name: "Digital Solutions AS",
        email: "post@digitalsolutions.no",
        address: "Bygdøy Allé 5",
        postalCode: "0262",
        city: "Oslo",
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} customers`);

  // Create suppliers
  console.log("Creating suppliers...");
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        userId: user.id,
        name: "Office Supply AS",
        orgNumber: "111222333",
        email: "post@officesupply.no",
        address: "Industriveien 10",
        postalCode: "0580",
        city: "Oslo",
      },
    }),
    prisma.supplier.create({
      data: {
        userId: user.id,
        name: "CloudHost Norge",
        email: "support@cloudhost.no",
        address: "Teknologiveien 2",
        postalCode: "0668",
        city: "Oslo",
      },
    }),
    prisma.supplier.create({
      data: {
        userId: user.id,
        name: "Marketing Pro AS",
        orgNumber: "999888777",
        email: "faktura@marketingpro.no",
      },
    }),
  ]);

  console.log(`✅ Created ${suppliers.length} suppliers`);

  // Get settings to get the next invoice number
  const settings = await prisma.settings.findUnique({
    where: { userId: user.id },
  });

  if (!settings) {
    console.log("❌ Settings not found for user");
    return;
  }

  // Create invoices
  console.log("Creating invoices...");
  const invoice1 = await prisma.invoice.create({
    data: {
      userId: user.id,
      customerId: customers[0].id,
      invoiceNumber: `${settings.invoicePrefix}-${settings.invoiceNextNumber}`,
      issueDate: new Date("2024-01-15"),
      dueDate: new Date("2024-01-29"),
      status: "PAID",
      notes: "Takk for samarbeidet!",
      lines: {
        create: [
          {
            description: "Konsulenttime - Systemutvikling",
            quantity: 40,
            unitPrice: 1200,
            vatRate: 25,
            sortOrder: 0,
          },
          {
            description: "Prosjektledelse",
            quantity: 10,
            unitPrice: 1500,
            vatRate: 25,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  // Add payment for invoice 1
  await prisma.payment.create({
    data: {
      invoiceId: invoice1.id,
      amount: 73125, // Total with VAT
      date: new Date("2024-01-25"),
      note: "Betalt via bankoverføring",
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      userId: user.id,
      customerId: customers[1].id,
      invoiceNumber: `${settings.invoicePrefix}-${settings.invoiceNextNumber + 1}`,
      issueDate: new Date("2024-02-01"),
      dueDate: new Date("2024-02-15"),
      status: "SENT",
      sentAt: new Date("2024-02-01"),
      sentTo: customers[1].email!,
      lines: {
        create: [
          {
            description: "Utviklingspakke Standard",
            quantity: 1,
            unitPrice: 25000,
            vatRate: 25,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const invoice3 = await prisma.invoice.create({
    data: {
      userId: user.id,
      customerId: customers[2].id,
      invoiceNumber: `${settings.invoicePrefix}-${settings.invoiceNextNumber + 2}`,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "DRAFT",
      lines: {
        create: [
          {
            description: "Webdesign - Landingsside",
            quantity: 1,
            unitPrice: 15000,
            vatRate: 25,
            sortOrder: 0,
          },
          {
            description: "SEO-optimalisering",
            quantity: 5,
            unitPrice: 2000,
            vatRate: 25,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  console.log(`✅ Created 3 invoices`);

  // Update settings to reflect next invoice number
  await prisma.settings.update({
    where: { userId: user.id },
    data: { invoiceNextNumber: settings.invoiceNextNumber + 3 },
  });

  // Create expenses
  console.log("Creating expenses...");
  await Promise.all([
    prisma.expense.create({
      data: {
        userId: user.id,
        supplierId: suppliers[0].id,
        categoryId: expenseCategories[0].id,
        description: "Kontormateriell - papir, penner, mapper",
        amount: 1250,
        vatAmount: 250,
        date: new Date("2024-01-10"),
        status: "PAID",
      },
    }),
    prisma.expense.create({
      data: {
        userId: user.id,
        supplierId: suppliers[1].id,
        categoryId: expenseCategories[1].id,
        description: "Webhosting - månedlig abonnement",
        amount: 499,
        vatAmount: 99.8,
        date: new Date("2024-02-01"),
        status: "PAID",
      },
    }),
    prisma.expense.create({
      data: {
        userId: user.id,
        supplierId: suppliers[2].id,
        categoryId: expenseCategories[2].id,
        description: "Google Ads kampanje - januar",
        amount: 5000,
        vatAmount: 1000,
        date: new Date("2024-01-25"),
        status: "PAID",
      },
    }),
    prisma.expense.create({
      data: {
        userId: user.id,
        categoryId: expenseCategories[3].id,
        description: "Hotellopphold - kundemøte Bergen",
        amount: 1800,
        vatAmount: 360,
        date: new Date("2024-02-05"),
        status: "REGISTERED",
      },
    }),
    prisma.expense.create({
      data: {
        userId: user.id,
        categoryId: expenseCategories[4].id,
        description: "Strøm - januar",
        amount: 850,
        vatAmount: 170,
        date: new Date("2024-02-01"),
        status: "PAID",
      },
    }),
  ]);

  console.log(`✅ Created 5 expenses`);

  console.log("\n🎉 Seed completed successfully!");
  console.log(`\n📊 Summary:`);
  console.log(`   - User: ${user.email}`);
  console.log(`   - Categories: ${incomeCategories.length + expenseCategories.length}`);
  console.log(`   - Customers: ${customers.length}`);
  console.log(`   - Suppliers: ${suppliers.length}`);
  console.log(`   - Invoices: 3 (1 paid, 1 sent, 1 draft)`);
  console.log(`   - Expenses: 5`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
