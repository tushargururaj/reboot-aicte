// AI Upload Routes - Intelligent Certificate Processing
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import db from '../config/db.js';
import { processCertificateFile } from '../services/ocrService.js';
import { analyzeCertificateWithAI, getSupportedTypes } from '../services/ai.service.js';
import { bucket } from '../config/gcs.js';
import jwtAuthMiddleware from '../middleware/jwtAuthmiddleware.js';

const router = Router();

// Configure multer for file uploads
// We use memory storage to avoid writing to disk (Vercel read-only FS)
// For large files, we use direct-to-GCS upload, so this is a fallback/hybrid
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit (applied to memory uploads)
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|bmp|tiff/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, PNG, PDF, etc.) are allowed!'));
        }
    }
});

/**
 * GET /api/ai-upload/upload-url
 * Generate a Signed URL for direct-to-GCS upload
 */
router.get('/upload-url', async (req, res) => {
    try {
        const { filename, contentType } = req.query;

        if (!filename || !contentType) {
            return res.status(400).json({
                success: false,
                error: 'Missing filename or contentType'
            });
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(filename);
        const gcsFilename = `uploads/certificates/cert-${uniqueSuffix}${ext}`;
        const file = bucket.file(gcsFilename);

        // Generate Signed URL
        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            contentType: contentType,
        });

        res.json({
            success: true,
            uploadUrl: url,
            gcsPath: gcsFilename,
            filename: gcsFilename // Use this as the stored filename
        });

    } catch (error) {
        console.error('Signed URL error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate upload URL'
        });
    }
});

/**
 * POST /api/ai-upload/process
 * Upload and process certificate with OCR + AI
 * Supports both Multer (local/server upload) and GCS Direct Upload (gcsPath)
 */
const uploadMiddleware = upload.single('certificate');

