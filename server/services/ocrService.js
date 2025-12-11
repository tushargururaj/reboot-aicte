// OCR Service - Uses Google Cloud Vision API with Tesseract.js fallback
import Tesseract from 'tesseract.js';
import fs from 'fs/promises';
import path from 'path';

// Import pdfjs-dist (ESM)
// Note: We use the legacy build to support Node.js environment better
// Import pdfjs-dist (ESM)
// Note: We use the legacy build to support Node.js environment better
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createRequire } from 'module';

// Configure PDF.js worker for Node.js environment
const require = createRequire(import.meta.url);
try {
    // Explicitly resolve the worker path to ensure Vercel bundles it
    // and PDF.js can find it
    pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');
} catch (error) {
    console.warn('Warning: Could not resolve pdf.worker.mjs:', error);
}

// Import Google Cloud Vision service
import { extractTextWithVision, extractTextFromPDFWithVision } from './visionService.js';

/**
 * Extract text from image using Tesseract OCR (fallback)
 */
async function extractTextFromImageTesseract(imageSource) {
    try {
        const isBuffer = Buffer.isBuffer(imageSource);
        console.log(`Starting Tesseract OCR for ${isBuffer ? 'Buffer' : 'image file'}:`, isBuffer ? 'In-Memory' : imageSource);

        const result = await Tesseract.recognize(
            imageSource,
            'eng',
            {
                logger: info => {
                    if (info.status === 'recognizing text') {
                        console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
                    }
                }
            }
        );

        const extractedText = result.data.text.trim();
        const confidence = result.data.confidence;

        console.log('Tesseract OCR completed. Confidence:', confidence);

        return {
            success: true,
            text: extractedText,
            confidence: confidence / 100,
            wordCount: extractedText.split(/\s+/).length,
            source: 'tesseract'
        };

    } catch (error) {
        console.error('Tesseract OCR Error:', error);
        return {
            success: false,
            error: error.message,
            text: ''
        };
    }
}

/**
 * Extract text from PDF file using pdfjs-dist (fallback)
 */
async function extractTextFromPDFFallback(pdfSource) {
    try {
        const isBuffer = Buffer.isBuffer(pdfSource);
        console.log(`Extracting text from PDF with pdfjs-dist (${isBuffer ? 'Buffer' : 'File'}):`, isBuffer ? 'In-Memory' : pdfSource);

        let dataBuffer;
        if (isBuffer) {
            dataBuffer = pdfSource;
        } else {
            dataBuffer = await fs.readFile(pdfSource);
        }

        // Load PDF document
        const loadingTask = pdfjsLib.getDocument(new Uint8Array(dataBuffer));
        const doc = await loadingTask.promise;

        let fullText = "";

        // Iterate through all pages
        for (let i = 1; i <= doc.numPages; i++) {
            const page = await doc.getPage(i);
            const content = await page.getTextContent();

            // Extract text items and join them
            const pageText = content.items
                .map(item => item.str)
                .join(" ");

            fullText += pageText + "\n";
        }

        fullText = fullText.trim();
        console.log('PDF text extraction completed, pages:', doc.numPages);

        return {
            success: true,
            text: fullText,
            confidence: 0.95,
            wordCount: fullText.split(/\s+/).length,
            pageCount: doc.numPages,
            source: 'pdfjs-dist'
        };

    } catch (error) {
        console.error('PDF extraction error:', error);
        return {
            success: false,
            error: error.message,
            text: ''
        };
    }
}

/**
 * Process certificate file (auto-detect type and extract text)
 * Accepts object: { filePath, buffer, gcsUri, mimeType, originalName }
 */
