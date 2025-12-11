// OCR Service - Uses Google Cloud Vision API with Tesseract.js fallback
import Tesseract from 'tesseract.js';
import fs from 'fs/promises';
import path from 'path';

// Import pdfjs-dist (ESM)
// Note: We use the legacy build to support Node.js environment better
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Import Google Cloud Vision service
import { extractTextWithVision, extractTextFromPDFWithVision } from './visionService.js';

/**
 * Extract text from image using Tesseract OCR (fallback)
 */
async function extractTextFromImageTesseract(imagePath) {
    // ... existing tesseract code ...
    try {
        console.log('Starting Tesseract OCR for image:', imagePath);

        const result = await Tesseract.recognize(
            imagePath,
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
async function extractTextFromPDFFallback(pdfPath) {
    try {
        console.log('Extracting text from PDF with pdfjs-dist:', pdfPath);

        const dataBuffer = await fs.readFile(pdfPath);

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