router.post('/process', (req, res, next) => {
    // Check if this is a direct GCS processing request (JSON body)
    if (req.is('application/json') || req.headers['content-type']?.includes('application/json')) {
        return next();
    }

    // Otherwise, handle as Multer upload
    uploadMiddleware(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    error: 'File is too large',
                    hint: 'Please upload a file smaller than 50MB.'
                });
            }
            return res.status(400).json({
                success: false,
                error: 'File upload error',
                hint: err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                error: 'Invalid file format',
                hint: err.message
            });
        }
        next();
    });
}, async (req, res) => {
    // Log capturing mechanism
    const logs = [];
    const log = (...args) => {
        const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
        console.log(...args); // Keep server console log
        logs.push(`[${new Date().toISOString().split('T')[1].slice(0, -1)}] ${msg}`);
    };

    try {
        let processingInput = {};

        // 1. Handle GCS Direct Upload (Preferred for large files)
        if (req.body.gcsPath) {
            log('Processing GCS file:', req.body.gcsPath);
            // Construct GS URI: gs://bucket-name/path/to/file
            const gcsUri = `gs://${bucket.name}/${req.body.gcsPath}`;

            let mimeType = req.body.contentType;
            const ext = path.extname(req.body.gcsPath).toLowerCase();

            // Infer mimeType if missing or generic
            if (!mimeType || mimeType === 'application/octet-stream') {
                if (ext === '.pdf') mimeType = 'application/pdf';
                else if (['.jpg', '.jpeg'].includes(ext)) mimeType = 'image/jpeg';
                else if (ext === '.png') mimeType = 'image/png';
                else if (ext === '.gif') mimeType = 'image/gif';
                else if (ext === '.bmp') mimeType = 'image/bmp';
                else if (ext === '.tiff') mimeType = 'image/tiff';
            }

            processingInput = {
                gcsUri: gcsUri,
                originalName: path.basename(req.body.gcsPath),
                mimeType: mimeType || 'application/octet-stream'
            };

            // Mock req.file for response
            req.file = {
                originalname: path.basename(req.body.gcsPath),
                path: req.body.gcsPath, // Use GCS path as "path"
                mimetype: processingInput.mimeType,
                size: 0
            };
        }
        // 2. Handle Multer Memory Upload (Fallback for small files)
        else if (req.file) {
            log('Processing Multer file (Memory):', req.file.originalname);

            processingInput = {
                buffer: req.file.buffer,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype
            };
        } else {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded',
                hint: 'Please select a file to upload.',
                logs: logs
            });
        }

        log('Processing certificate:', req.file.originalname);

        // Step 1: Extract text using Tesseract OCR or PDF Parser
        log('Step 1: Running OCR/PDF Extraction...');
        const processingResult = await processCertificateFile(processingInput);

        if (!processingResult.success) {
            const errorMessage = processingResult.error.includes('extract text')
                ? 'Text extraction failed'
                : 'Could not process file';

            log('OCR Failed:', processingResult.error);
            throw new Error(errorMessage + ': ' + processingResult.error);
        }

        const ocrText = processingResult.text;

        if (!ocrText || ocrText.trim().length < 10) {
            const isPdf = req.file.originalname.toLowerCase().endsWith('.pdf');
            const hint = isPdf
                ? 'This PDF appears to be scanned or empty. Please verify it works, or try uploading a screenshot (PNG/JPG) of it instead.'
                : 'The image was too blurry or contained no readable text. Please try a clearer image.';

            log('Insufficient text extracted:', ocrText?.length || 0, 'chars');

            return res.status(400).json({
                success: false,
                error: 'Could not extract sufficient text from the file.',
                hint: hint,
                logs: logs
            });
        }

        log('OCR extracted', ocrText.length, 'characters');

        // Step 2: Use AI to analyze content
        log('Step 2: Analyzing content with AI...');
        const aiResult = await analyzeCertificateWithAI(ocrText);

        // Step 3: Prepare response
        const response = {
            success: true,
            isRecognized: aiResult.isRecognized,
            detectedType: aiResult.detectedType,
            typeConfidence: aiResult.typeConfidence,
            reason: aiResult.reason,
            certificateType: aiResult.tableDisplayName,
            tableName: aiResult.tableName,
            sectionCode: aiResult.sectionCode,
            extracted: aiResult.extractedFields,
            fieldConfidence: aiResult.fieldConfidence,
            overallConfidence: aiResult.overallConfidence,
            missingRequired: aiResult.missingRequired || [],
            ocrTextLength: ocrText.length,
            filename: req.file.originalname,
            filePath: req.body.gcsPath || req.file.path, // Return GCS path if available, else local
            supportedTypes: getSupportedTypes(),
            logs: logs
        };

        if (!aiResult.isRecognized) {
            response.warning = 'Document type could not be confidently identified. Please review and select the correct type.';
            log('AI Warning:', response.warning);
        }

        log('Processing complete!');
        log('  - Detected Type:', aiResult.detectedType);

        res.json(response);

    } catch (error) {
        console.error('Processing error:', error);
        // Add error to logs
        if (typeof logs !== 'undefined') {
            logs.push(`[ERROR] ${error.message}`);
            if (error.stack) logs.push(error.stack.split('\n')[1]);
        }

        res.status(500).json({
            success: false,
            error: 'Server encountered a problem',
            hint: 'Please try again later or upload a different file.',
            logs: typeof logs !== 'undefined' ? logs : [error.message]
        });
    }
});

/**
 * POST /api/ai-upload/confirm
 * Confirm and save the extracted data to database
 * Called after user reviews and optionally edits the extracted data
 */
