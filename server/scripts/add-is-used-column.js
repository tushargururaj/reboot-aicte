import db from "../config/db.js";

const runMigration = async () => {
    try {
        console.log("Adding is_used column to magic_links table...");

        const query = `
            ALTER TABLE magic_links 
            ADD COLUMN IF NOT EXISTS is_used BOOLEAN DEFAULT FALSE;
        `;

        console.log("Running query:");
        console.log(query);

        await db.query(query);

        console.log("Migration successful!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

runMigration();
