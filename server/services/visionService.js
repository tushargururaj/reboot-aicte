// Google Cloud Vision API Service
// Uses service account credentials for enterprise-grade OCR

import vision from '@google-cloud/vision';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

// Helper to initialize Vision Client
function getVisionClient() {
    let clientConfig = {};
    let credentialsSource = 'none';

    // 1. Try Environment Variable (JSON content)
    const envCredentials = process.env.GOOGLE_CREDENTIALS || process.env.GOOGLE_CREDENTIALS_JSON;
    if (envCredentials) {
        try {
            clientConfig = { credentials: JSON.parse(envCredentials) };
            credentialsSource = 'env';
            // console.log('Using Vision credentials from environment');
        } catch (error) {
            console.error('Failed to parse GOOGLE_CREDENTIALS:', error.message);
        }
    }
    // 2. Try Local File Paths
    else {
        const pathsToCheck = [
            path.join(process.cwd(), 'config', 'google-credentials.json'),
            path.join(process.cwd(), 'server', 'config', 'google-credentials.json')
        ];

        for (const p of pathsToCheck) {
            if (fs.existsSync(p)) {
                clientConfig = { keyFilename: p };
                credentialsSource = 'file';
                // console.log('Using Vision credentials from file:', p);
                break;
            }
        }
    }

    if (credentialsSource === 'none') {
        console.warn('WARNING: No Google Cloud credentials found for Vision API.');
    }

    return {
        client: new vision.ImageAnnotatorClient(clientConfig),
        source: credentialsSource
    };
}

// Initialize client once
const { client, source: credentialsSource } = getVisionClient();

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
            request = { image: { content: imageSource.toString('base64') } };
        } else if (typeof imageSource === 'string' && imageSource.startsWith('gs://')) {
            request = { image: { source: { imageUri: imageSource } } };
        } else {
            request = { image: { source: { filename: imageSource } } };
        }

        const [result] = await client.textDetection(request);
        const detections = result.textAnnotations;

        if (!detections || detections.length === 0) {
            console.log('No text detected in image');
            return { success: true, text: '', confidence: 0, wordCount: 0 };
        }

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

        // CASE 1: Buffer
        if (Buffer.isBuffer(pdfSource)) {
            inputConfig.content = pdfSource.toString('base64');
        }
        // CASE 2: GCS URI
        else if (typeof pdfSource === 'string' && pdfSource.startsWith('gs://')) {
            inputConfig.gcsSource = { uri: pdfSource };
        }
        // CASE 3: File Path
        else if (typeof pdfSource === 'string') {
            try {
                const pdfBuffer = fs.readFileSync(pdfSource);
                inputConfig.content = pdfBuffer.toString('base64');
            } catch (fsError) {
                console.error('Failed to read PDF file from path:', pdfSource);
                throw fsError;
            }
        }

        const request = {
            requests: [{
                inputConfig: inputConfig,
                features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
            }]
        };

        const [result] = await client.batchAnnotateFiles(request);

        // Parse Response
        const fileResponses = result.responses?.[0]?.responses || [];
        console.log(`Vision returned ${fileResponses.length} page(s)`);

        let fullText = '';
        let pageCount = 0;

        for (let i = 0; i < fileResponses.length; i++) {
            const page = fileResponses[i];
            if (page.error) {
                console.warn(`Vision API Page ${i + 1} Error:`, page.error.message);
                continue;
            }

            const text = page.fullTextAnnotation?.text;
            if (text) {
                fullText += text + '\n';
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
    return {
        configured: credentialsSource !== 'none',
        mode: credentialsSource,
        status: credentialsSource !== 'none' ? 'ready' : 'missing_credentials'
    };
}
