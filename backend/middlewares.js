import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';

// --- AUTH MIDDLEWARE ---
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).send({ message: "Auth failed: No token provided", success: false });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Auth failed: Invalid token", success: false });
      }
      // Securely attach userId to the request object
      req.userId = decoded.id; 
      next();
    });
  } catch (error) {
    return res.status(401).send({ message: "Auth failed", success: false });
  }
};

// --- MULTER CONFIGURATION (FOR FILE UPLOADS) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Files will be saved in 'uploads' folder
    },
    filename: (req, file, cb) => {
        // Unique filename: Date + Original Name
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// File Filter (Optional: Allow only PDF and Images)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

export const uploadMiddleware = multer({ 
    storage: storage,
    fileFilter: fileFilter 
});