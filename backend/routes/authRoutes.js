import express from "express";
import { registerUser, loginUser, logoutUser, verifyEmail, verifyTwoStepCode, getLoginHistory, toggleTwoFactorAuth, exportUsers } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { forgotPassword, resetPassword, changePassword} from "../controllers/authController.js";
import { getUsers, getUserById, updateUserDetails, deleteUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-two-step-code", verifyTwoStepCode);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.put("/change-password/:userId", changePassword);  
router.post("/reset-password/:token", resetPassword); 
router.get("/verify-email/:token", verifyEmail); 
router.get("/getAllUsers", getUsers);
router.get("/searchUser/:id", getUserById);
router.put("/updateUser/:id", updateUserDetails);
router.delete("/userDelete/:id", deleteUser);
router.get("/login-history", authMiddleware, getLoginHistory);
router.post("/toggle-2fa", authMiddleware, toggleTwoFactorAuth);
router.get("/exportUsers", exportUsers);

export default router;