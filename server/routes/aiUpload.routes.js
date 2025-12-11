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
    try {
        let processingInput = {};

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
