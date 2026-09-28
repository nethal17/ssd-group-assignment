import crypto from "crypto";

// Single-use tokens emailed to users (password reset, email verification).
// Only the SHA-256 digest is stored, so a database or backup leak yields
// hashes that cannot be turned back into working links. SHA-256 (not bcrypt)
// is appropriate here: the input is 256 bits of CSPRNG output, so it cannot
// be brute-forced, and a deterministic hash lets us look the token up directly.

export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;             // 30 minutes
export const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// randomBytes(32) rendered as hex
const TOKEN_FORMAT = /^[a-f0-9]{64}$/;

export const hashToken = (rawToken) =>
    crypto.createHash("sha256").update(rawToken).digest("hex");

// Returns the raw token (goes in the email link, never persisted) and its hash (persisted).
export const generateToken = () => {
    const raw = crypto.randomBytes(32).toString("hex");
    return { raw, hash: hashToken(raw) };
};

// Rejects malformed input before it reaches a database query.
export const isWellFormedToken = (value) =>
    typeof value === "string" && TOKEN_FORMAT.test(value);
