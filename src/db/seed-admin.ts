import { Pool } from "pg";
import bcrypt from "bcrypt";
import { roles } from "../roles";

const DEFAULT_ADMIN_USERNAME = "superadmin";
const DEFAULT_ADMIN_EMAIL = "admin@mqm-scorecard.com";
const DEFAULT_ADMIN_PASSWORD = "changeMe123!";
const DEFAULT_ADMIN_NAME = "Super Admin";

export async function seedSuperAdmin(connectionString: string) {
  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
  });

  try {
    // Check if superadmin already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE role_id = $1 LIMIT 1",
      [Object.keys(roles).find(key => roles[key] === "superadmin")]
    );

    if (existingUser.rows.length > 0) {
      console.log("Super admin already exists. Skipping seeding.");
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, saltRounds);

    // Insert superadmin user
    const result = await pool.query(
      `INSERT INTO users (username, email, password, role_id, name, verified) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
      [
        DEFAULT_ADMIN_USERNAME,
        DEFAULT_ADMIN_EMAIL,
        hashedPassword,
        Object.keys(roles).find(key => roles[key] === "superadmin"),
        DEFAULT_ADMIN_NAME,
        true // Already verified
      ]
    );

    console.log("Default superadmin created successfully:", result.rows[0].user_id);
  } catch (error) {
    console.error("Error seeding superadmin:", error);
    throw error;
  } finally {
    await pool.end();
  }
} 