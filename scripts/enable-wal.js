const { createClient } = require("@libsql/client");
const path = require("path");

async function main() {
  const dbPath = path.join(__dirname, "../prisma/dev.db");
  console.log("Opening SQLite file at:", dbPath);
  
  const client = createClient({
    url: `file:${dbPath}`,
  });
  
  // Set journal mode to WAL
  await client.execute("PRAGMA journal_mode = WAL;");
  
  // Verify it was set successfully
  const result = await client.execute("PRAGMA journal_mode;");
  console.log("Success! Database journal mode is now:", result.rows[0][0] || result.rows[0]);
  
  // Close the client connection
  client.close();
}

main().catch((err) => {
  console.error("Error setting WAL mode:", err);
  process.exit(1);
});
