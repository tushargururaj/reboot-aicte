import dotenv from "dotenv";
dotenv.config();
import pg from "pg";

async function createClient() {
  // Primary: Google Cloud SQL (Public IP)
  const cloudConfig = {
    host: process.env.DB_HOST,          // Cloud SQL Public IP
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 5000, // Fail fast if connection hangs
  };

  const localConfig = {
    host: "localhost",
    user: "postgres",
    password: process.env.LOCAL_DB_PASSWORD || "",
    database: "secret-2",
    port: process.env.DB_PORT_LOCAL || 5433,
  };

  // Try connecting to Cloud SQL
  let cloudClient;
  if (process.env.DB_HOST && process.env.DB_PASSWORD) {
    cloudClient = new pg.Client(cloudConfig);
    try {
      console.log("Attempting to connect to Cloud SQL...");
      await cloudClient.connect();

      // Verify connection with a simple query
      // Set a short timeout for this verification query
      console.log("Verifying Cloud SQL connection with query...");
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Query verification timed out")), 5000)
      );

      await Promise.race([
        cloudClient.query('SELECT 1'),
        timeoutPromise
      ]);

      console.log("Connected to Google Cloud SQL and verified query execution.");
      return cloudClient;
    } catch (err) {
      console.warn("Cloud SQL unavailable or query failed. Falling back to local DB...");
      console.warn(`Error: ${err.message}`);

      // Ensure cloud client is closed if it was partially opened
      try { await cloudClient.end(); } catch (e) { }
    }
  } else {
    console.log("Cloud SQL credentials missing. Skipping Cloud SQL connection.");
  }

  // Fall back to local database
  try {
    const localClient = new pg.Client(localConfig);
    await localClient.connect();
    console.log("Connected to local PostgreSQL.");
    return localClient;
  } catch (err) {
    console.error("Failed to connect to local database:", err);
    throw err;
  }
}

const db = await createClient();
export default db;