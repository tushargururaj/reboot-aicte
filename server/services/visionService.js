// Google Cloud Vision API Service
// Uses service account credentials for enterprise-grade OCR

import vision from '@google-cloud/vision';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
// Set credentials path (local fallback)
// Assuming running from root or server directory, try to find config/google-credentials.json
const credentialsPath = path.join(process.cwd(), 'config', 'google-credentials.json');
const serverCredentialsPath = path.join(process.cwd(), 'server', 'config', 'google-credentials.json');

// Determine credentials source
let clientConfig = {};
let credentialsSource = 'none';

// Check GOOGLE_CREDENTIALS (matches gcs.js) or GOOGLE_CREDENTIALS_JSON (legacy/alternative)
const envCredentials = process.env.GOOGLE_CREDENTIALS || process.env.GOOGLE_CREDENTIALS_JSON;

if (envCredentials) {
    try {
        const credentials = JSON.parse(envCredentials);
        clientConfig = { credentials };
        credentialsSource = 'env';
        console.log('Using Google Cloud credentials from environment variable');
    } catch (error) {
        console.error('Failed to parse GOOGLE_CREDENTIALS:', error.message);
    }
} else if (fs.existsSync(credentialsPath)) {
    clientConfig = { keyFilename: credentialsPath };
    credentialsSource = 'file';
    console.log('Using Google Cloud credentials from file:', credentialsPath);
} else if (fs.existsSync(serverCredentialsPath)) {
    // Fallback for when running from root but config is in server/config
    clientConfig = { keyFilename: serverCredentialsPath };
    credentialsSource = 'file';
    console.log('Using Google Cloud credentials from file:', serverCredentialsPath);
} else {
    console.warn('WARNING: No Google Cloud credentials found.');
    console.warn('  - Checked Env Vars: GOOGLE_CREDENTIALS');
    console.warn('  - Checked Path 1:', credentialsPath);
    console.warn('  - Checked Path 2:', serverCredentialsPath);
    console.warn('  - CWD:', process.cwd());
}

// Create Vision client
const client = new vision.ImageAnnotatorClient(clientConfig);

/**
 * Extract text from an image using Google Cloud Vision OCR
 * Supports file path, Buffer, or GCS URI
 */
export async function extractTextWithVision(imageSource) {
    try {
        if (credentialsSource === 'none') {
            throw new Error('Google Cloud credentials not configured');
        }

        console.log('Starting Google Cloud Vision OCR...');

        let request = {};

        if (Buffer.isBuffer(imageSource)) {
            request = {
                image: { content: imageSource.toString('base64') }
            };
        } else if (typeof imageSource === 'string' && imageSource.startsWith('gs://')) {
            request = {
                image: { source: { imageUri: imageSource } }
            };
        } else {
            // Assume file path
            request = {
                image: { source: { filename: imageSource } }
            };
        }

        // Perform text detection
        const [result] = await client.textDetection(request);
        const detections = result.textAnnotations;

        if (!detections || detections.length === 0) {
            console.log('No text detected in image');
            return {
                success: true,
                text: '',
                confidence: 0,
                wordCount: 0
            };
        }

        // First annotation contains the full text
        const fullText = detections[0].description || '';

        console.log('Vision API extracted', fullText.length, 'characters');

        return {
            success: true,
            text: fullText.trim(),
            confidence: 0.95,
            wordCount: fullText.split(/\s+/).length,
            source: 'google-vision'
        };

    } catch (error) {
        console.error('Google Vision API error:', error.message);
        throw error;
    }
}

/**
 * Extract text from PDF using Google Cloud Vision
 * Supports file path, Buffer, or GCS URI
 */
export async function extractTextFromPDFWithVision(pdfSource) {
    try {
        if (credentialsSource === 'none') {
            throw new Error('Google Cloud credentials not configured');
        }

        console.log('Starting Google Cloud Vision PDF extraction...');

        let inputConfig = { mimeType: 'application/pdf' };

        if (Buffer.isBuffer(pdfSource)) {
            inputConfig.content = pdfSource.toString('base64');
        } else if (typeof pdfSource === 'string' && pdfSource.startsWith('gs://')) {
            inputConfig.gcsSource = { uri: pdfSource };
        } else {
            // File path
            const pdfBuffer = fs.readFileSync(pdfSource);
            inputConfig.content = pdfBuffer.toString('base64');
        }

        const request = {
            requests: [
                {
                    inputConfig: inputConfig,
                    features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
                }
            ]
        };

        // Use batchAnnotateFiles for PDF content
        const [result] = await client.batchAnnotateFiles(request);

        let fullText = '';
        let pageCount = 0;

        // Handle batch response
        const responses = result.responses || [];

        for (const response of responses) {
            if (response.error) {
                console.warn('Vision API Page Error:', response.error.message);
                continue;
            }
            if (response.fullTextAnnotation) {
                fullText += response.fullTextAnnotation.text + '\n';
                pageCount++;
            }
        }

        console.log(`Vision API extracted text from ${pageCount} pages. Length: ${fullText.length}`);

        return {
            success: true,
            text: fullText.trim(),
            confidence: 0.95,
            wordCount: fullText.split(/\s+/).length,
            pageCount: pageCount || 1,
            source: 'google-vision-pdf'
        };

    } catch (error) {
        console.error('Google Vision PDF error:', error.message);
        throw error;
    }
}

/**
 * Check if Vision API is configured and working
 */
export async function checkVisionHealth() {
    try {
        return {
            configured: credentialsSource !== 'none',
            mode: credentialsSource,
            status: credentialsSource !== 'none' ? 'ready' : 'missing_credentials'
        };
    } catch (error) {
        return {
            configured: false,
            error: error.message,
            status: 'error'
        };
    }
}
