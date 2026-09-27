import express from "express";
import { registerUser, loginUser, logoutUser, verifyEmail, verifyTwoStepCode, getLoginHistory, toggleTwoFactorAuth, exportUsers, refreshToken } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { requireSelfOrAdmin } from "../middleware/ownership.js";
import { forgotPassword, resetPassword, changePassword, resendVerificationEmail } from "../controllers/authController.js";
import { getUsers, getUserById, updateUserDetails, deleteUser } from "../controllers/authController.js";
import { authLimiter, emailLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../validation/validate.js";
import {
    registerBody, loginBody, verifyTwoStepBody, refreshTokenBody, emailOnlyBody, resetPasswordBody,
    changePasswordParams, changePasswordBody, updateUserParams, updateUserBody, toggleTwoFactorBody, userIdParams,
} from "../validation/schemas/auth.schemas.js";

const router = express.Router();

// Public - how you get a token (rate-limited against brute-force attacks)
router.post("/register", validate({ body: registerBody }), registerUser);
router.post("/login", authLimiter, validate({ body: loginBody }), loginUser);
router.post("/verify-two-step-code", authLimiter, validate({ body: verifyTwoStepBody }), verifyTwoStepCode);
router.post("/refresh-token", validate({ body: refreshTokenBody }), refreshToken);
router.post("/logout", validate({ body: refreshTokenBody }), logoutUser);
router.post("/forgot-password", emailLimiter, validate({ body: emailOnlyBody }), forgotPassword);
router.post("/reset-password/:token", authLimiter, validate({ body: resetPasswordBody }), resetPassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", emailLimiter, validate({ body: emailOnlyBody }), resendVerificationEmail);

// Own account only. This router sits above the global gate, so authMiddleware
// is added per route here.
router.put("/change-password/:userId", authMiddleware, validate({ params: changePasswordParams, body: changePasswordBody }), requireSelfOrAdmin("userId"), changePassword);
router.get("/searchUser/:id", authMiddleware, requireSelfOrAdmin("id"), getUserById);
router.put("/updateUser/:id", authMiddleware, validate({ params: updateUserParams, body: updateUserBody }), requireSelfOrAdmin("id"), updateUserDetails);
router.get("/login-history", authMiddleware, getLoginHistory);
router.post("/toggle-2fa", authMiddleware, validate({ body: toggleTwoFactorBody }), toggleTwoFactorAuth);

// Own account or admin - a user may delete their own account
router.delete("/userDelete/:id", authMiddleware, validate({ params: userIdParams }), requireSelfOrAdmin("id"), deleteUser);

// Admin only
router.get("/getAllUsers", authMiddleware, authorizeRoles("admin"), getUsers);
router.get("/exportUsers", authMiddleware, authorizeRoles("admin"), exportUsers);

export default router;