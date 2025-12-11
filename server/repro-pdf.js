
import { processCertificateFile } from './services/ocrService.js';
import fs from 'fs';

// Create a dummy PDF file (empty) to trigger PDF parsing 
// We expect this to fail if it's invalid PDF interactively, 
// OR pass if we were using a real PDF.
// For now, let's create a textual file named .pdf to test "Invalid PDF" handling
// OR better, try to use an existing file if possible.
// I'll create a dummy file.

const dummyPdf = 'test_repro.pdf';
fs.writeFileSync(dummyPdf, 'Not a real PDF content');

async function test() {
    try {
        console.log('Testing PDF processing...');
        const result = await processCertificateFile(dummyPdf);
        console.log('Result:', result);
    } catch (e) {
        console.error('CRITICAL ERROR:', e);
    }
}

test();
