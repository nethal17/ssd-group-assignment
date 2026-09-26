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

/**
 * GET /api/auth/google/callback
 * Verifies state, exchanges the code with the PKCE verifier, and lets
 * openid-client validate the ID token: JWKS signature, iss, aud, exp and nonce.
 * A failure at any step throws, so we never reach the find-or-create.
 */
export const googleCallback = async (req, res) => {
    if (!isOidcConfigured()) {
        return failRedirect(res, "oauth_not_configured");
    }

    const { state } = req.query;
    if (!state) {
        return failRedirect(res, "missing_state");
    }

    // Single-use: deleting here means a replayed callback finds nothing.
    const transaction = await OidcTransaction.findOneAndDelete({ state });
    if (!transaction) {
        return failRedirect(res, "invalid_state");
    }

    try {
        const config = await getOidcConfig();
        const currentUrl = new URL(getRedirectUri());
        currentUrl.search = new URL(req.originalUrl, frontendUrl()).search;

        const tokens = await client.authorizationCodeGrant(config, currentUrl, {
            pkceCodeVerifier: transaction.codeVerifier,
            expectedState: transaction.state,
            expectedNonce: transaction.nonce,
            idTokenExpected: true
        });

        const claims = tokens.claims();
        const { sub, email, email_verified: emailVerified, name, picture } = claims;

        if (!email) {
            return failRedirect(res, "no_email_from_provider");
        }

        // Account-linking gate: an unverified provider email must never attach to
        // an existing local account, or anyone who can register that address at
        // the provider takes the account over.
        if (emailVerified !== true) {
            return failRedirect(res, "email_not_verified");
        }

        const user = await findOrCreateGoogleUser({ sub, email, name, picture });
        const token = signAccessToken(user);

        // Fragment, not query string: fragments aren't sent to servers and don't
        // land in access logs or Referer headers. The SPA reads it and strips it.
        return res.redirect(`${frontendUrl()}/oauth/callback#token=${encodeURIComponent(token)}`);
    } catch (err) {
        console.error("OIDC callback error:", err.message);
        return failRedirect(res, "oauth_failed");
    }
};

/**
 * Link by verified email, never by provider id alone - otherwise a second Google
 * account with the same address would create a duplicate user.
 */
const findOrCreateGoogleUser = async ({ sub, email, name, picture }) => {
    const normalisedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalisedEmail });

    if (existing) {
        const alreadyLinked = existing.authProviders?.some(
            (p) => p.provider === "google" && p.providerUserId === sub
        );
        if (!alreadyLinked) {
            existing.authProviders = [
                ...(existing.authProviders || []),
                { provider: "google", providerUserId: sub }
            ];
        }
        // Google has verified the address, so the local account is verified too.
        existing.isVerified = true;
        if (!existing.profilePic && picture) existing.profilePic = picture;
        await existing.save();
        return existing;
    }

    return User.create({
        name: name || normalisedEmail.split("@")[0],
        email: normalisedEmail,
        isVerified: true,
        profilePic: picture || undefined,
        authProviders: [{ provider: "google", providerUserId: sub }]
        // no password and no phone - this is an OAuth-only account
    });
};
