import express from "express";
const router = express.Router();
import db from "../config/db.js";
import { calculateCAY } from "../utils/cay.js";
import path from "path";
import fs from "fs";


import { bucket } from "../config/gcs.js";

router.get("/download", async (req, res) => {
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
    res.status(500).send("Server error or file not found");
  }
});

router.get("/submissions/:id", async (req, res) => {
  try {
    const userId = req.params.id;

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
    console.error("Error in /submissions/:id:", err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// Delete Faculty
router.delete("/faculty/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM users WHERE id=$1 AND role='faculty'", [id]);
    res.json({ message: "Faculty deleted successfully" });
  } catch (err) {
    console.error("Error deleting faculty:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete Submission (Admin Override)
router.delete("/submission/:code/:id", async (req, res) => {
  try {
    const { code, id } = req.params;
    let table = "";
    if (code === "6.1.1.1") table = "prof_memberships";
    else if (code === "6.1.2.1.1") table = "resource_person";
    else if (code === "6.1.2.2.1") table = "fdp";
    else if (code === "6.1.4.1") table = "mooc_course";
    else return res.status(400).json({ error: "Invalid section code" });

    await db.query(`DELETE FROM ${table} WHERE id=$1`, [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Error deleting submission:", err);
    res.status(500).json({ error: "Failed to delete submission" });
  }
});

router.get("/all-faculty", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, p.phone_number 
       FROM users u 
       LEFT JOIN profiles p ON u.id = p.user_id 
       WHERE u.role='faculty'`
    );
    res.json({ faculty: result.rows });
  } catch (err) {
    console.error("Error fetching faculty:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/6.1.2.1.1", async (req, res) => {
  try {
    const { CAY, year1, year2, year3 } = calculateCAY();
    console.log("CAY Years:", CAY, year1, year2, year3);

    const [CAY_Data, CAYm1, CAYm2, CAYm3] = await Promise.all([
      db.query(`SELECT a.faculty_id, u.name AS faculty_name, a.event_name, a.date, a.location, a.organizer, a.proof_document, a.proof_filename FROM resource_person a JOIN users u ON a.faculty_id = u.id WHERE a.academic_year = $1;`, [CAY]),
      db.query(`SELECT a.faculty_id, u.name AS faculty_name, a.event_name, a.date, a.location, a.organizer, a.proof_document, a.proof_filename FROM resource_person a JOIN users u ON a.faculty_id = u.id WHERE a.academic_year = $1;`, [year1]),
      db.query(`SELECT a.faculty_id, u.name AS faculty_name, a.event_name, a.date, a.location, a.organizer, a.proof_document, a.proof_filename FROM resource_person a JOIN users u ON a.faculty_id = u.id WHERE a.academic_year = $1;`, [year2]),
      db.query(`SELECT a.faculty_id, u.name AS faculty_name, a.event_name, a.date, a.location, a.organizer, a.proof_document, a.proof_filename FROM resource_person a JOIN users u ON a.faculty_id = u.id WHERE a.academic_year = $1;`, [year3])
    ]);

    const mapRow = (row) => ({
      id: row.faculty_id,
      faculty_name: row.faculty_name,
      event_name: row.event_name,
      date: row.date ? new Date(row.date).toISOString().split('T')[0] : 'N/A',
      location: row.location,
      organizer: row.organizer,
      file: row.proof_document,
      file_name: row.proof_filename
    });

    res.json({
      CAY: CAY_Data.rows.map(mapRow),
      CAYm1: CAYm1.rows.map(mapRow),
      CAYm2: CAYm2.rows.map(mapRow),
      CAYm3: CAYm3.rows.map(mapRow)
    });
  } catch (err) {
    console.error("Error in /6.1.2.1.1:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/6.1.2.2.1", async (req, res) => {
  try {
    const { CAY, year1, year2, year3 } = calculateCAY();
    console.log("CAY Years:", CAY, year1, year2, year3);

    const [CAY_Data, CAYm1, CAYm2, CAYm3] = await Promise.all([
      db.query(`SELECT f.faculty_id, u.name AS faculty_name, f.program_name, f.date, f.duration_days, f.proof_document, f.proof_filename FROM fdp f JOIN users u ON f.faculty_id = u.id WHERE f.academic_year = $1;`, [CAY]),
      db.query(`SELECT f.faculty_id, u.name AS faculty_name, f.program_name, f.date, f.duration_days, f.proof_document, f.proof_filename FROM fdp f JOIN users u ON f.faculty_id = u.id WHERE f.academic_year = $1;`, [year1]),
      db.query(`SELECT f.faculty_id, u.name AS faculty_name, f.program_name, f.date, f.duration_days, f.proof_document, f.proof_filename FROM fdp f JOIN users u ON f.faculty_id = u.id WHERE f.academic_year = $1;`, [year2]),
      db.query(`SELECT f.faculty_id, u.name AS faculty_name, f.program_name, f.date, f.duration_days, f.proof_document, f.proof_filename FROM fdp f JOIN users u ON f.faculty_id = u.id WHERE f.academic_year = $1;`, [year3])
    ]);

    const calculateMarks = (duration) => {
      const days = parseInt(duration, 10) || 0;
      return days <= 5 ? 3 : 5;
    };

    const mapRow = (row) => ({
      id: row.faculty_id,
      faculty_name: row.faculty_name,
      program_name: row.program_name,
      date: row.date ? new Date(row.date).toISOString().split("T")[0] : "N/A",
      marks: calculateMarks(row.duration_days),
      file: row.proof_document,
      file_name: row.proof_filename,
    });

    res.json({
      CAY: CAY_Data.rows.map(mapRow),
      CAYm1: CAYm1.rows.map(mapRow),
      CAYm2: CAYm2.rows.map(mapRow),
      CAYm3: CAYm3.rows.map(mapRow)
    });
  } catch (err) {
    console.error("Error in /6.1.2.2.1:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/6.1.1.1", async (req, res) => {
  try {
    const { year1, year2, year3 } = calculateCAY();
    console.log("Querying prof_memberships with academic_year:", year1);
    const result = await db.query(
      `SELECT
    m.faculty_id,
    u.name AS faculty_name,
    m.society_name,
    m.grade_level,
    m.academic_year,
	m.proof_document,
	m.proof_filename
    FROM prof_memberships m
    JOIN users u ON m.faculty_id = u.id;`
      // Temporarily removed WHERE clause to see all data
      // WHERE m.academic_year = $1;`,
      // [year1]
    );
    console.log("Found", result.rows.length, "memberships for year", year1);
    if (result.rows.length > 0) {
      console.log("Sample row:", result.rows[0]);
    }
    const final = result.rows.map((row) => ({
      id: row.faculty_id,
      faculty_name: row.faculty_name,
      society_name: row.society_name,
      grade_level: row.grade_level,
      academic_year: row.academic_year,  // Include to see the format
      file: row.proof_document,
      file_name: row.proof_filename,
    }));

    res.json({ report: final });
  } catch (err) {
    console.error("Error in /6.1.1.1:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/6.1.4.1", async (req, res) => {
  try {
    const year1 = calculateCAY().year1;
    console.log("Querying mooc_course with academic_year:", year1);
    const result = await db.query(
      `SELECT
    c.faculty_id,
    u.name AS faculty_name,
    c.course_name,
    c.offering_institute AS agency,
    c.grade_obtained,
    c.academic_year,
	c.proof_document,
	c.proof_filename
FROM mooc_course c
JOIN users u ON c.faculty_id = u.id;`
      // Temporarily removed WHERE clause
    );
    console.log("Found", result.rows.length, "MOOC courses");
    const final = result.rows.map((row) => ({
      id: row.faculty_id,
      faculty_name: row.faculty_name,
      course_name: row.course_name,
      agency: row.agency,
      grade_obtained: row.grade_obtained,
      academic_year: row.academic_year,
      file: row.proof_document,
      file_name: row.proof_filename,
    }));
    res.json({ report: final });
  } catch (err) {
    console.error("Error in /6.1.4.1:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



// Analytics Endpoint
router.get("/analytics", async (req, res) => {
  try {
    const [facultyCount, memberships, resource, fdp, moocs] = await Promise.all([
      db.query("SELECT COUNT(*) FROM users WHERE role='faculty'"),
      db.query("SELECT COUNT(*) FROM prof_memberships"),
      db.query("SELECT COUNT(*) FROM resource_person"),
      db.query("SELECT COUNT(*) FROM fdp"),
      db.query("SELECT COUNT(*) FROM mooc_course")
    ]);

    const stats = {
      totalFaculty: parseInt(facultyCount.rows[0].count, 10),
      submissionCounts: [
        { name: "Memberships", count: parseInt(memberships.rows[0].count, 10) },
        { name: "Resource Person", count: parseInt(resource.rows[0].count, 10) },
        { name: "FDPs", count: parseInt(fdp.rows[0].count, 10) },
        { name: "MOOCs", count: parseInt(moocs.rows[0].count, 10) }
      ]
    };

    res.json(stats);
  } catch (err) {
    console.error("Error in /analytics:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Generate Magic Link
router.post("/generate-magic-link", async (req, res) => {
  try {
    const { facultyId, sectionCode } = req.body;

    // Generate a secure random token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Set expiry (e.g., 24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await db.query(
      "INSERT INTO magic_links (faculty_id, section_code, token, expires_at) VALUES ($1, $2, $3, $4)",
      [facultyId, sectionCode, token, expiresAt]
    );

    // Construct the full URL
    // Use FRONTEND_URL env var, or fallback to localhost for dev
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const magicLink = `${baseUrl}/portal/secure-entry/${token}`;

    res.json({ success: true, link: magicLink });
  } catch (err) {
    console.error("Error generating magic link:", err);
    res.status(500).json({ error: "Failed to generate link" });
  }
});

export default router;
