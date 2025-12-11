import db from "../config/db.js";
import fs from "fs";
import path from "path";

const runMigration = async () => {
    try {
        await db.connect();
        const sqlPath = path.join(process.cwd(), "scripts", "create_profiles_table.sql");
        const sql = fs.readFileSync(sqlPath, "utf8");

        console.log("Running migration...");
        await db.query(sql);
        console.log("Migration successful!");

        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

runMigration();
