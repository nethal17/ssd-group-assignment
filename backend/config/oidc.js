import * as client from "openid-client";

/**
 * Google OIDC discovery config, fetched once and reused.
 *
 * Discovery means we never hardcode Google's authorization/token/JWKS URLs -
 * openid-client reads them from the well-known document and handles JWKS key
 * rotation on its own. Swapping to WSO2 (or any OIDC provider) is a change of
 * OIDC_ISSUER and credentials, nothing else.
 */

const ISSUER = process.env.OIDC_ISSUER || "https://accounts.google.com";

let configPromise;

export const getOidcConfig = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set");
    }

    // Cached: discovery is a network round-trip, and the config is immutable.
    if (!configPromise) {
        configPromise = client.discovery(new URL(ISSUER), clientId, clientSecret);
    }
    return configPromise;
};

export const getRedirectUri = () =>
    process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";

// Least privilege: enough to identify the user, nothing more.
export const OIDC_SCOPE = "openid email profile";

export const isOidcConfigured = () =>
    Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
