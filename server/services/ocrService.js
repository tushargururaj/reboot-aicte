// OCR Service - Uses Google Cloud Vision API with Tesseract.js fallback
import Tesseract from 'tesseract.js';
import path from 'path';

// Import Google Cloud Vision service
import { extractTextWithVision, extractTextFromPDFWithVision } from './visionService.js';

/**
 * Extract text from image using Tesseract OCR (fallback)
 */
async function extractTextFromImageTesseract(imageSource) {
    try {
        const isBuffer = Buffer.isBuffer(imageSource);
        console.log(`Starting Tesseract OCR for ${isBuffer ? 'Buffer' : 'image file'}`);

        const result = await Tesseract.recognize(
            imageSource,
            'eng',
            { logger: info => { /* minimal logging */ } }
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
        console.error('Tesseract OCR Error:', error.message);
        return { success: false, error: error.message, text: '' };
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

        // 1. Try Google Cloud Vision first (Primary)
        try {
            const visionSource = gcsUri || buffer || filePath;

            if (isPdf) {
                result = await extractTextFromPDFWithVision(visionSource);
            } else {
                result = await extractTextWithVision(visionSource);
            }

            if (result.success && result.text && result.text.length > 10) {
                result.text = cleanExtractedText(result.text);
                console.log('========== OCR SUCCESS (Vision) ==========');
                return result;
            }
        } catch (visionError) {
            console.warn('Google Vision API failed:', visionError.message);
        }

        // 2. Fallback to Tesseract (Images Only)
        // Note: PDF fallback (pdfjs-dist) is disabled/removed as per requirements
        if (isPdf) {
            return {
                success: false,
                error: 'PDF processing failed (Vision API error). Fallback disabled for PDFs.',
                text: ''
            };
        }

        // Check if we have a valid source for Tesseract (local file or buffer)
        const fallbackSource = buffer || filePath;
        if (!fallbackSource) {
            return {
                success: false,
                error: 'OCR failed and no local source available for Tesseract fallback.',
                text: ''
            };
        }

        console.log('Using fallback OCR (Tesseract)...');
        result = await extractTextFromImageTesseract(fallbackSource);

        if (result.success && result.text) {
            result.text = cleanExtractedText(result.text);
        }

        console.log('========== OCR COMPLETE (Fallback) ==========');
        return result;

    } catch (error) {
        console.error('File processing error:', error);
        return { success: false, error: error.message, text: '' };
    }
}

/**
 * Clean and normalize extracted text
 */
function cleanExtractedText(text) {
    return text
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s\-.,:/()@#&]/g, '')
        .replace(/\n\s*\n/g, '\n')
        .trim();
}

/**
 * Validate OCR quality
 */
function validateOCRQuality(ocrResult) {
    const { text, confidence, wordCount } = ocrResult;
    const issues = [];

    if (confidence < 0.6) issues.push('Low OCR confidence.');
    if (wordCount < 10) issues.push('Very little text detected.');
    if (!text || text.length < 50) issues.push('Insufficient text extracted.');

    return {
        isValid: issues.length === 0,
        issues: issues,
        quality: confidence >= 0.8 ? 'good' : confidence >= 0.6 ? 'fair' : 'poor'
    };
}

export {
    extractTextFromImageTesseract as extractTextFromImage,
    processCertificateFile,
    validateOCRQuality
};
