const postgres = require("postgres");
require("dotenv").config();

let sql;

try {
  sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require', // استخدم false لو تعمل محلي بدون SSL
  });
  console.log("🟢 PostgreSQL client initialized.");
} catch (err) {
  console.error("❌ Failed to initialize postgres client:", err.message);
  sql = null;
}

(async () => {
  if (!sql) return;
  try {
    const result = await sql`SELECT NOW() AS now`;
    console.log("✅ Connected to PostgreSQL at:", result[0].now);
  } catch (err) {
    console.error("❌ Database connection test failed:", err.message);
    console.error("Please verify your DATABASE_URL in the .env file");
  }
})();

module.exports = sql;
