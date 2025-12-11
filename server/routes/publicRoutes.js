import express from "express";
import db from "../config/db.js";
import multer from "multer";
import { bucket } from "../config/gcs.js";

const router = express.Router();

// Memory storage for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// 1. Verify Token & Get Details
router.get("/magic-link/:token", async (req, res) => {
    try {
        const { token } = req.params;

        const result = await db.query(
            `SELECT m.*, u.name as faculty_name, u.email as faculty_email 
       FROM magic_links m 
       JOIN users u ON m.faculty_id = u.id 
       WHERE m.token = $1`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Invalid or expired link" });
        }

        const linkData = result.rows[0];

        // Check expiry
        if (new Date() > new Date(linkData.expires_at)) {
            return res.status(410).json({ error: "This link has expired" });
        }

        // Check if already used
        if (linkData.is_used) {
            return res.status(410).json({ error: "This link has already been used" });
        }

        res.json({
            valid: true,
            facultyName: linkData.faculty_name,
            sectionCode: linkData.section_code,
            facultyId: linkData.faculty_id
        });

    } catch (err) {
        console.error("Magic Link Verify Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// 2. Submit Data via Magic Link
router.post("/submit-magic", upload.single("file"), async (req, res) => {
    try {
        const { token, payload } = req.body;
        const submissionData = JSON.parse(payload);

        // Verify token again
        const linkResult = await db.query("SELECT * FROM magic_links WHERE token = $1", [token]);
        if (linkResult.rows.length === 0) return res.status(403).json({ error: "Invalid token" });

        const linkData = linkResult.rows[0];
        if (new Date() > new Date(linkData.expires_at)) return res.status(410).json({ error: "Link expired" });
        if (linkData.is_used) return res.status(410).json({ error: "Link already used" });

        const userId = linkData.faculty_id;
        const sectionCode = linkData.section_code;

        // File Upload Logic (Reused)
        let fileStoredName = null;
        const fileOriginalName = req.file ? req.file.originalname : null;

        if (req.file) {
            const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e5) + "-" + fileOriginalName.replace(/\s+/g, '_');
            const blob = bucket.file(uniqueName);
            await blob.save(req.file.buffer, { resumable: false });
            fileStoredName = uniqueName;
        }

        // Insert Logic (Simplified mapping)
        // Note: In a real app, I'd refactor the insert logic from submissionRoutes into a shared helper.
        // For now, I'll duplicate the specific insert for the supported sections to ensure isolation.

        let result;
        if (sectionCode === "6.1.1.1") {
            result = await db.query(
                `INSERT INTO prof_memberships (faculty_id, academic_year, society_name, grade_level, brief_description, proof_document, proof_filename) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
                [userId, submissionData.academicYear, submissionData.societyName, submissionData.gradeOrPosition, submissionData.contributionSummary, fileStoredName, fileOriginalName]
            );
        } else if (sectionCode === "6.1.2.1.1") {
            result = await db.query(
                `INSERT INTO resource_person (faculty_id, academic_year, role, event_name, date, event_type, mode, duration_days, organizer, location, brief_description, proof_document, proof_filename) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
                [userId, submissionData.academicYear, submissionData.role, submissionData.programTitle, submissionData.date, submissionData.eventType, submissionData.mode, submissionData.durationDays, submissionData.organizer, submissionData.location, submissionData.description, fileStoredName, fileOriginalName]
            );
        } else if (sectionCode === "6.1.2.2.1") {
            result = await db.query(
                `INSERT INTO fdp (faculty_id, academic_year, level, program_name, date, event_type, mode, duration_days, organizer, location, certificate_number, brief_reflection, proof_document, proof_filename) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
                [userId, submissionData.academicYear, submissionData.level, submissionData.programTitle, submissionData.date, submissionData.eventType, submissionData.mode, submissionData.durationDays, submissionData.organizer, submissionData.location, submissionData.certificateNo, submissionData.description, fileStoredName, fileOriginalName]
            );
        } else if (sectionCode === "6.1.4.1") {
            result = await db.query(
                `INSERT INTO mooc_course (faculty_id, academic_year, course_name, duration_weeks, grade_obtained, offering_institute, remarks, proof_document, proof_filename) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
                [userId, submissionData.academicYear, submissionData.courseName, submissionData.weeks, submissionData.grade, submissionData.offeringInstitute, submissionData.remarks, fileStoredName, fileOriginalName]
            );
        }

        // Mark token as used
        await db.query("UPDATE magic_links SET is_used = TRUE WHERE token = $1", [token]);

        res.json({ success: true, message: "Submitted successfully via Magic Link!" });

    } catch (err) {
        console.error("Magic Submit Error:", err);
        res.status(500).json({ error: "Server error during submission" });
    }
});

export default router;
