import mongoose from "mongoose";

/**
 * One row per in-flight login. Holds the values that must survive the redirect
 * to Google but must never reach the browser: the PKCE verifier, and the
 * expected state/nonce.
 *
 * Server-side (not a cookie) so the client can't tamper with them, single-use
 * (deleted on callback) so an intercepted code can't be replayed, and expiring
 * via a TTL index so abandoned logins clean themselves up.
 */
const OidcTransactionSchema = new mongoose.Schema({
    state: { type: String, required: true, unique: true, index: true },
    nonce: { type: String, required: true },
    codeVerifier: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Mongo drops the row 10 minutes after creation.
OidcTransactionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

export const OidcTransaction = mongoose.model("OidcTransaction", OidcTransactionSchema);
export default OidcTransaction;