router.post('/confirm', jwtAuthMiddleware, async (req, res) => {
    try {
        const { userId, sectionCode, data, filePath, originalFilename } = req.body;

        if (!userId || !sectionCode || !data) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, sectionCode, data'
            });
        }

        console.log('Confirming submission for section:', sectionCode);
        console.log('User ID:', userId);

        let result;
        // Store the FULL GCS path (e.g., uploads/certificates/file.pdf)
        // Do NOT use path.basename() as that strips the directory
        const fileStoredName = filePath || null;

        // Use provided original filename or fall back to basename of path
        const fileOriginalName = originalFilename || (filePath ? path.basename(filePath) : null);

        // Insert based on section code (matching submissionRoutes.js logic)
        if (sectionCode === '6.1.1.1') {
            // Professional Memberships
            result = await db.query(
                `INSERT INTO prof_memberships 
                 (faculty_id, academic_year, society_name, grade_level, brief_description, proof_document, proof_filename)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [
                    userId,
                    data.academic_year || getCurrentAcademicYear(),
                    data.society_name || data.program_name,
                    data.grade_level || data.grade_obtained,
                    data.brief_description || `AI extracted from certificate`,
                    fileStoredName,
                    fileOriginalName
                ]
            );
        } else if (sectionCode === '6.1.2.1.1') {
            // Resource Person
            result = await db.query(
                `INSERT INTO resource_person 
                 (faculty_id, academic_year, role, event_name, date, event_type, mode, duration_days, organizer, location, brief_description, proof_document, proof_filename)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
                [
                    userId,
                    data.academic_year || getCurrentAcademicYear(),
                    data.role || 'Resource Person',
                    data.program_name || data.event_name,
                    data.start_date || data.date,
                    data.event_type || 'Workshop',
                    data.mode || 'Offline',
                    data.duration_days || 1,
                    data.organizer,
                    data.location,
                    data.brief_description || `AI extracted from certificate`,
                    fileStoredName,
                    fileOriginalName
                ]
            );
        } else if (sectionCode === '6.1.2.2.1') {
            // FDP
            result = await db.query(
                `INSERT INTO fdp
                 (faculty_id, academic_year, level, program_name, date, event_type, mode, duration_days, organizer, location, certificate_number, brief_reflection, proof_document, proof_filename)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
                [
                    userId,
                    data.academic_year || getCurrentAcademicYear(),
                    data.level || 'National',
                    data.program_name,
                    data.start_date || data.date,
                    data.event_type || 'FDP',
                    data.mode || 'Offline',
                    data.duration_days || 1,
                    data.organizer,
                    data.location,
                    data.certificate_number,
                    data.brief_reflection || `AI extracted from certificate`,
                    fileStoredName,
                    fileOriginalName
                ]
            );
        } else if (sectionCode === '6.1.4.1') {
            // MOOC Course
            result = await db.query(
                `INSERT INTO mooc_course
                 (faculty_id, academic_year, course_name, duration_weeks, grade_obtained, offering_institute, remarks, proof_document, proof_filename)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
                [
                    userId,
                    data.academic_year || getCurrentAcademicYear(),
                    data.program_name || data.course_name,
                    data.duration_weeks || Math.ceil((data.duration_days || 7) / 7),
                    data.grade_obtained,
                    data.organizer || data.offering_institute,
                    data.remarks || `AI extracted from certificate`,
                    fileStoredName,
                    fileOriginalName
                ]
            );
        } else {
            return res.status(400).json({
                success: false,
                error: 'Invalid section code: ' + sectionCode
            });
        }

        console.log('Successfully inserted into database');

        res.json({
            success: true,
            message: 'Certificate data saved successfully',
            record: result.rows[0],
            sectionCode: sectionCode
        });

    } catch (error) {
        console.error('Confirm error:', error);

        // Handle specific DB errors
        if (error.code === '23502') { // NOT NULL violation
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                hint: 'Please ensure all required fields are filled before confirming.',
                details: error.detail || error.message
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to save data'
        });
    }
});

/**
 * GET /api/ai-upload/types
 * Get all supported certificate types
 */
router.get('/types', (req, res) => {
    res.json({
        success: true,
        types: getSupportedTypes()
    });
});

/**
 * GET /api/ai-upload/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'AI Upload (Intelligent)',
        ocr: 'Tesseract.js',
        ai: 'Google Gemini',
        features: ['content-based-detection', 'auto-extraction', 'database-integration'],
        timestamp: new Date().toISOString()
    });
});

/**
 * Helper: Get current academic year in YYYY-YY format
 */
function getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 0-indexed

    // Academic year starts in July
    if (month >= 7) {
        return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
        return `${year - 1}-${year.toString().slice(-2)}`;
    }
}

export default router;
