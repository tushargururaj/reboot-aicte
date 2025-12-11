
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

console.log('--- DEBUG START ---');
console.log('Type:', typeof pdfParse);
try {
    console.log('Keys:', Object.keys(pdfParse));
} catch (e) {
    console.log('Error getting keys:', e.message);
}

try {
    // Print string representation
    console.log('ToString:', pdfParse.toString());
} catch (e) { }

console.log('--- DEBUG END ---');
