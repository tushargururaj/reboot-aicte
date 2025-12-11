// AI Upload Routes - Intelligent Certificate Processing
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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

/**
 * POST /api/ai-upload/process
 * Upload and process certificate with OCR + AI
 * Now uses intelligent content-based detection (no filename dependency)
 */
// ... existing imports ...
import { bucket } from '../config/gcs.js'; // Import bucket

// ... existing multer config ...

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
    if (req.is('application/json')) {
        return next();
    }

    // Otherwise, handle as Multer upload
    uploadMiddleware(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    error: 'File is too large',
                    hint: 'Please upload a file smaller than 10MB.'
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
    let tempFilePath = null;
    let cleanupCallback = null;

    try {
        // Handle GCS Direct Upload
        if (req.body.gcsPath) {
            console.log('Processing GCS file:', req.body.gcsPath);
            const gcsFile = bucket.file(req.body.gcsPath);

            // Download to temp file for processing
            const ext = path.extname(req.body.gcsPath);
            const tempDir = 'uploads/temp';
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            tempFilePath = path.join(tempDir, `temp-${Date.now()}${ext}`);

            console.log('Downloading from GCS to:', tempFilePath);
            await gcsFile.download({ destination: tempFilePath });

            // Set cleanup to delete local temp file
            cleanupCallback = () => {
                if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
            };

            // Mock req.file structure for downstream logic
            req.file = {
                originalname: path.basename(req.body.gcsPath),
                path: tempFilePath,
                mimetype: 'application/octet-stream', // We might not know exact type, but OCR handles it
                size: (await fs.promises.stat(tempFilePath)).size
            };
        }
        // Handle Multer Upload (Legacy/Fallback)
        else if (req.file) {
            tempFilePath = req.file.path;
            cleanupCallback = () => {
                if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
            };
        } else {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded',
                hint: 'Please select a file to upload.'
            });
        }

        console.log('Processing certificate:', req.file.originalname);

        // Step 1: Extract text using Tesseract OCR or PDF Parser
        console.log('Step 1: Running OCR/PDF Extraction...');
        const processingResult = await processCertificateFile(req.file.path);

        if (!processingResult.success) {
            const errorMessage = processingResult.error.includes('extract text')
                ? 'Text extraction failed'
                : 'Could not process file';

            throw new Error(errorMessage + ': ' + processingResult.error);
        }

        const ocrText = processingResult.text;

        if (!ocrText || ocrText.trim().length < 10) {
            // ... (existing empty text logic) ...
            const isPdf = req.file.originalname.toLowerCase().endsWith('.pdf');
            const hint = isPdf
                ? 'This PDF appears to be scanned or empty. Please verify it works, or try uploading a screenshot (PNG/JPG) of it instead.'
                : 'The image was too blurry or contained no readable text. Please try a clearer image.';

            return res.status(400).json({
                success: false,
                error: 'Could not extract sufficient text from the file.',
                hint: hint
            });
        }

        console.log('OCR extracted', ocrText.length, 'characters');

        // Step 2: Use AI to analyze content
        console.log('Step 2: Analyzing content with AI...');
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
            supportedTypes: getSupportedTypes()
        };

        if (!aiResult.isRecognized) {
            response.warning = 'Document type could not be confidently identified. Please review and select the correct type.';
        }

        console.log('Processing complete!');
        console.log('  - Detected Type:', aiResult.detectedType);

        // Cleanup temp file immediately if it was a GCS download
        if (req.body.gcsPath && cleanupCallback) {
            cleanupCallback();
        }
        // For local uploads, we might keep it for a bit or rely on the timeout (existing logic)
        // But to be safe and consistent, let's rely on the existing timeout logic for local files
        // OR just clean up now if we decide we don't need it locally anymore.
        // The confirm endpoint needs the file. 
        // If GCS, confirm endpoint should use GCS path.
        // If Local, confirm endpoint uses local path.

        // NOTE: The confirm endpoint logic needs to be checked. 
        // If we use GCS, the file is already in GCS. Confirm just needs to know that.
        // If we downloaded to temp, we deleted it. 
        // Wait, if confirm needs the file, we shouldn't delete it?
        // Actually, for GCS flow, the file is PERMANENTLY in GCS (well, in the bucket).
        // So we don't need the local temp file for confirm. 
        // We just pass the gcsPath to confirm.

        res.json(response);

    } catch (error) {
        console.error('Processing error:', error);
        if (cleanupCallback) cleanupCallback();

        res.status(500).json({
            success: false,
            error: 'Server encountered a problem',
            hint: 'Please try again later or upload a different file.'
        });
    }
});

/**
 * POST /api/ai-upload/confirm
 * Confirm and save the extracted data to database
 * Called after user reviews and optionally edits the extracted data
 */
router.post('/confirm', async (req, res) => {
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
        const fileStoredName = filePath ? path.basename(filePath) : null;
        // Use provided original filename or fall back to basename
        const fileOriginalName = originalFilename || fileStoredName;

        // Insert based on section code (matching submissionRoutes.js logic)
        if (sectionCode === '6.1.1.1') {
            // Professional Memberships
            result = await db.query(
                `INSERT INTO prof_memberships 
                 (faculty_id, academic_year, society_name, grade_level, brief_description, proof_document, proof_filename, ai_extracted)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *`,
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
                 (faculty_id, academic_year, role, event_name, date, event_type, mode, duration_days, organizer, location, brief_description, proof_document, proof_filename, ai_extracted)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true) RETURNING *`,
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
                 (faculty_id, academic_year, level, program_name, date, event_type, mode, duration_days, organizer, location, certificate_number, brief_reflection, proof_document, proof_filename, ai_extracted)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true) RETURNING *`,
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
                 (faculty_id, academic_year, course_name, duration_weeks, grade_obtained, offering_institute, remarks, proof_document, proof_filename, ai_extracted)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true) RETURNING *`,
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
