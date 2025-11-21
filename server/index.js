import express from 'express';
import bodyParser from 'body-parser';
import db from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import submissionRoutes from './routes/submissionRoutes.js';
import jwtAuthMiddleware from './middleware/jwtAuthmiddleware.js';
import adminRoutes from './routes/adminRoutes.js';
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(cookieParser());
const PORT = process.env.PORT || 3000;


// if you need cookies/sessions → set credentials: true and same on frontend
app.use(
  cors({
    origin: "http://localhost:5173",   // your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,                 // only if you use cookies/auth headers
  })
);

db.connect();

app.use(bodyParser.json());

const logRequest = (req, res, next) => {
  console.log(`[${new Date().toLocaleString()}] Request to : ${req.originalUrl}`);
  next();
};

app.use(logRequest);
// Serve uploaded proof files directly from the uploads directory so frontend can
// download them via /uploads/<filename>. This expects uploads to be placed in
// the repository's `uploads/` folder (multer configured with '../uploads').
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));
app.get('/', async (req, res) => {
  res.send('Welcome to HelpHub! Your One Stop solutions to all your problems. :)');
});

app.use('/auth', authRoutes);
app.use('/submissions', jwtAuthMiddleware, submissionRoutes);
app.use('/admin', jwtAuthMiddleware, adminRoutes);

app.listen(PORT, () => {
  console.log(`Listening to API at port ${PORT}`);
});