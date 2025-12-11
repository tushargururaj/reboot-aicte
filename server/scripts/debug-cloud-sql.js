import dotenv from "dotenv";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

// Load env vars from server/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

async function debugCloudSql() {
    console.log("--- Cloud SQL Debugger ---");

    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432,
        ssl: {
            rejectUnauthorized: false,
        },
        connectionTimeoutMillis: 10000, // 10s timeout for connection
        query_timeout: 10000, // 10s timeout for query
    };

    console.log("Configuration (Masked):");
    console.log(`  Host: ${config.host}`);
    console.log(`  User: ${config.user}`);
    console.log(`  Database: ${config.database}`);
    console.log(`  Port: ${config.port}`);
    console.log(`  SSL: ${JSON.stringify(config.ssl)}`);
    console.log(`  Password Length: ${config.password ? config.password.length : 0}`);

    if (!config.host) {
        console.error("❌ Error: DB_HOST is missing in .env");
        return;
    }

    const client = new pg.Client(config);

    try {
        console.log(`[${new Date().toISOString()}] Attempting to connect...`);
        await client.connect();
        console.log(`[${new Date().toISOString()}] ✅ Connected successfully!`);

        console.log(`[${new Date().toISOString()}] Attempting to run query 'SELECT NOW()'...`);
        const res = await client.query("SELECT NOW()");
        console.log(`[${new Date().toISOString()}] ✅ Query successful!`);
        console.log("Server Time:", res.rows[0].now);

        await client.end();
        console.log(`[${new Date().toISOString()}] Connection closed.`);
    } catch (err) {
        console.error(`[${new Date().toISOString()}] ❌ Connection/Query Failed:`);
        console.error(err);

        if (err.message.includes("timeout")) {
            console.log("\n💡 Tip: A timeout usually means the firewall is blocking the connection.");
            console.log("   Check Google Cloud Console > SQL > Connections > Networking.");
            console.log("   Ensure your current IP address is added to 'Authorized networks'.");
        }
    }
}

debugCloudSql();
