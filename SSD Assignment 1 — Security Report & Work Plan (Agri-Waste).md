# **SE4030 Secure Software Development — Assignment 1**

## **Security Assessment and Remediation: Agri-Waste Marketplace**

**Module:** SE4030 – Secure Software Development · **Assignment 1 (25 marks)**  
**Application:** Agri-Waste Marketplace (MERN — React 19 / Vite, Express 4 / Mongoose 8, MongoDB Atlas, Stripe, Cloudinary)  
**Assessment date:** 24 September 2026 · **Submission:** 28 September 2026  
**This is a shared team working document.** It contains the full vulnerability assessment, the per-member work allocation, viva-preparation notes, per-fix commit plans, and the OAuth/OpenID Connect implementation plan. To add a clickable contents list in Google Docs: *Insert \> Table of contents* (it builds automatically from the headings below).

## **1\. Group and Work Allocation**

### **1.1 Members**

| Role | Name | Index No | Workstream |
| :---- | :---- | :---- | :---- |
| Team Lead | Yasindu | \_\_\_\_\_\_\_\_\_\_\_\_ | Authorization and Payment Integrity |
| Member | Nethal | \_\_\_\_\_\_\_\_\_\_\_\_ | Authentication and Sessions |
| Member | Ricky | \_\_\_\_\_\_\_\_\_\_\_\_ | Secure Configuration and Hardening |
| Member | Naduli | \_\_\_\_\_\_\_\_\_\_\_\_ | Data Protection and Dependencies |

**Fill in the four index numbers.** Also confirm the original-project citation in section 1.4 — it is a marking requirement.

### **1.2 Findings summary**

**21 distinct vulnerabilities: 6 Critical, 8 High, 5 Medium, 2 Low.** The assignment requires a minimum of 7 distinct vulnerabilities; we exceed that comfortably.  
The single most important fact: the codebase **already contains** a working authentication middleware (authMiddleware) and a working role-based access-control middleware (authorizeRoles) — but authMiddleware is applied to only **2 of 124 routes**, and authorizeRoles is **never called anywhere**. That one omission is the root cause of the unauthenticated data exposure, the account-takeover chain, and the payment fraud. Fixing it first (V6) closes or reduces six other findings.

### **1.3 Who owns what**

| Owner | Findings | Count |
| :---- | :---- | :---- |
| Yasindu (Lead) | V6, V7, V8, V9, V17, V18 | 6 |
| Nethal | V1, V2, V3, V4, V5 | 5 |
| Ricky | V10, V13, V14, V16, V20 | 5 |
| Naduli | V11, V12, V15, V19, V21 | 5 |

Yasindu owns the OAuth / OpenID Connect feature (section 10\) in addition to the above.

### **1.4 Project links (to complete before submission)**

> * **Original project:** https://github.com/nethal17/ssd-group-assignment  
> * **Marking requirement — do not skip:** the brief requires the original app's last commit to predate the semester and warns against apps already used to teach vulnerabilities. If this is adapted from a third-party project, cite that upstream source and its original commit date here. If it is the group's own earlier project, state that and give its development dates. This is an easy place to lose marks.  
> * **Modified project (after fixes):** \_\_\_\_\_\_\_\_\_\_\_\_ (new repo; detailed commit history is required for a valid submission — use the per-member commit plans below).  
> * **YouTube demo (max 20 min):** \_\_\_\_\_\_\_\_\_\_\_\_  
> * **Report (PDF):** export this document to PDF (File \> Download \> PDF).

### **1.5 Suggested timeline (24 to 28 Sep)**

| Date | Focus |
| :---- | :---- |
| Thu 24 | Set up the new (fixable) repo; everyone reads their section. Yasindu implements V6 first (deny-by-default) — it unblocks V7/V8/V9. |
| Fri 25 | Yasindu: V7, V8, V9, V17, V18. Nethal: V1, V2, V3. Ricky: V13, V16, V20. Naduli: V11, V19. |
| Sat 26 | Nethal: V4, V5. Ricky: V10, V14. Naduli: V12, V15, V21. Yasindu starts OAuth. |
| Sun 27 | Finish OAuth; integration test the access-control matrix; run npm audit again to confirm; record the demo video. |
| Mon 28 | Final report to PDF; zip all deliverables; upload to courseweb. Buffer for the viva. |

## **2\. Executive Summary**

The application is a multi-role marketplace (farmer / buyer / truck driver / admin) handling personal data, delivery addresses and live Stripe card payments. The review found a **systemic absence of server-side authorization**, plus weaknesses in session handling, data exposure, payment integrity and third-party dependencies.  
Issues an unauthenticated caller can trigger today:

> * **V7** — user-administration endpoints have no authentication.  
> * **V11** — user queries return the whole record, so those endpoints leak password hashes and live security tokens.  
> * **V8** — with no ownership check, any account's email can be changed, which chains into full account takeover (including admin).  
> * **V17 / V18** — item prices and payment amounts are taken from the request body unvalidated, so a buyer can set their own price.

