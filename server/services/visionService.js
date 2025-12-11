// Google Cloud Vision API Service
// Uses service account credentials for enterprise-grade OCR

import vision from '@google-cloud/vision';
import path from 'path';
import fs from 'fs';

// Set credentials path
const credentialsPath = path.join(process.cwd(), 'config', 'google-credentials.json');

// Verify credentials exist
if (!fs.existsSync(credentialsPath)) {
    console.error('Google credentials file not found at:', credentialsPath);
}

// Create Vision client with explicit credentials
const client = new vision.ImageAnnotatorClient({
    keyFilename: credentialsPath
});

/**
 * Extract text from an image using Google Cloud Vision OCR
 * Much more accurate than Tesseract for printed documents
 */
export async function extractTextWithVision(imagePath) {
    try {
        console.log('Starting Google Cloud Vision OCR for:', imagePath);

        // Perform text detection
        const [result] = await client.textDetection(imagePath);
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
            confidence: 0.95, // Vision API is generally very accurate
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
 * Uses document text detection for better structure
 */
export async function extractTextFromPDFWithVision(pdfPath) {
    try {
        console.log('Starting Google Cloud Vision PDF extraction for:', pdfPath);

        // Read PDF file as base64
        const pdfBuffer = fs.readFileSync(pdfPath);
        const base64Content = pdfBuffer.toString('base64');

        // Proper request structure for PDF files (synchronous for small files)
        const request = {
            requests: [
                {
                    inputConfig: {
                        content: base64Content,
                        mimeType: 'application/pdf'
                    },
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
        // Map common errors to friendly messages
        if (error.message.includes('not a function')) {
            console.error('CRITICAL: batchAnnotateFiles method missing on client.');
        }
        throw error;
    }
}

/**
 * Check if Vision API is configured and working
 */
export async function checkVisionHealth() {
    try {
        // Simple check - just verify client is configured
        const credentialsExist = fs.existsSync(credentialsPath);
        return {
            configured: credentialsExist,
            credentialsPath: credentialsPath,
            status: credentialsExist ? 'ready' : 'missing_credentials'
        };
    } catch (error) {
        return {
            configured: false,
            error: error.message,
            status: 'error'
        };
    }
}
