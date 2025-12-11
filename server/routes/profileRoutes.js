import express from "express";
import db from "../config/db.js";
import multer from "multer";
import { bucket } from "../config/gcs.js";

const router = express.Router();

// Memory storage for image upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// GET /profile - Fetch profile details
router.get("/", async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch profile joined with user data (in case profile doesn't exist yet)
        const result = await db.query(
            `SELECT 
        u.name as user_name, 
        u.email as user_email,
        p.* 
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const data = result.rows[0];

        // Construct response object
        const profile = {
            name: data.full_name || data.user_name,
            email: data.official_email || data.user_email,
            designation: data.designation || "",
            department: data.department || "",
            phone: data.phone_number || "",
            experience: data.total_experience || 0,
            phdStatus: "Completed (2020)", // Hardcoded for now as per schema request not having it, or we can add it
            profileImage: data.profile_image_url,
            joinedYear: data.joined_year || new Date().getFullYear(),
        };

        res.json(profile);
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// PUT /profile - Update profile details
router.put("/", async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, designation, department, phone, experience, joinedYear } = req.body;

        // Sanitize inputs
        // Sanitize inputs
        let experienceInt = parseInt(experience, 10);
        if (isNaN(experienceInt)) experienceInt = 0;

        let joinedYearInt = parseInt(joinedYear, 10);
        if (isNaN(joinedYearInt)) joinedYearInt = new Date().getFullYear();

        // Upsert profile
        const result = await db.query(
            `INSERT INTO profiles (user_id, full_name, official_email, designation, department, phone_number, total_experience, joined_year, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         full_name = EXCLUDED.full_name,
         official_email = EXCLUDED.official_email,
         designation = EXCLUDED.designation,
         department = EXCLUDED.department,
         phone_number = EXCLUDED.phone_number,
         total_experience = EXCLUDED.total_experience,
         joined_year = EXCLUDED.joined_year,
         updated_at = NOW()
       RETURNING *`,
            [userId, name, email, designation, department, phone, experienceInt, joinedYearInt]
        );

        res.json({ message: "Profile updated successfully", profile: result.rows[0] });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /profile/image - Upload profile image
router.post("/image", upload.single("image"), async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ error: "No image file provided" });
        }

        const fileOriginalName = req.file.originalname;
        const uniqueName = `profile-${userId}-${Date.now()}-${fileOriginalName.replace(/\s+/g, '_')}`;
        const blob = bucket.file(uniqueName);
        const blobStream = blob.createWriteStream({
            resumable: false,
        });

        await new Promise((resolve, reject) => {
            blobStream.on("error", (err) => reject(err));
            blobStream.on("finish", () => resolve());
            blobStream.end(req.file.buffer);
        });

        // Generate signed URL (or public URL if bucket is public, but signed is safer)
        // For profile images, usually we want a long-lived signed URL or just serve via an endpoint.
        // Let's store the GCS object name and serve via a proxy endpoint or generate a signed URL on fetch.
        // The schema says "profile_image_url", so let's store the object name for now and we can resolve it on fetch.
        // Wait, the schema says URL. Let's generate a signed URL with long expiry or just store the object name.
        // Storing object name is better for management.

        // Update profile with image reference
        await db.query(
            `INSERT INTO profiles (user_id, full_name, official_email, profile_image_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET profile_image_url = $4`,
            [userId, "Temp Name", "temp@email.com", uniqueName] // Fallback values if inserting new
        );

        res.json({ message: "Image uploaded successfully", image: uniqueName });
    } catch (err) {
        console.error("Error uploading image:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /profile/image/:filename - Serve profile image
router.get("/image/:filename", async (req, res) => {
    try {
        const { filename } = req.params;
        if (!filename || filename === 'null') return res.status(404).send("Not found");

        const options = {
            version: 'v4',
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000, // 1 hour
        };

        const [url] = await bucket.file(filename).getSignedUrl(options);
        res.redirect(url);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching image");
    }
});

export default router;
