import db from "../config/db.js";
import multer from "multer";
import express from "express";
import { bucket } from "../config/gcs.js";

const router = express.Router();

// Use memory storage to keep file in buffer before uploading to GCS
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});



router.get("/file-by-path", async (req, res) => {
  try {
    const fileName = req.query.p;      // stored DB filename ONLY
    const displayName = req.query.name || fileName;

    if (!fileName) return res.status(400).send("Missing filename");

    console.log("Generating signed URL for:", fileName);

    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      promptSaveAs: displayName // Optional: hints the browser to save as this name
    };

    const [url] = await bucket.file(fileName).getSignedUrl(options);

    // Redirect the user to the signed URL
    res.redirect(url);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/* ------------------------
   FETCH MY SUBMISSIONS
   FETCH MY SUBMISSIONS
------------------------- */
router.get("/mysubmissions", async (req, res) => {
  try {
    const userId = req.user.id;

    const [memberships, sttp, fdp, certs] = await Promise.all([
      db.query(
        "SELECT *, '6.1.1.1' AS section_code, society_name AS title FROM prof_memberships WHERE faculty_id=$1",
        [userId]
      ),
      db.query(
        "SELECT *, '6.1.2.1.1' AS section_code, event_name AS title, date FROM resource_person WHERE faculty_id=$1",
        [userId]
      ),
      db.query(
        "SELECT *, '6.1.2.2.1' AS section_code, program_name AS title, date FROM fdp WHERE faculty_id=$1",
        [userId]
      ),
      db.query(
        "SELECT *, '6.1.4.1' AS section_code, course_name AS title FROM mooc_course WHERE faculty_id=$1",
        [userId]
      )
    ]);

    const all = [...memberships.rows, ...sttp.rows, ...fdp.rows, ...certs.rows];

    const submissions = all.map((row) => ({
      id: row.id,
      title: row.title,
      code: row.section_code,
      date: row.date
        ? new Date(row.date).toISOString().split("T")[0]
        : "N/A",
      academic_year: row.academic_year, // Include academic year
      file: row.proof_document,     // stored filename
      file_name: row.proof_filename, // original shown name
      status: "Submitted"
    }));

    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

/* ------------------------
   SUBMIT + FILE UPLOAD
------------------------- */
router.post("/submit", upload.single("file"), async (req, res) => {
  try {
    let result;
    const submissionData = JSON.parse(req.body.payload);
    const userId = req.body.userId;
    const sectionCode = req.body.sectionCode;

    let fileStoredName = null;
    const fileOriginalName = req.file ? req.file.originalname : null;

    // Upload to GCS if file exists
    if (req.file) {
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e5) + "-" + fileOriginalName.replace(/\s+/g, '_');
      const blob = bucket.file(uniqueName);
      const blobStream = blob.createWriteStream({
        resumable: false,
      });

      await new Promise((resolve, reject) => {
        blobStream.on("error", (err) => reject(err));
        blobStream.on("finish", () => {
          fileStoredName = uniqueName;
          resolve();
        });
        blobStream.end(req.file.buffer);
      });
    }

    /* ----------- INSERTS ---------- */
    if (sectionCode === "6.1.1.1") {
      result = await db.query(
        `INSERT INTO prof_memberships 
         (faculty_id, academic_year, society_name, grade_level,
          brief_description, proof_document, proof_filename)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [
          userId,
          submissionData.academicYear,
          submissionData.societyName,
          submissionData.gradeOrPosition,
          submissionData.contributionSummary,
          fileStoredName,
          fileOriginalName
        ]
      );
    }

    else if (sectionCode === "6.1.2.1.1") {
      result = await db.query(
        `INSERT INTO resource_person 
         (faculty_id, academic_year, role, event_name, date,
          event_type, mode, duration_days, organizer, location, brief_description,
          proof_document, proof_filename)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
        [
          userId,
          submissionData.academicYear,
          submissionData.role,
          submissionData.programTitle,
          submissionData.date,
          submissionData.eventType,
          submissionData.mode,
          submissionData.durationDays,
          submissionData.organizer,
          submissionData.location,
          submissionData.description,
          fileStoredName,
          fileOriginalName
        ]
      );
    }

    else if (sectionCode === "6.1.2.2.1") {
      result = await db.query(
        `INSERT INTO fdp
         (faculty_id, academic_year, level, program_name, date,
          event_type, mode, duration_days, organizer, location, certificate_number,
          brief_reflection, proof_document, proof_filename)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
        [
          userId,
          submissionData.academicYear,
          submissionData.level,
          submissionData.programTitle,
          submissionData.date,
          submissionData.eventType,
          submissionData.mode,
          submissionData.durationDays,
          submissionData.organizer,
          submissionData.location,
          submissionData.certificateNo,
          submissionData.description,
          fileStoredName,
          fileOriginalName
        ]
      );
    }

    else if (sectionCode === "6.1.4.1") {
      result = await db.query(
        `INSERT INTO mooc_course
         (faculty_id, academic_year, course_name, duration_weeks,
          grade_obtained, offering_institute,
         remarks, proof_document, proof_filename)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [
          userId,
          submissionData.academicYear,
          submissionData.courseName,
          submissionData.weeks,
          submissionData.grade,
          submissionData.offeringInstitute,
          submissionData.remarks,
          fileStoredName,
          fileOriginalName
        ]
      );
    }

    res.json({ response: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server issue" });
  }
});


/* ------------------------
   DELETE SUBMISSION
------------------------- */
router.delete("/:code/:id", async (req, res) => {
  try {
    const { code, id } = req.params;
    const userId = req.user.id;
    let tableName = "";

    if (code === "6.1.1.1") tableName = "prof_memberships";
    else if (code === "6.1.2.1.1") tableName = "resource_person";
    else if (code === "6.1.2.2.1") tableName = "fdp";
    else if (code === "6.1.4.1") tableName = "mooc_course";
    else return res.status(400).json({ error: "Invalid section code" });

    // First get the file name to delete from GCS
    const fileResult = await db.query(
      `SELECT proof_document FROM ${tableName} WHERE id=$1 AND faculty_id=$2`,
      [id, userId]
    );

    if (fileResult.rowCount === 0) {
      return res.status(404).json({ error: "Submission not found or unauthorized" });
    }

    const fileName = fileResult.rows[0].proof_document;

    const result = await db.query(
      `DELETE FROM ${tableName} WHERE id=$1 AND faculty_id=$2 RETURNING *`,
      [id, userId]
    );

    // Delete from GCS if exists
    if (fileName) {
      try {
        await bucket.file(fileName).delete();
        console.log(`Deleted GCS file: ${fileName}`);
      } catch (gcsErr) {
        console.error("Failed to delete file from GCS:", gcsErr);
        // Don't fail the request if GCS delete fails, but log it
      }
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
