import jwt from "jsonwebtoken";

/**
 * Standardized JWT Access Token Factory
 * Generates tokens with standard claims (sub, role, iss, aud)
 * and legacy backwards-compatibility claims (id).
 */
export const signAccessToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    const payload = {
        sub: user._id.toString(),
        id: user._id.toString(),
        role: user.role
    };

    const options = {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        issuer: "agri-waste-api",
        audience: "agri-waste-web",
        algorithm: "HS256"
    };

    return jwt.sign(payload, process.env.JWT_SECRET, options);
};