async function processCertificateFile(input) {
    try {
        // Normalize input
        let filePath, buffer, gcsUri, mimeType, originalName;

        if (typeof input === 'string') {
            filePath = input;
            originalName = path.basename(input);
            mimeType = input.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
        } else {
            ({ filePath, buffer, gcsUri, mimeType, originalName } = input);
        }

        const ext = originalName ? path.extname(originalName).toLowerCase() : '';
        const isPdf = mimeType === 'application/pdf' || ext === '.pdf';
        let result;

        console.log('========== OCR PROCESSING START ==========');
        console.log('Input Type:', gcsUri ? 'GCS URI' : buffer ? 'Buffer' : 'File Path');
        console.log('Is PDF:', isPdf);

        // Try Google Cloud Vision first (better quality)
        try {
            // Determine source for Vision
            const visionSource = gcsUri || buffer || filePath;

            if (isPdf) {
                console.log('Attempting Google Vision PDF extraction...');
                result = await extractTextFromPDFWithVision(visionSource);
                console.log('Vision PDF Success! Extracted', result.text?.length || 0, 'characters');
            } else {
                console.log('Attempting Google Vision image OCR...');
                result = await extractTextWithVision(visionSource);
                console.log('Vision Image Success! Extracted', result.text?.length || 0, 'characters');
            }

            if (result.success && result.text && result.text.length > 10) {
                result.text = cleanExtractedText(result.text);
                console.log('========== OCR SUCCESS (Vision) ==========');
                return result;
            } else {
                console.warn('Vision returned insufficient text. Trying fallback...');
            }
        } catch (visionError) {
            console.warn('Google Vision API failed:', visionError.message);
            console.warn('Detailed error:', visionError);
        }

        // Fallback to Tesseract/pdfjs-dist if Vision fails
        // Note: Fallbacks might not support GCS URI directly without downloading
        if (gcsUri && !buffer && !filePath) {
            console.warn('Skipping fallback OCR because only GCS URI is available and Vision failed.');
            return {
                success: false,
                error: 'OCR failed and fallback unavailable for remote file.',
                text: ''
            };
        }

        const fallbackSource = buffer || filePath;

        console.log('Using fallback OCR method...');
        if (isPdf) {
            result = await extractTextFromPDFFallback(fallbackSource);
            console.log('Fallback PDF result:', result.success ? `${result.text?.length || 0} chars` : result.error);
        } else {
            result = await extractTextFromImageTesseract(fallbackSource);
            console.log('Fallback Tesseract result:', result.success ? `${result.text?.length || 0} chars` : result.error);
        }

        // Post-processing: clean up text
        if (result.success && result.text) {
            result.text = cleanExtractedText(result.text);
        }

        console.log('========== OCR COMPLETE ==========');
        console.log('Final Success:', result.success);
        console.log('Final Text Length:', result.text?.length || 0);
        return result;

    } catch (error) {
        console.error('File processing error:', error);
        return {
            success: false,
            error: error.message,
            text: ''
        };
    }
}

/**
 * Clean and normalize extracted text
 */
function cleanExtractedText(text) {
    return text
        // Remove excessive whitespace
        .replace(/\s+/g, ' ')
        // Remove special characters that might confuse AI
        .replace(/[^\w\s\-.,:/()@#&]/g, '')
        // Normalize line breaks
        .replace(/\n\s*\n/g, '\n')
        .trim();
}

/**
 * Validate OCR quality
 */
function validateOCRQuality(ocrResult) {
    const { text, confidence, wordCount } = ocrResult;

    const issues = [];

    if (confidence < 0.6) {
        issues.push('Low OCR confidence. Image quality may be poor.');
    }

    if (wordCount < 10) {
        issues.push('Very little text detected. Please ensure the certificate is clearly visible.');
    }

    if (!text || text.length < 50) {
        issues.push('Insufficient text extracted. This might be a scanned PDF. Please try converting it to an Image (PNG/JPG) and uploading again.');
    }

    return {
        isValid: issues.length === 0,
        issues: issues,
        quality: confidence >= 0.8 ? 'good' : confidence >= 0.6 ? 'fair' : 'poor'
    };
}

export {
    extractTextFromImageTesseract as extractTextFromImage,
    extractTextFromPDFFallback as extractTextFromPDF,
    processCertificateFile,
    validateOCRQuality
};
