import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { blacklistedTokens } from "../controllers/authController.js";

export const authMiddleware = (req, res, next) => {
    // Check for JWT_SECRET
    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined.");
        return res.status(500).json({ msg: "Server configuration error" });
    }

    // Extract token from Authorization header
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    // Check if token is blacklisted
    if (blacklistedTokens.has(token)) {
        console.log("Attempted use of blacklisted token:", token);
        return res.status(401).json({ msg: "Token has been blacklisted. Please log in again." });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.log("Token Verification Error:", err.message);
        res.status(401).json({ msg: "Token is not valid" });
    }
};