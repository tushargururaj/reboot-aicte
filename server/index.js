import express from 'express';
import bodyParser from 'body-parser';
import db from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import submissionRoutes from './routes/submissionRoutes.js';
import jwtAuthMiddleware from './middleware/jwtAuthmiddleware.js';
import adminRoutes from './routes/adminRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cookieParser());
const PORT = process.env.PORT || 3000;


// if you need cookies/sessions → set credentials: true and same on frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",   // your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,                 // only if you use cookies/auth headers
  })
);

// db is already connected in config/db.js

}

export default app;