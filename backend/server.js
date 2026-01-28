// backend/server.js

// 1. Load Environment Variables FIRST (Before any other import)
import 'dotenv/config'; 

import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

// 2. Import Database Connection
import connectDB from './config.js';

// 3. Import Routes (Now env vars are loaded, so this will work safely)
import router from './routes.js';
import { User } from './models.js';

// Connect to Database
connectDB();

const app = express();

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CORS CONFIGURATION (BEST PRACTICE) ---
// This allows the frontend (Vercel) to access the backend
app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// MAKE UPLOADS FOLDER STATIC
// Note: On serverless platforms (Vercel Backend), local uploads won't persist.
// Use Cloudinary/S3 for production file storage.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', router);

const port = process.env.PORT || 8080;

// --- SEED ADMIN USER ---
const seedAdmin = async () => {
    try {
        // Fetch credentials from .env
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        // Safety Check: Ensure env vars exist
        if (!adminEmail || !adminPassword) {
            console.log("⚠️  Warning: ADMIN_EMAIL or ADMIN_PASSWORD not found in .env. Skipping Admin seeding.");
            return;
        }

        const adminExists = await User.findOne({ isAdmin: true });
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            // Hash the password from .env
            const hashedPassword = await bcrypt.hash(adminPassword, salt); 
            
            const newAdmin = new User({
                name: "Super Admin",
                email: adminEmail,
                password: hashedPassword,
                isAdmin: true,
                isVerified: true, 
            });
            await newAdmin.save();
            console.log(`✅ Admin account created successfully: ${adminEmail}`);
        } else {
            // Optional: Log that admin already exists
            // console.log("Admin account already exists.");
        }
    } catch (error) {
        console.log("❌ Admin seeding failed", error);
    }
};

app.listen(port, () => {
    console.log(`Node Server Started on port ${port}`);
    seedAdmin();
});