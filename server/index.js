import './config/polyfills.js';
import express from 'express';
import bodyParser from 'body-parser';
import db from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import submissionRoutes from './routes/submissionRoutes.js';
import jwtAuthMiddleware from './middleware/jwtAuthmiddleware.js';
import adminRoutes from './routes/adminRoutes.js';
import aiUploadRoutes from './routes/aiUpload.routes.js';
import profileRoutes from './routes/profileRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cookieParser());
const PORT = process.env.PORT || 3000;


// if you need cookies/sessions → set credentials: true and same on frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173" || "http://localhost:5174",   // your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,                 // only if you use cookies/auth headers
  })
);

// db is already connected in config/db.js

app.use(bodyParser.json());

app.get('/', async (req, res) => {
  res.send('Welcome to HelpHub! Your One Stop solutions to all your problems. :)');
});

app.use('/api/auth', authRoutes);
app.use('/api/submissions', jwtAuthMiddleware, submissionRoutes);

app.use('/api/ai-upload', aiUploadRoutes);
// Public health check for AI upload
app.get('/api/ai-upload-health', (req, res) => {
  res.json({ status: 'ok', service: 'AI Upload', timestamp: new Date().toISOString() });
});
app.use('/api/profile', jwtAuthMiddleware, profileRoutes);
app.use('/api/admin', jwtAuthMiddleware, adminRoutes);
app.use('/api/public', publicRoutes);

// Only listen if not running in Vercel (serverless)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Listening to API at port ${PORT}`);
  });
}

export default app;