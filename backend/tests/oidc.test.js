import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "test-secret-for-oidc-tests";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";

let mongod;
let User, OidcTransaction, RefreshToken, startGoogleLogin, googleCallback;

// Stand-in for the provider. Real ID-token validation lives in openid-client;
// these tests cover OUR logic - state handling, the email_verified gate and
// account linking - by controlling what the grant returns.
const oidcMock = { claims: null, shouldThrow: null };

vi.mock("openid-client", () => ({
  randomPKCECodeVerifier: () => "test-verifier",
  calculatePKCECodeChallenge: async () => "test-challenge",
  randomState: () => `state-${Math.random().toString(36).slice(2)}`,
  randomNonce: () => "test-nonce",
  discovery: async () => ({ serverMetadata: () => ({}) }),
  buildAuthorizationUrl: (_c, params) =>
    new URL(`https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(params)}`),
  authorizationCodeGrant: async () => {
    if (oidcMock.shouldThrow) throw new Error(oidcMock.shouldThrow);
    return { claims: () => oidcMock.claims };
  }
}));

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  ({ User } = await import("../models/user.js"));
  ({ default: OidcTransaction } = await import("../models/oidcTransaction.model.js"));
  ({ RefreshToken } = await import("../models/refreshToken.js"));
  ({ startGoogleLogin, googleCallback } = await import("../controllers/oauthController.js"));
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await OidcTransaction.deleteMany({});
  await RefreshToken.deleteMany({});
  oidcMock.claims = null;
  oidcMock.shouldThrow = null;
});

const mockRes = () => {
  const res = { redirectedTo: null, cookies: {} };
  res.redirect = (url) => { res.redirectedTo = url; return res; };
  res.cookie = (name, value, options) => { res.cookies[name] = { value, options }; return res; };
  return res;
};
const errorOf = (res) =>
  new URL(res.redirectedTo, "http://x").searchParams.get("error");

describe("startGoogleLogin", () => {
  it("stores state, nonce and PKCE verifier server-side", async () => {
    const res = mockRes();
    await startGoogleLogin({ query: {} }, res);

    const rows = await OidcTransaction.find({});
    expect(rows).toHaveLength(1);
    expect(rows[0].codeVerifier).toBe("test-verifier");
    expect(rows[0].nonce).toBe("test-nonce");
  });

  it("sends S256 PKCE, state and nonce to the provider, and never the secret", async () => {
    const res = mockRes();
    await startGoogleLogin({ query: {} }, res);

    const url = new URL(res.redirectedTo);
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("code_challenge")).toBe("test-challenge");
    expect(url.searchParams.get("state")).toBeTruthy();
    expect(url.searchParams.get("nonce")).toBe("test-nonce");
    expect(url.searchParams.get("scope")).toBe("openid email profile");
    // the verifier and client secret must never leave the server
    expect(res.redirectedTo).not.toContain("test-verifier");
    expect(res.redirectedTo).not.toContain("test-client-secret");
  });
});

describe("googleCallback - state validation", () => {
  it("rejects a missing state", async () => {
    const res = mockRes();
    await googleCallback({ query: {}, originalUrl: "/api/auth/google/callback?code=x" }, res);
    expect(errorOf(res)).toBe("missing_state");
  });

  it("rejects a tampered/unknown state", async () => {
    const res = mockRes();
    await googleCallback(
      { query: { state: "not-a-real-state" }, originalUrl: "/cb?code=x&state=not-a-real-state" },
      res
    );
    expect(errorOf(res)).toBe("invalid_state");
  });

  it("rejects a replayed state - single use", async () => {
    oidcMock.claims = { sub: "g-1", email: "replay@example.com", email_verified: true, name: "R" };

    const start = mockRes();
    await startGoogleLogin({ query: {} }, start);
    const state = new URL(start.redirectedTo).searchParams.get("state");
    const req = { query: { state }, originalUrl: `/cb?code=x&state=${state}` };

    const first = mockRes();
    await googleCallback(req, first);
    expect(first.redirectedTo).toContain("#token=");

    const second = mockRes();
    await googleCallback(req, second);
    expect(errorOf(second)).toBe("invalid_state");
  });
});

describe("googleCallback - ID token validation", () => {
  const withState = async () => {
    const res = mockRes();
    await startGoogleLogin({ query: {} }, res);
    const state = new URL(res.redirectedTo).searchParams.get("state");
    return { query: { state }, originalUrl: `/cb?code=x&state=${state}` };
  };

  it("rejects a bad signature (grant throws)", async () => {
    oidcMock.shouldThrow = "unexpected JWT signature";
    const res = mockRes();
    await googleCallback(await withState(), res);
    expect(errorOf(res)).toBe("oauth_failed");
  });

  it("rejects a wrong audience", async () => {
    oidcMock.shouldThrow = "unexpected JWT aud";
    const res = mockRes();
    await googleCallback(await withState(), res);
    expect(errorOf(res)).toBe("oauth_failed");
  });

  it("rejects a replayed nonce", async () => {
    oidcMock.shouldThrow = "unexpected ID Token nonce";
    const res = mockRes();
    await googleCallback(await withState(), res);
    expect(errorOf(res)).toBe("oauth_failed");
  });

  it("creates no user when validation fails", async () => {
    oidcMock.shouldThrow = "expired JWT";
    await googleCallback(await withState(), mockRes());
    expect(await User.countDocuments()).toBe(0);
  });
});