### **Severity distribution**

| Severity | Count | Findings |
| :---- | :---- | :---- |
| Critical | 6 | V6, V7, V8, V11, V17, V18 |
| High | 8 | V2, V3, V5, V9, V10, V12, V19, V21 |
| Medium | 5 | V1, V4, V13, V15, V20 |
| Low | 2 | V14, V16 |

### **CVSS 3.1 (Critical set)**

| ID | Vector | Base |
| :---- | :---- | :---- |
| V8 | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H | 9.8 |
| V6 | AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H | 8.8 |
| V7 | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N | 7.5 |
| V11 | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N | 7.5 |
| V18 | AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N | 7.5 |
| V17 | AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:N | 6.5 |

## **3\. Scope and Methodology**

**In scope:** all backend routes, controllers, models, middleware, helpers; frontend routing, auth state, API client, token storage; package-lock.json in both workspaces.  
**Out of scope:** live penetration testing against a deployed instance (findings are derived from source and reproducible locally); MongoDB Atlas cluster config; Stripe account configuration.  
**Tooling:** manual white-box source review (primary — all access-control and business-logic findings); npm audit (dependency analysis, V21); static pattern sweeps for unprotected routes, unsafe sinks and secret logging. Recommended for the demo, per the brief: OWASP ZAP (DAST) and OWASP Dependency-Check (dependency scanning in CI).  
**Considered and deliberately excluded** (to keep the report honest):

> * **Stripe webhook signature verification** — implemented correctly (constructEvent with the raw body; express.raw() mounted before express.json()).  
> * **React XSS via dangerouslySetInnerHTML** — the pattern appears nowhere; React's escaping is intact.  
> * **NoSQL auth bypass on login** — an operator object would be accepted by the query, but the following bcrypt.compare() can't be satisfied without the real password, so it isn't an auth bypass. The underlying weakness is still addressed defensively (V15/V20).  
> * **Secrets committed to git** — .env is correctly git-ignored in both workspaces; only .env.example placeholders are tracked. (The one real slip is a runtime log of a secret — V13.)

Exploitation below is described at the level needed to prove impact and justify each fix, not as ready-to-run attack tooling.

## **4\. Yasindu (Team Lead) — Authorization and Payment Integrity**

**Scope:** the trust boundary — deciding what an authenticated user may do, and never trusting the client for money. This cluster contains the highest-impact findings, including the unauthenticated account-takeover chain and the payment fraud. As team lead, Yasindu also owns the OAuth/OIDC feature (section 10).  
**Findings:** V6, V7, V8, V9, V17, V18.  
**Commit plan**

> * fix(authz): deny-by-default routing \+ apply RBAC matrix \[V6\]  
> * fix(authz): require auth+role on user-admin endpoints \[V7\]  
> * fix(authz): ownership check on updateUser; lock email field \[V8\]  
> * feat(web): ProtectedRoute guard for admin routes \[V9\]  
> * fix(cart): server-side price lookup; reject client prices \[V17\]  
> * fix(payments): derive charge amount server-side \[V18\]

### **V6 — RBAC is implemented but never applied · Critical · CWE-862**

**Where:** backend/middleware/roleMiddleware.js \+ all route files.  
authorizeRoles is a correct middleware that is **imported by zero route files and called never**. authMiddleware guards only 2 of 124 routes.

| Metric | Count |
| :---- | :---- |
| Route definitions | 124 |
| Protected by authMiddleware | 2 |
| Protected by authorizeRoles | 0 |
| Route files with no auth import | 23 of 25 |

**Impact:** a buyer can call driver-payment endpoints; a driver can call inventory management; an unauthenticated stranger can reach nearly everything. Every other finding in this section is an instance of this omission.  
**Fix:** switch to **deny-by-default** at the router level. Mount public routers first, then apply authMiddleware to everything below, then attach a role rule per router. Add a reusable ownership guard and an access-control matrix (role by endpoint) backed by integration tests asserting 403 for each disallowed pair.  
`// index.js`  
`app.use("/api/auth", authRoutes);        // public: login/register`  
`app.use("/api/webhook", webhookRoutes);  // Stripe-signature authenticated`  
`app.use("/api", authMiddleware);         // everything below requires a valid token`  
`app.use("/api/driver-payments", authorizeRoles("admin"), driverPaymentsRoutes);`  
`app.use("/api/reports",        authorizeRoles("admin"), reportRoutes);`

`// middleware/ownership.js`  
`export const requireSelfOrAdmin = (p = "id") => (req, res, next) => {`  
  `if (req.user.role === "admin" || req.user.id === req.params[p]) return next();`  
  `return res.status(403).json({ msg: "Access denied." });`  
`};`  
**Viva:** *Why deny-by-default?* Because "remember to add auth to each new route" fails the moment someone forgets. Deny-by-default means a new route is protected automatically; you must deliberately make something public. It fails safe, not open.

### **V7 — Unauthenticated user-administration endpoints · Critical · CWE-306**

