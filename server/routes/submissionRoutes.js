import db from "../config/db.js";
import multer from "multer";
import express from "express";
import path from "path";
import fs from "fs";

const router = express.Router();


const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(process.cwd(), "uploads"));
    },
    filename: function (req, file, cb) {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e5);
      cb(null, unique);  // store only the random name
    }
  })
});


router.get("/file-by-path", (req, res) => {
  try {
    const fileName = req.query.p;      // stored DB filename ONLY
    const displayName = req.query.name || fileName;

    if (!fileName) return res.status(400).send("Missing filename");

    const absolute = path.join(process.cwd(), "uploads", fileName);
    console.log("Downloading:", absolute);

    if (!fs.existsSync(absolute)) {
      return res.status(404).send("File not found");
    }

    return res.download(absolute, displayName); // clean, automatic download
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/* ------------------------
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
    console.log(req.file)
    const fileStoredName = req.file ? req.file.filename : null;
    const fileOriginalName = req.file ? req.file.originalname : null;

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

export default router;
