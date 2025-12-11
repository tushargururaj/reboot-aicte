// AI Upload Routes - Intelligent Certificate Processing
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import db from '../config/db.js';
import { processCertificateFile } from '../services/ocrService.js';
import { analyzeCertificateWithAI, getSupportedTypes } from '../services/ai.service.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/certificates';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'cert-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
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

import { bucket } from '../config/gcs.js';

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

            // Clean up the temporary file if it still exists
            if (filePath && fs.existsSync(filePath)) {
                // Move to permanent storage (uploads/ root to match standard uploads)
                const permanentDir = 'uploads';
                // Note: Our multer config puts temp files in 'uploads/certificates'
                // Standard manual uploads go to 'uploads/' directly (see submissionRoutes.js)

                // We need to move it up one level from 'uploads/certificates' to 'uploads'
                if (!fs.existsSync(permanentDir)) {
                    fs.mkdirSync(permanentDir, { recursive: true });
                }

                const permanentPath = path.join(permanentDir, path.basename(filePath));
                fs.renameSync(filePath, permanentPath);
                console.log('Moved file to permanent storage:', permanentPath);
            }

            res.json({
                success: true,
                message: 'Certificate data saved successfully',
                record: result.rows[0],
                sectionCode: sectionCode
            });

        } catch (error) {
            console.error('Confirm error:', error);
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
