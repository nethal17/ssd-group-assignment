import rateLimit from "express-rate-limit";

/**
 * Global rate limiter to protect all endpoints from high-volume automated traffic / DoS.
 */
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        msg: "Too many requests from this IP, please try again after 15 minutes."
    }
});

/**
 * Strict rate limiter applied to sensitive authentication routes
 * (/login, /verify-two-step-code, /forgot-password, /reset-password).
 * Limits to 10 requests per 15 minutes and skips successful requests so
 * legitimate users are not penalized.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Max 10 attempts per 15-minute window
    skipSuccessfulRequests: true, // Only failed attempts consume quota
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        msg: "Too many attempts from this IP. Please try again after 15 minutes."
    }
});