**Where:** routes/authRoutes.js:16-19, 23\.  
`router.get("/getAllUsers", getUsers);              // no middleware`  
`router.get("/searchUser/:id", getUserById);`  
`router.put("/updateUser/:id", updateUserDetails);`  
`router.delete("/userDelete/:id", deleteUser);`  
`router.get("/exportUsers", exportUsers);`  
Two lines below (21-22) login-history and toggle-2fa do have authMiddleware, so the omission was an oversight. deleteUser permanently deletes unverified accounts; an unauthenticated caller iterating over ids from getAllUsers could disable every account. exportUsers streams all PII as CSV.  
**Fix:**  
`router.get("/getAllUsers",    authMiddleware, authorizeRoles("admin"), getUsers);`  
`router.get("/exportUsers",    authMiddleware, authorizeRoles("admin"), exportUsers);`  
`router.get("/searchUser/:id", authMiddleware, requireSelfOrAdmin("id"), getUserById);`  
`router.put("/updateUser/:id", authMiddleware, requireSelfOrAdmin("id"), updateUserDetails);`  
`router.delete("/userDelete/:id", authMiddleware, requireSelfOrAdmin("id"), deleteUser);`  
**Viva:** *Why different rules per route?* Listing/exporting all users is admin-only; viewing or editing one user should be allowed for the owner or an admin — that's what the ownership guard expresses.

### **V8 — Account takeover via unauthenticated email change · Critical · CWE-639 (CVSS 9.8)**

