
import vision from '@google-cloud/vision';
import path from 'path';
import fs from 'fs';

const credentialsPath = path.join(process.cwd(), 'config', 'google-credentials.json');

const client = new vision.ImageAnnotatorClient({
    keyFilename: credentialsPath
});

console.log('Client methods:');
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