describe("googleCallback - account handling", () => {
  const login = async (claims) => {
    oidcMock.claims = claims;
    const start = mockRes();
    await startGoogleLogin({ query: {} }, start);
    const state = new URL(start.redirectedTo).searchParams.get("state");
    const res = mockRes();
    await googleCallback({ query: { state }, originalUrl: `/cb?code=x&state=${state}` }, res);
    return res;
  };

  it("creates a new user and issues our own token", async () => {
    const res = await login({
      sub: "google-new", email: "new@example.com", email_verified: true, name: "New User"
    });

    expect(res.redirectedTo).toContain("/oauth/callback#token=");
    const token = decodeURIComponent(res.redirectedTo.split("#token=")[1]);
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "agri-waste-api", audience: "agri-waste-web"
    });

    const user = await User.findOne({ email: "new@example.com" });
    expect(user).toBeTruthy();
    expect(decoded.sub).toBe(user._id.toString());
    expect(user.isVerified).toBe(true);
    expect(user.authProviders[0]).toMatchObject({ provider: "google", providerUserId: "google-new" });
  });

  it("links to an existing local account by verified email, without duplicating", async () => {
    await User.create({
      name: "Existing", email: "existing@example.com", phone: "0771234567",
      password: "hashed", role: "farmer"
    });

    await login({
      sub: "google-existing", email: "existing@example.com", email_verified: true, name: "Existing"
    });

    expect(await User.countDocuments({ email: "existing@example.com" })).toBe(1);
    const user = await User.findOne({ email: "existing@example.com" });
    expect(user.authProviders).toHaveLength(1);
    expect(user.authProviders[0].providerUserId).toBe("google-existing");
    expect(user.role).toBe("farmer"); // existing role preserved, not reset
  });

  it("does NOT link or create when email_verified is false", async () => {
    await User.create({
      name: "Victim", email: "victim@example.com", phone: "0771234567", password: "hashed"
    });

    const res = await login({
      sub: "attacker", email: "victim@example.com", email_verified: false, name: "Attacker"
    });

    expect(errorOf(res)).toBe("email_not_verified");
    const user = await User.findOne({ email: "victim@example.com" });
    expect(user.authProviders || []).toHaveLength(0);
  });

  it("rejects a provider response with no email", async () => {
    const res = await login({ sub: "no-email", email_verified: true, name: "No Email" });
    expect(errorOf(res)).toBe("no_email_from_provider");
    expect(await User.countDocuments()).toBe(0);
  });

  it("is idempotent - signing in twice does not duplicate the provider link", async () => {
    const claims = { sub: "google-twice", email: "twice@example.com", email_verified: true, name: "Twice" };
    await login(claims);
    await login(claims);

    expect(await User.countDocuments({ email: "twice@example.com" })).toBe(1);
    const user = await User.findOne({ email: "twice@example.com" });
    expect(user.authProviders).toHaveLength(1);
  });
});

// password became select:false for OAuth-only accounts. Local login and
// change-password read the hash, so they must ask for it explicitly - this
// guards against that regression.
describe("password select:false", () => {
  it("is excluded by default but available with +password", async () => {
    await User.create({
      name: "Local", email: "local@example.com", phone: "0771234567", password: "hashed-pw"
    });

    const defaultQuery = await User.findOne({ email: "local@example.com" });
    expect(defaultQuery.password).toBeUndefined();

    const explicit = await User.findOne({ email: "local@example.com" }).select("+password");
    expect(explicit.password).toBe("hashed-pw");
  });

  it("allows an account with no password at all (OAuth-only)", async () => {
    const user = await User.create({
      name: "OAuth Only", email: "oauth@example.com", isVerified: true,
      authProviders: [{ provider: "google", providerUserId: "g-1" }]
    });
    expect(user._id).toBeTruthy();
  });
});

// V4 made access tokens short-lived (15m) and moved longevity into a hashed
// refresh token cookie. A federated login must issue one too, or a Google user
// is logged out in 15 minutes with no way back.
describe("federated login issues a V4 session", () => {
  const login = async (claims) => {
    oidcMock.claims = claims;
    const start = mockRes();
    await startGoogleLogin({ query: {} }, start);
    const state = new URL(start.redirectedTo).searchParams.get("state");
    const res = mockRes();
    await googleCallback({ query: { state }, originalUrl: `/cb?code=x&state=${state}` }, res);
    return res;
  };

  it("sets an httpOnly refresh cookie", async () => {
    const res = await login({
      sub: "g-session", email: "session@example.com", email_verified: true, name: "S"
    });

    const cookie = res.cookies.refreshToken;
    expect(cookie).toBeTruthy();
    expect(cookie.options.httpOnly).toBe(true);
    expect(cookie.options.sameSite).toBe("strict");
  });

  it("persists the refresh token hashed, never in plaintext", async () => {
    const res = await login({
      sub: "g-hash", email: "hash@example.com", email_verified: true, name: "H"
    });

    const raw = res.cookies.refreshToken.value;
    const stored = await RefreshToken.findOne({});
    expect(stored).toBeTruthy();
    expect(stored.tokenHash).not.toBe(raw);
    expect(stored.expiresAt.getTime()).toBeGreaterThan(Date.now());

    const user = await User.findOne({ email: "hash@example.com" });
    expect(stored.user.toString()).toBe(user._id.toString());
  });

  it("issues no refresh token when the login is refused", async () => {
    await User.create({ name: "V", email: "v@example.com", phone: "0771234567", password: "h" });
    await login({ sub: "atk", email: "v@example.com", email_verified: false, name: "A" });
    expect(await RefreshToken.countDocuments()).toBe(0);
  });
});