**Where:** authController.js:508-530 (updateUserDetails).  
`const { id } = req.params;`  
`const { name, email, phone } = req.body;`  
`await User.findByIdAndUpdate(id, { name, email, phone }, { new: true });   // no ownership / auth check`  
**Impact:** the email is the account-recovery channel. An attacker repoints any account's email — including admin's — to an address they control, then uses the normal password-reset flow to seize it. (The reset step isn't even required: V11 leaks the reset token directly.) Unauthenticated request to full admin.  
**Fix:** add authMiddleware \+ requireSelfOrAdmin("id"); make **email not editable** here; route email changes through a dedicated flow (confirm current password, send a confirmation link to the new address, commit only when followed, notify the old address). Strip sensitive fields from the response and use runValidators: true. The same missing-ownership pattern recurs in changePassword and updateSecurityTimestamp — fix together.  
**Viva:** *Why is changing an email such a big deal?* Because it's the recovery channel for the whole account — change it and a password reset comes to the attacker. Treating email like an ordinary profile field is the mistake.

### **V9 — Admin dashboard protected only on the client · High · CWE-602**

**Where:** frontend/src/App.jsx:77.  
`<Route path="/admin-dashboard" element={<AdminDashboard />} />`  
No ProtectedRoute exists in the frontend; role decisions read user.role from localStorage, which a user can edit in devtools. Chained with V6/V7 the admin UI it renders is fully functional.  
**Fix:** add a ProtectedRoute wrapper for UX — while documenting that it is cosmetic; the real control is the server-side matrix from V6.  
`export const ProtectedRoute = ({ allowedRoles, children }) => {`  
  `const token = localStorage.getItem("token");`  
  `if (!token) return <Navigate to="/login" replace />;`  
  `let user; try { user = JSON.parse(localStorage.getItem("user")); } catch { return <Navigate to="/login" replace />; }`  
  `if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;`  
  `return children;`  
`};`  
**Viva:** *If it can be bypassed, why add it?* For UX and to reduce accidental exposure — never as the boundary. The client decides what to show; the server decides what to allow.

### **V17 — Client-controlled prices in cart and checkout · Critical · CWE-602/840**

**Where:** cartController.js:6-24, checkout.controller.js:6-20.  
`const { userId, wasteId, price, deliveryCost, quantity } = req.body;   // price from the client`  
`cart.totalPrice = cart.items.reduce((t,i) => t + i.price*i.quantity + i.deliveryCost, 0);`  
**Impact:** a buyer can add any item at any price (including 0 or negative) and check out at that total — direct financial fraud.  
**Fix:** never accept price from the client. Look up the authoritative price server-side from the ProductListing/agriWaste record using only wasteId \+ quantity; compute totals from stored values; validate quantity is a positive integer within stock; reject any request containing a price field.  
**Viva:** *Why not just check the price is positive?* A positive price the buyer chose is still fraud. Price is the server's fact, not the client's input.

### **V18 — Payment amount trusted from the request body · Critical · CWE-20**

**Where:** stripe.controller.js:10, stripePayment.controller.js, driverPayments.controller.js.  
`const { totalSalary, driverId, driverName } = req.body;`  
`unit_amount: Math.round(totalSalary * 100)`  
**Impact:** the Stripe charge amount is whatever the client sends; the only checks are "present" and "greater than 0". A caller can pay an arbitrary (tiny) amount, or redirect a payment via driverId.  
**Fix:** derive the amount server-side from the persisted record (the driver's computed salary, or the order total recomputed per V17); verify the caller is authorized for that payment; create the payment-intent server-side and reconcile against the (correctly verified) webhook before marking anything paid.  
**Viva:** *The webhook is verified — isn't that enough?* The webhook confirms Stripe processed a payment; if we told Stripe the wrong amount, a verified webhook just confirms the wrong amount. Compute the amount server-side before creating the session.

## **5\. Nethal — Authentication and Sessions**

**Scope:** proving who a user is and keeping the session safe — JWT issuance and verification, two-factor authentication, rate limiting, logout/token revocation, and the cryptographic libraries underneath.  
**Findings:** V1, V2, V3, V4, V5.  
**Commit plan**

> * fix(auth): centralise JWT issuance with consistent claims \[V1\]  
> * fix(auth): CSPRNG \+ hashed, attempt-capped 2FA codes \[V2\]  
> * feat(auth): add rate limiting and account lockout \[V3\]  
> * refactor(auth): short-lived access \+ hashed refresh tokens \[V4\]  
> * chore(deps): patch jws advisory; pin JWT algorithm \[V5\]

### **V1 — Inconsistent JWT claims: role omitted on the primary login path · Medium · CWE-287**

**Where:** authController.js:258 vs :432.  
`// :258 normal login — no role claim`  
`jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });`  
`// :432 2FA login — includes role`  
`jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });`  
roleMiddleware reads req.user.role, so a normally-logged-in user (no role claim) is treated inconsistently from a 2FA user. The symptom is visible in ProductListingController.js:65 (req.user?.userId || req.user?.\_id || req.user?.id) — three guesses because the token shape isn't a contract. This is the root cause that makes V6 unsafe to switch on until fixed.  
**Fix:** one token factory, one payload shape (sub, role, iss, aud), and re-hydrate the user from the DB in authMiddleware so role changes/deactivation take effect immediately.  
`export const signAccessToken = (user) =>`  
  `jwt.sign({ sub: user._id.toString(), role: user.role },`  
    `process.env.JWT_SECRET,`  
    `{ expiresIn: "15m", issuer: "agri-waste-api", audience: "agri-waste-web" });`  
**Viva:** *Why re-fetch the user each request?* A JWT is a login-time snapshot; trusting only the claim lets a revoked/demoted user keep privileges until expiry. Re-fetching is one indexed query and closes that gap.

### **V2 — Two-factor code is weak, unthrottled and not invalidated · High · CWE-307/338**

**Where:** authController.js:9-11, 232, 404-451; routes/authRoutes.js:11.  
Three defects compound: (a) the code uses Math.random() (non-cryptographic, predictable); (b) POST /verify-two-step-code has no auth and no rate limit and returns a full session token on success; (c) no attempt counter and the code isn't burned after wrong guesses — valid for its full 10-minute window.  
**Impact:** because the endpoint is unauthenticated and unthrottled, the 6-digit code can be defeated by automated guessing within the window — and success yields a session without the victim's password. The victim's userId isn't secret (V7/V11).  
**Fix:** crypto.randomInt() (CSPRNG); store a bcrypt hash of the code; cap attempts (5) and burn the code on exhaustion; return the same error whether wrong or expired; bind the second factor to a single-use mfaTicket issued by loginUser. Apply the V3 rate limiter here too.  
**Viva:** *Why hash a 6-digit code?* The hash protects it at rest (if the DB leaks per V11, the live code isn't sitting there in plaintext); the network brute-force is stopped by the attempt cap \+ rate limit. Both layers matter.

### **V3 — No rate limiting or account lockout · High · CWE-307**

**Where:** index.js, routes/authRoutes.js — no throttling middleware; express-rate-limit isn't installed.  
/login, /forgot-password, /verify-two-step-code accept unlimited requests. Failed logins are recorded into user.loginHistory (:212-218) but never acted on. Dead code: the \!user branch re-runs the identical query and enters an unreachable if.  
**Fix:** npm i express-rate-limit; global limiter \+ strict authLimiter (10/15 min, skipSuccessfulRequests) on auth routes; app.set("trust proxy", 1); progressive lockout in loginUser (5+ failures in 15 min to 429\) driven by the history already collected. Remove the dead code.  
**Viva:** *Why lock the account and the IP?* The limiter is per-IP (stops one attacker), the lockout is per-account (stops IP rotation); a short 15-min window avoids letting an attacker lock a victim out for long.

### **V4 — Token revocation relies on an in-memory Set · Medium · CWE-613**

**Where:** authController.js:7 — export const blacklistedTokens \= new Set();  
Process-local: empties on restart (a "logged-out" token works again for the rest of its 1-day life), doesn't span multiple instances, and never evicts (unbounded growth to slow memory-exhaustion via a logout loop).  
**Fix:** short-lived access tokens (15 min) \+ persisted, hashed refresh tokens in a RefreshToken collection (httpOnly; Secure; SameSite=Strict cookie); logout revokes the refresh row; add a tokenVersion claim bumped on password/role change and "log out everywhere". If a denylist is still wanted for the 15-min window, back it with Redis using a TTL equal to the token's remaining life.  
**Viva:** *Why is 15 minutes acceptable without revocation?* A deliberate trade-off: checking a denylist on every request is expensive and stateful; a short lifetime gives most of the benefit with none of the shared state. tokenVersion covers the rare "revoke now" case.

### **V5 — jws HMAC advisory via jsonwebtoken; algorithm not pinned · High · CWE-347**

**Where:** package-lock.json (jws under jsonwebtoken); authMiddleware.js:30.  
npm audit flags a High advisory against jws ("Improperly Verifies HMAC Signature"), which sits beneath every jwt.verify() call. Verification is done **without pinning the algorithm**.  
**Fix:** npm audit fix (confirm with npm ls jws); pin algorithms: \["HS256"\] and enforce issuer/audience; fail startup if JWT\_SECRET is missing or shorter than 32 chars (openssl rand \-base64 48).  
**Viva:** *jsonwebtoken 9 already blocks alg:none — why pin?* Defence in depth; pinning removes the whole algorithm-confusion question for one line and protects against a future dependency change weakening the defaults.

## **6\. Ricky — Secure Configuration and Hardening**

**Scope:** platform-level protections and self-contained hardening — file-upload safety, security headers and CORS, safe error handling, removing secrets from logs, and a search input that can hang the server.  
**Findings:** V10, V13, V14, V16, V20.  
**Commit plan**

> * fix(upload): auth, ownership, size/type limits on profile pic \[V10\]  
> * security(payments): remove secret logging; add redaction \[V13\]  
> * fix(api): generic error responses \+ central handler \[V14\]  
> * fix(search): escape regex input to prevent ReDoS \[V16\]  
> * feat(security): helmet, CORS allow-list, mongo-sanitize, hpp \[V20\]

### **V10 — Profile upload: unauthenticated IDOR \+ unrestricted file handling · High · CWE-639/434**

**Where:** routes/profileRoutes.js:11-12, 21-24.  
`const upload = multer({ storage: multer.memoryStorage() });   // no limits, no fileFilter`  
`photoRouter.post("/upload-profile-pic/:userId", upload.single("profilePic"), async (req, res) => {`  
  `const { userId } = req.params;                              // no auth / ownership`  
**Impact:** anyone can overwrite any user's picture (defacement / social-engineering aid); no fileFilter makes the server an unauthenticated proxy into the paid Cloudinary account; no limits with memoryStorage() means large concurrent uploads buffer in heap to unauthenticated DoS.  
**Fix:** authMiddleware \+ requireSelfOrAdmin("userId"); limits: { fileSize: 2\*1024\*1024, files: 1 }; MIME allow-list plus magic-byte check (file-type); have Cloudinary re-encode (resource\_type: "image", format: "webp"); add a multer error handler returning 400\.  
**Viva:** *Isn't checking the MIME type enough?* No — the MIME type is a header the client sets, so it can lie. Check the actual file bytes and re-encode so any non-image payload is destroyed.

### **V13 — Stripe secret key written to logs · High · CWE-532**

**Where:** controllers/stripe.controller.js:5 — console.log('Stripe Secret Key:', process.env.STRIPE\_SECRET\_KEY);  
Runs on every boot. A Stripe secret key is full API access (create charges, refunds, read customers). Anyone with log access obtains it. Related files log request bodies/metadata too.  
**Fix:** delete the line and the payment-payload logging. Because it has been printed, **rotate the key** in the Stripe dashboard. Add a lint/pre-commit rule blocking console.log of /secret|key|token|password/i; use a redacting logger (pino with redact).  
**Viva:** *You deleted the line — why also rotate?* Removing the code stops future leaks; rotating invalidates the key that already leaked. Both are needed.

### **V14 — Verbose error details returned to the client · Low · CWE-209**

**Where:** stripe.controller.js (details: error.message) and several product controllers (message: err.message).  
Raw error strings leak library versions, DB field names and internal paths — reconnaissance for an attacker.  
**Fix:** log the full error server-side; return a generic message \+ a correlation id. Add a central Express error handler; stop returning err.message verbatim.  
**Viva:** *Isn't a detailed error just good DX?* In development behind a flag, yes; in production it's information disclosure. The correlation id gives both — the user reports the id, we find the error in our logs, the attacker learns nothing.

### **V16 — searchProduct builds a RegExp from raw input (ReDoS) · Low · CWE-400/1333**

**Where:** controllers/product/searchProduct.js:7 — new RegExp(query, 'i', 'g') where query is req.query.q.  
User-controlled regex to catastrophic backtracking (denial of service). (The third arg 'g' is invalid for the RegExp constructor and silently ignored — the line wasn't tested.) MarketPlaceController.js:316 does the same with wasteType.  
**Fix:** escape metacharacters, cap length, and prefer a MongoDB text index over regex.  
`const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");`  
`const regex = new RegExp(escape(String(query).slice(0, 80)), "i");`  
**Viva:** *ReDoS in one sentence?* A regular expression that, on a crafted input, takes exponential time to evaluate, so one small request can freeze the server.

### **V20 — Open CORS, no security headers, no query sanitisation · Medium · CWE-942/1021**

**Where:** index.js:44 — app.use(cors());  
cors() with no options reflects any origin. No helmet (no X-Frame-Options/CSP/HSTS), no express-mongo-sanitize, no hpp.  
**Fix:** npm i helmet express-mongo-sanitize hpp; restrict CORS to the known frontend origin with credentials: true; app.use(helmet()), app.use(mongoSanitize()) (strips \$ and dot operators — defence in depth against operator injection), app.use(hpp()). Pairs with moving the session out of localStorage into an httpOnly cookie (V4).  
**Viva:** *Why does open CORS matter if the API needs a token?* A logged-in user visiting a malicious site could have their browser make authenticated requests on their behalf (especially with cookies). Locking CORS to our origin plus SameSite cookies stops that.

## **7\. Naduli — Data Protection and Dependencies**

**Scope:** protecting the data itself and the supply chain — what leaves the API in responses, how secret tokens are stored, input validation, mass-assignment on writes, and vulnerable third-party packages.  
**Findings:** V11, V12, V15, V19, V21.  
**Commit plan**

> * fix(data): select:false on secrets \+ safe projections \[V11\]  
> * fix(auth): hash reset/verify tokens, shorten TTLs \[V12\]  
> * feat(api): zod validation on write endpoints \[V15\]  
> * fix(product): whitelist fields; restore permission check \[V19\]  
> * chore(deps): npm audit fix \+ CI audit gate \+ Dependabot \[V21\]

### **V11 — API returns full user documents (hashes \+ live tokens) · Critical · CWE-200**

**Where:** authController.js:455-476; models/user.js.  
`const users = await User.find({});      // no .select()`  
`const user  = await User.findById(id);  // no .select()`  
No field is select: false, so the whole document is returned. Chained with V7 (unauthenticated), one request discloses per user: password (bcrypt hash — crackable offline, easier with the 8-char minimum), live resetPasswordToken/resetPasswordExpire, live twoStepVerificationCode, verificationToken, and full PII / loginHistory.  
**Fix:** mark secrets select: false in the schema; project only safe fields in every read; never serialise the raw document.  
`password: { type: String, required: true, select: false };  // + the other token/2FA fields`  
`const SAFE = "name email phone role profilePic isVerified twoFactorEnabled createdAt";`  
`const users = await User.find({}).select(SAFE);`  
**Viva:** *Isn't the password safe because it's hashed?* Better than plaintext, but still crackable for weak passwords and should never leave the server. select:false makes "don't return it" the default.

### **V12 — Reset/verification tokens stored in plaintext, long-lived · High · CWE-640**

**Where:** authController.js:308-312 (reset), :90-100, 137 (verification).  
Reset tokens are stored in plaintext with a 2-hour window (the code says 7200000 ms though the comment says "1 hour"); verification tokens have no expiry and are also plaintext. Anyone reading the DB or a backup (V11) can use them directly.  
**Fix:** store only sha256(token); email the raw token; look up by the hash. Reset TTL 15 to 30 min; verification TTL 24 h. Generic message on failed lookup. Invalidate sessions (bump tokenVersion, V4) after a successful reset.  
**Viva:** *Why hash a random token?* Randomness protects it in transit; hashing protects it at rest — a DB leak yields unusable hashes instead of working reset links.

### **V15 — No input validation on most write endpoints · Medium · CWE-20**

**Where:** e.g. cartController.js:6, checkout.controller.js, filterProduct.js.  
Controllers destructure arbitrary body fields and persist them with no schema validation. This is the enabling weakness behind the pricing findings (V17/V18) and allows type-confusion and over-posting.  
**Fix:** validate every write at the boundary with zod (or express-validator); reject unknown fields; never spread req.body into a model; runValidators: true on updates.  
**Viva:** *Isn't Mongoose validation enough?* It checks types late and won't reject extra fields. Boundary validation rejects bad input before business logic and enforces rules Mongoose can't express.

### **V19 — Mass assignment via new productModel(req.body) · High · CWE-915**

**Where:** product/uploadProduct.js:14; also checkout.controller.js.  
The whole body is passed to the model, so a client can set any field (and attempt \_\_proto\_\_ prototype-pollution paths — see the mongoose CVE in V21). The permission check directly above is **commented out**, and updateProduct.js:7 calls uploadProductPermission(req.userId) where req.userId is never set by any middleware.  
**Fix:** whitelist fields explicitly (const { productName, category, price, ... } \= req.body); re-enable the permission check wired to req.user from the fixed authMiddleware (V1); set server-controlled fields (ownerId, createdBy) from req.user, never the body.  
**Viva:** *What could mass assignment set here?* Any schema field and attempts to pollute the prototype — e.g. forcing isApproved/ownerId. Whitelisting means only chosen fields are ever written.

### **V21 — Vulnerable dependencies · High · CWE-1035/937**

**Where:** npm audit, both workspaces.  
Backend: **18 (13 High, 5 Moderate)**. Frontend: **30 (2 Critical, 18 High, 6 Moderate, 4 Low)**. Security-relevant highlights:

| Package | Sev | Relevance |
| :---- | :---- | :---- |
| jws (via jsonwebtoken) | High | Underpins all authorization (V5) |
| mongoose | High | \$nor filter bypass \+ \_\_proto\_\_ pollution; amplifies V19 |
| nodemailer | High | SMTP/CRLF header injection; all auth emails |
| cloudinary | High | Argument injection; profile upload (V10) |
| form-data (frontend) | Critical | Unsafe boundary RNG \+ CRLF injection |
| jspdf (frontend) | Critical | Path traversal / JS execution in PDFs |
| axios, react-router, vite, lodash | High | SSRF, XSS-via-open-redirect, ReDoS, pollution |

**Fix:** npm audit fix in both workspaces; \--force (major bumps like Vite/React-Router) only once integration tests exist. Add npm audit \--audit-level=high (or OWASP Dependency-Check) to CI to fail the build on new High/Critical advisories; enable Dependabot.  
**Viva:** *Are all 48 real risks?* Most are transitive and not all reachable from our code — which is why the table triages the ones that matter rather than quoting the count. Patch what patches cleanly, upgrade majors deliberately with tests, gate CI so it can't get worse.

## **8\. Vulnerabilities Not Fixed (and why)**

Every finding above is remediable within the assignment. The following are explicitly deferred, with justification (this is worth marks under Discussion):

> * **Distributed Redis token denylist (extends V4).** The bounded fix (15-min access tokens \+ DB-backed refresh) is implemented; a distributed Redis denylist needs infrastructure not present in a course project. Documented as a production step.  
> * **WAF / edge rate limiting.** Application-layer limiting (V3) is implemented; edge/WAF throttling is an ops concern, out of scope for source remediation.  
> * **npm audit fix \--force majors (V21).** Deferred where a forced upgrade (Vite 4 to 7, React-Router major) risks breaking the build with no test suite yet to catch regressions. Documented as "upgrade once integration tests exist" — honest about the risk of blind major bumps.  
> * **Upload malware/AV scanning (extends V10).** Beyond magic-byte check \+ re-encode, full malware scanning is disproportionate for this app's threat model.

## **9\. Best Practices That Would Have Prevented These**

Mapped to the SDLC (the brief's Discussion criterion):

> * **Requirements:** define an access-control matrix (role by resource by action) before coding. V6/V7/V8 exist because no one wrote down who may do what — the middleware was built but never assigned targets.  
> * **Design:** secure defaults — deny-by-default routing, select:false on secrets, prices owned by the server. Threat-model the payment flow (STRIDE) — Tampering on price/amount is exactly V17/V18.  
> * **Implementation:** input validation at every boundary (zod), field whitelisting instead of new Model(req.body), a shared token factory, a redacting logger, lint rules blocking console.log of secrets (V13).  
> * **Verification:** authorization integration tests asserting 403 for disallowed role/endpoint pairs; SAST in CI; npm audit/OWASP Dependency-Check gating the build (V21); a DAST pass with OWASP ZAP before release.  
> * **Operations:** secret management \+ rotation (V13), centralised logging with redaction, security headers via helmet, dependency auto-updates (Dependabot).

## **10\. OAuth 2.0 / OpenID Connect Implementation (Owner: Yasindu)**

**Feature:** "Sign in with Google" — **OpenID Connect** over the **Authorization Code grant with PKCE**. This updates the existing login feature by adding federated login alongside local email/password. Provider: Google Identity (a public OIDC provider, as the brief allows). WSO2 Identity Server is the open-source alternative.

### **10.1 Why this grant type**

| Option | Verdict |
| :---- | :---- |
| Authorization Code \+ PKCE | Chosen — current best practice; PKCE protects the code without a client secret in the SPA. |
| Implicit | Deprecated by OAuth 2.1; returns tokens in the URL. |
| Client Credentials | Machine-to-machine; no end user. |
| Resource Owner Password | User hands their Google password to us — the exact thing OAuth avoids. |

**OIDC vs plain OAuth:** OAuth 2.0 is authorization; a login needs authentication, so we use OIDC, which adds the **ID token** — a signed JWT with verified identity claims (sub, email, email\_verified, name, picture).

### **10.2 Architecture (backend-handled / BFF-style)**

The token exchange happens on the backend; the SPA never sees Google's client secret or the raw code. The backend validates the ID token and then issues our own session (the V1/V4 tokens), so the OIDC feature inherits all the session hardening.  
`Browser (SPA) -> GET /api/auth/google -> backend builds auth URL (state + PKCE + nonce), 302 -> Google`  
`Google -> user consents -> 302 back to /api/auth/google/callback?code&state`  
`backend: verify state -> exchange code+code_verifier at Google token endpoint`  
       `-> validate ID token (JWKS signature, iss, aud, exp, nonce)`  
       `-> find-or-create user in Mongo -> issue OUR access+refresh tokens -> 302 to app`

### **10.3 Data model change (models/user.js)**

`password: { type: String, select: false },              // no longer required (OAuth-only accounts)`  
`authProviders: [{ provider: { type: String, enum: ["local","google"] }, providerUserId: String }],`  
`isVerified: { type: Boolean, default: false },          // true immediately if Google email_verified`  
**Account-linking rule:** match on the verified email; link the Google sub to an existing local account only when email\_verified \=== true. Never create duplicates.

### **10.4 Endpoints (public — they are the login)**

`router.get("/google", startGoogleLogin);            // build auth URL with state + PKCE(S256) + nonce; store code_verifier server-side; redirect`  
`router.get("/google/callback", googleCallback);      // verify state; exchange code+verifier; VALIDATE ID token (JWKS/iss/aud/exp/nonce); find-or-create; issue OUR tokens`  
Use the maintained openid-client library (handles discovery, JWKS rotation, token validation) rather than hand-rolling the protocol: cd backend && npm i openid-client.

### **10.5 Frontend**

``<a href={`${API_URL}/api/auth/google`} className="btn-google">Continue with Google</a>``  
No client-side OAuth logic; no secret in the SPA.

### **10.6 Security checklist (what vivas look for)**

> * PKCE (S256); state (CSRF, single-use, server-stored, expiring); nonce (replay, bound into the ID token)  
> * ID token fully validated — signature (JWKS), iss, aud, exp, nonce  
> * Exchange on the backend — client secret never in the browser  
> * Exact redirect\_uri allow-list in the Google console (no open redirect)  
> * email\_verified gate before account linking  
> * Least-privilege scopes (openid email profile); secrets in .env (git-ignored)

### **10.7 Config (.env.example)**

`GOOGLE_CLIENT_ID=your_google_client_id`  
`GOOGLE_CLIENT_SECRET=your_google_client_secret`  
`GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback`

### **10.8 Test plan**

New Google user to created; existing local user same verified email to linked, no duplicate; tampered/missing/expired state to rejected; tampered signature or wrong aud/iss to rejected; replayed nonce to rejected; email\_verified=false to not linked.

### **10.9 Alternative: WSO2 Identity Server**

The flow is provider-agnostic — swapping Google for WSO2 changes only the discovery URL, credentials and JWKS endpoint; openid-client consumes the discovery document, so application code is essentially unchanged. Use Google for the demo (zero infra); mention WSO2 as the on-prem option in the viva.

### **10.10 Commit plan (Yasindu)**

> * feat(auth): add Google OIDC config \+ user model providers  
> * feat(auth): /google start endpoint with PKCE \+ state \+ nonce  
> * feat(auth): /google/callback with full ID-token validation  
> * feat(web): "Continue with Google" button  
> * test(auth): OIDC state/nonce/token-validation tests

## **11\. Appendix — Findings to OWASP to Owner**

| ID | Title | Severity | Owner | OWASP 2021 |
| :---- | :---- | :---- | :---- | :---- |
| V1 | Inconsistent JWT claims | Medium | Nethal | A07 |
| V2 | Weak/unthrottled 2FA code | High | Nethal | A07 |
| V3 | No rate limiting / lockout | High | Nethal | A07 |
| V4 | In-memory token revocation | Medium | Nethal | A07 |
| V5 | jws HMAC \+ alg not pinned | High | Nethal | A02/A06 |
| V6 | RBAC never applied | Critical | Yasindu | A01 |
| V7 | Unauth admin endpoints | Critical | Yasindu | A01 |
| V8 | Account takeover (email change) | Critical | Yasindu | A01 |
| V9 | Client-only admin route | High | Yasindu | A01 |
| V10 | Upload IDOR \+ file handling | High | Ricky | A01/A04 |
| V11 | Full user docs exposed | Critical | Naduli | A02 |
| V12 | Unhashed long-lived reset tokens | High | Naduli | A07 |
| V13 | Stripe key logged | High | Ricky | A09 |
| V14 | Verbose errors | Low | Ricky | A05 |
| V15 | No input validation | Medium | Naduli | A03 |
| V16 | RegExp ReDoS in search | Low | Ricky | A03 |
| V17 | Client-controlled prices | Critical | Yasindu | A04 |
| V18 | Trusted payment amount | Critical | Yasindu | A04 |
| V19 | Mass assignment | High | Naduli | A08 |
| V20 | CORS/headers/sanitize | Medium | Ricky | A05 |
| V21 | Vulnerable dependencies | High | Naduli | A06 |

**Remediation priority:** (1) unauthenticated high-impact — V7, V8, V11, V13 (plus rotate the Stripe key), V17, V18; (2) this iteration — V6, V2, V3, V10, V12, V19; (3) hardening — V1, V4, V5, V9, V14, V15, V16, V20, V21. The highest-leverage single change is **V6** — it closes or reduces V7, V8, V9, V17 and V19 at once.