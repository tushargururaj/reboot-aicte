import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: { rejectUnauthorized: false }
};

const client = new pg.Client(config);

async function run() {
    try {
        await client.connect();
        console.log("Connected to DB");
        await client.query(`
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
        console.log("Table magic_links created");
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

run();
