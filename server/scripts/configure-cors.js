import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from server directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

async function configureCors() {
    // Dynamic import to ensure env is loaded first
    const { bucket } = await import('../config/gcs.js');

    console.log('Configuring CORS for bucket:', bucket.name);

    const corsConfiguration = [
        {
            maxAgeSeconds: 3600,
            method: ['GET', 'PUT', 'POST', 'OPTIONS'],
            origin: ['http://localhost:5173', 'http://localhost:3000', '*'],
            responseHeader: ['Content-Type', 'Authorization', 'x-goog-resumable'],
        },
    ];

    try {
        await bucket.setCorsConfiguration(corsConfiguration);
        console.log('CORS configuration set successfully!');
        console.log('Allowed Origins:', corsConfiguration[0].origin);
        console.log('Allowed Methods:', corsConfiguration[0].method);
    } catch (error) {
        console.error('Failed to set CORS configuration:', error);
    }
}

configureCors();
