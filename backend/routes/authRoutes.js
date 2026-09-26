import express from "express";
import { registerUser, loginUser, logoutUser, verifyEmail, verifyTwoStepCode, getLoginHistory, toggleTwoFactorAuth, exportUsers } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { requireSelfOrAdmin } from "../middleware/ownership.js";
import { forgotPassword, resetPassword, changePassword} from "../controllers/authController.js";
import { getUsers, getUserById, updateUserDetails, deleteUser } from "../controllers/authController.js";
import { startGoogleLogin, googleCallback } from "../controllers/oauthController.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Public - how you get a token (rate-limited against brute-force attacks)
router.post("/register", registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/verify-two-step-code", authLimiter, verifyTwoStepCode);
router.post("/logout", logoutUser);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPassword);
router.get("/verify-email/:token", verifyEmail);

// OIDC federated login - public, because this is how you get a token
router.get("/google", authLimiter, startGoogleLogin);
router.get("/google/callback", authLimiter, googleCallback);

// Own account only. This router sits above the global gate, so authMiddleware
// is added per route here.
router.put("/change-password/:userId", authMiddleware, requireSelfOrAdmin("userId"), changePassword);
router.get("/searchUser/:id", authMiddleware, requireSelfOrAdmin("id"), getUserById);
router.put("/updateUser/:id", authMiddleware, requireSelfOrAdmin("id"), updateUserDetails);
router.get("/login-history", authMiddleware, getLoginHistory);
router.post("/toggle-2fa", authMiddleware, toggleTwoFactorAuth);

// Own account or admin - a user may delete their own account
router.delete("/userDelete/:id", authMiddleware, requireSelfOrAdmin("id"), deleteUser);

// Admin only
router.get("/getAllUsers", authMiddleware, authorizeRoles("admin"), getUsers);
router.get("/exportUsers", authMiddleware, authorizeRoles("admin"), exportUsers);

export default router;