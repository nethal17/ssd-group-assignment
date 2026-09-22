import express from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import { User } from "../models/user.js";
import dotenv from "dotenv";

dotenv.config();

const photoRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload profile picture
photoRouter.post("/upload-profile-pic/:userId", upload.single("profilePic"), async (req, res) => {
    try {
      const { userId } = req.params;
      const file = req.file;
  
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
  
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          { folder: "profile_pictures" },
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
