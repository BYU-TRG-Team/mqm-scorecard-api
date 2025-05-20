import { seedSuperAdmin } from "./seed-admin";
import { constructCleanEnv } from "../clean-env";

export async function runSeedOperations() {
  const env = constructCleanEnv();
  
  try {
    console.log("Starting database seeding...");
    
    // Seed default superadmin
    await seedSuperAdmin(env.DATABASE_URL);
    
    console.log("Database seeding completed successfully.");
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  }
}
