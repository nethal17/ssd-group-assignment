import express from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import { User } from "../models/user.js";
import dotenv from "dotenv";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireSelfOrAdmin } from "../middleware/ownership.js";
import { fileTypeFromBuffer } from "file-type";

dotenv.config();

const photoRouter = express.Router();
const storage = multer.memoryStorage();

// Multer configured with limits and MIME check
const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // 2MB limit, 1 file
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and WEBP are allowed."), false);
    }
  }
});

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper middleware to handle multer errors cleanly
const uploadSingle = (req, res, next) => {
  upload.single("profilePic")(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: "File upload error", details: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// Upload profile picture (Protected by authMiddleware and requireSelfOrAdmin)
photoRouter.post("/upload-profile-pic/:userId", authMiddleware, requireSelfOrAdmin("userId"), uploadSingle, async (req, res) => {
    try {
      const { userId } = req.params;
      const file = req.file;
  
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Magic bytes check using file-type
      const fileType = await fileTypeFromBuffer(file.buffer);
      if (!fileType || !['image/jpeg', 'image/png', 'image/webp'].includes(fileType.mime)) {
        return res.status(400).json({ error: "Invalid file content. Real image file required." });
      }
  
      // Upload to Cloudinary (Re-encode to webp)
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          { 
            folder: "profile_pictures",
            resource_type: "image",
            format: "webp" // Re-encode to prevent payloads
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
  
      console.log("Cloudinary Upload Success:", result);
  
      // Update user profile picture URL in database
      const user = await User.findByIdAndUpdate(userId, { profilePic: result.secure_url }, { new: true });
  
      res.json({ message: "Profile picture updated", profilePic: user.profilePic });
    } catch (error) {
      console.error("Upload Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
export default photoRouter;
