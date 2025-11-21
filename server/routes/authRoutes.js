// server/routes/authRoutes.js (Updated)
import db from "../config/db.js";
const adminCoreKey = "shradhaforever"; // Note: This is unused locally in register logic

import express from 'express';
const router = express.Router();
import { generateToken } from "../utils/jwt.js";
import { encryptPassword, comparePassword } from "../utils/encryption.js";
import { verifyToken } from "../utils/jwt.js";


router.post("/register", async (req,res) => {
    console.log("Register endpoint hit");
    console.log(req.body);
    try{
        const data = req.body;

        // 🛑 FIX 1: Check if email/user already exists
        const existingUser = await db.query(
            "SELECT * FROM users WHERE email=$1",
            [data.email] // Check by email, as it's the unique identifier for login
        );
        if(existingUser.rows.length > 0){
            return res.status(400).json({error: "Email already registered."});
        }
        
        // Admin Key Check (Improved condition)
        if(data.role === "admin" && data.adminCoreKey !== adminCoreKey)
            return res.status(401).json({error: "Invalid Admin Core Key"});
        
        // Hashing and Insertion
        const hashedPassword = await encryptPassword(data.password);
        const result = await db.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
            [data.name, data.email, hashedPassword, data.role]
        );
        
        if(!result.rows || result.rows.length === 0){
            return res.status(500).json({error: "User registration failed :("});
        }
        
        const response = result.rows[0];

        // Do not return a token here, as the user still needs to log in
        console.log("User successfully registered!");
        // Frontend expects a success object, not a token
        res.status(200).json({ success: true, message: "Registration successful. Please log in." });

    } catch(err){
        console.error("Registration error:", err);
        res.status(500).json({error: "Internal server issue :("});
    }
});

router.post("/login", async (req,res) => {
    try{
        const data = req.body;
        const result = await db.query(
            "SELECT * FROM users WHERE email=$1",
            [data.email]
        );
        if(!result.rows || result.rows.length === 0){
            return  res.status(400).json({message: "Invalid credentials"}); // Changed error to message for frontend catch
        }
        const user = result.rows[0];
        const isMatch = await comparePassword(data.password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid credentials"}); // Changed error to message
        }

        // 🛑 FIX 2: Added 'role' to the payload for frontend redirection
        const payload = {
            id: user.id,
            email: user.email, 
            role: user.role, // Added 'role'
        };
        const token = generateToken(payload);
        
        console.log("User successfully logged in!");
        
        // Frontend expects a user object, which is sent here
        res.status(200).cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Set to true only in prod
            sameSite: "Lax",    
        }).json({ success: true, message: "Login successful", user: {
            id: user.id, name: user.name, email: user.email, role: user.role
        } });
    } catch(err){
        console.error("Login error:", err);
        res.status(500).json({error: "Internal server issue :("});
    }
});

router.get("/me", async (req,res) => {
    try{
        const token = req.cookies.token;
        console.log("Token from cookie:", token);
        if(!token){
            return res.status(401).json({error: "Unauthorized"});
        }
        
        const decoded = verifyToken(token);
        
        const result = await db.query(
            "SELECT id, name, email, role FROM users WHERE id=$1",
            [decoded.id]
        );
        
        if(!result.rows || result.rows.length === 0){
            return res.status(404).json({error: "User not found"});
        }
        
        res.status(200).json({user: result.rows[0]});
    } catch(err){
        console.error("Me endpoint error:", err);
        // Catch JWT expiry or other errors
        res.status(401).json({error: "Unauthorized or Session Expired"});
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",    
    });
    res.status(200).json({ message: "Logout successful" });
});

export default router;