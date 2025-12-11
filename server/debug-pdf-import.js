
import pdfParse from 'pdf-parse';

console.log('--- IMPORT DEBUG ---');
console.log('Type:', typeof pdfParse);
if (typeof pdfParse === 'function') {
    console.log('It is a function!');
} else {
    console.log('It is NOT a function.');
    console.log('Keys:', Object.keys(pdfParse));
}
console.log('--- END ---');
