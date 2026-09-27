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
/**
 * Limiter for endpoints that send email (/forgot-password, /resend-verification).
 * They answer 200 whether or not the account exists, so authLimiter's
 * skipSuccessfulRequests would never count them. Every request counts here,
 * which stops these endpoints being used to flood a victim's inbox.
 */
export const emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Max 5 emails requested per IP per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        msg: "Too many email requests from this IP. Please try again later."
    }
});

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
