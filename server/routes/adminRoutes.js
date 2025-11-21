import express from "express";
const router = express.Router();
import db from "../config/db.js";
import { calculateCAY } from "../utils/cay.js";
import path from "path";
import fs from "fs";


router.get("/download", (req, res) => {
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

router.get("/all-faculty", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name, email FROM users WHERE role='faculty'"
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


export default router;
