import { auth, currentUser } from "@clerk/nextjs/server";

async function main() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      console.log("❌ Ingen bruker logget inn");
      console.log(
        "\nGå til http://localhost:4001 og logg inn med Google først."
      );
      process.exit(1);
    }

    console.log("✅ Fant logget inn bruker:");
    console.log("  Clerk ID:", userId);
    console.log("  Email:", user.emailAddresses[0]?.emailAddress);
    console.log("  Navn:", user.firstName, user.lastName);
    console.log("\nKjør dette for å opprette brukeren i databasen:");
    console.log(
      `  npm run create-test-user ${userId} ${user.emailAddresses[0]?.emailAddress}`
    );
  } catch (error: any) {
    console.error("❌ Feil:", error.message);
    console.log(
      "\nDette scriptet må kjøres mens Next.js server kjører og du er logget inn."
    );
  }
}

main();
