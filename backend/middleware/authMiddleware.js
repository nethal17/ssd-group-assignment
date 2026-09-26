import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user.js";

export const authMiddleware = async (req, res, next) => {
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

    // Verify token and re-hydrate user
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
            issuer: "agri-waste-api",
            audience: "agri-waste-web"
        });

        const userId = decoded.sub || decoded.id || decoded._id;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ msg: "Token invalid: invalid subject identifier" });
        }

        // Re-hydrate user from DB so role updates, deactivations, and token revocations take effect immediately
        const user = await User.findById(userId).select("role email isVerified name tokenVersion");
        if (!user) {
            return res.status(401).json({ msg: "User no longer exists or authorization revoked" });
        }

        // Token revocation check: if user's tokenVersion was bumped (e.g., password change or global logout),
        // reject access tokens issued prior to the bump.
        if (
            decoded.tokenVersion !== undefined &&
            user.tokenVersion !== undefined &&
            decoded.tokenVersion !== user.tokenVersion
        ) {
            return res.status(401).json({ msg: "Session has been invalidated. Please log in again." });
        }

        // Consistent contract for req.user across all controllers and middlewares
        req.user = {
            id: user._id.toString(),
            _id: user._id.toString(),
            userId: user._id.toString(),
            sub: user._id.toString(),
            role: user.role,
            email: user.email,
            name: user.name,
            isVerified: user.isVerified,
            tokenVersion: user.tokenVersion
        };

        next();
    } catch (err) {
        console.error("Token Verification Error:", err.message);
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ msg: "Token expired. Please log in again." });
        }
        return res.status(401).json({ msg: "Token is not valid" });
    }
};