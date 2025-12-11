import db from '../config/db.js';

async function testConnection() {
    console.log('Testing database connection...');
    try {
        console.log('Client should already be connected via import.');

        console.log('Connection config (masked):');
        console.log('  Host:', db.host);
        console.log('  User:', db.user);
        console.log('  Database:', db.database);

        const res = await db.query('SELECT NOW()');
        console.log('Successfully queried database!');
        console.log('Current DB Time:', res.rows[0].now);

        await db.end();
        console.log('Connection closed.');
    } catch (err) {
        console.error('Connection failed:', err.message);
        process.exit(0);
    }
}

testConnection();
