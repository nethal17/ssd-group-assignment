import jwt from "jsonwebtoken";
import crypto from "crypto";

/**
 * Standardized Short-Lived Access Token Factory (15 minutes).
 * Embeds standard claims (sub, role, iss, aud), backward-compatible alias (id),
 * and tokenVersion for immediate server-side revocation on password/role change.
 */
export const signAccessToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    const payload = {
        sub: user._id.toString(),
        id: user._id.toString(),
        role: user.role,
        // Session generation; authMiddleware rejects tokens whose tokenVersion no longer matches the user
        tokenVersion: user.tokenVersion || 0
    };

    const options = {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
        issuer: "agri-waste-api",
        audience: "agri-waste-web",
        algorithm: "HS256"
    };

    return jwt.sign(payload, process.env.JWT_SECRET, options);
};

/**
 * Generates an opaque, cryptographically random refresh token.
 */
export const generateRefreshToken = () => {
    return crypto.randomBytes(40).toString("hex");
};

/**
 * Computes SHA-256 hash of a refresh token for safe storage at rest.
 */
export const hashRefreshToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Sets the refresh token inside a secure, httpOnly, SameSite=Strict cookie.
 */
export const setRefreshTokenCookie = (res, token) => {
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

/**
 * Clears the refresh token cookie upon logout.
 */
export const clearRefreshTokenCookie = (res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });
};
