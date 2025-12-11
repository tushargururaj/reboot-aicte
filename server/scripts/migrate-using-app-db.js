import db from '../config/db.js';

async function run() {
    try {
        console.log("Running migration on connected DB...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS magic_links (
                id SERIAL PRIMARY KEY,
                faculty_id INT REFERENCES users(id) ON DELETE CASCADE,
                section_code VARCHAR(50) NOT NULL,
                token VARCHAR(255) UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                is_used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Table magic_links created successfully.");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        console.log("Migration finished.");
        process.exit(0);
    }
}

run();
