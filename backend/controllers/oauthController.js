import * as client from "openid-client";
import { User } from "../models/user.js";
import OidcTransaction from "../models/oidcTransaction.model.js";
import { signAccessToken } from "../utils/token.js";
import { getOidcConfig, getRedirectUri, OIDC_SCOPE, isOidcConfigured } from "../config/oidc.js";

const frontendUrl = () => process.env.FRONTEND_URL || "http://localhost:5173";

// Errors go back to the SPA as a code, never as a provider message - those can
// carry attacker-controlled text.
const failRedirect = (res, reason) =>
    res.redirect(`${frontendUrl()}/login?error=${encodeURIComponent(reason)}`);

/**
 * GET /api/auth/google
 * Builds the authorization URL and redirects. Nothing secret reaches the browser:
 * the PKCE verifier and expected nonce stay in Mongo, keyed by state.
 */
export const startGoogleLogin = async (req, res) => {
    if (!isOidcConfigured()) {
        return failRedirect(res, "oauth_not_configured");
    }

    try {
        const config = await getOidcConfig();

        const codeVerifier = client.randomPKCECodeVerifier();
        const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
        const state = client.randomState();
        const nonce = client.randomNonce();

        await OidcTransaction.create({ state, nonce, codeVerifier });

        const authUrl = client.buildAuthorizationUrl(config, {
            redirect_uri: getRedirectUri(),
            scope: OIDC_SCOPE,
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
            state,
            nonce
        });

        return res.redirect(authUrl.href);
    } catch (err) {
        console.error("OIDC start error:", err.message);
        return failRedirect(res, "oauth_start_failed");
    }
};
