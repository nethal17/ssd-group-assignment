import { z } from "zod";

// Reusable building blocks for request schemas. Every field is typed, so
// operator objects such as { "$ne": null } never reach a query.

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid id");

export const text = (label, max = 200) =>
    z.string({ error: `${label} is required` })
        .trim()
        .min(1, `${label} is required`)
        .max(max, `${label} must be at most ${max} characters`);

export const optionalText = (label, max = 200) =>
    z.string().trim().max(max, `${label} must be at most ${max} characters`).optional();

export const email = z.string({ error: "Email is required" })
    .trim()
    .max(254, "Email is too long")
    .pipe(z.email({ error: "Please provide a valid email address." }));

// Sri Lankan mobile/landline format used across the app: 0XXXXXXXXX
export const phone = z.string({ error: "Phone number is required" })
    .trim()
    .regex(/^0\d{9}$/, "Phone number must be 10 digits starting with 0");

// Same rule the sign-up form applies, enforced where it matters: on the server
export const strongPassword = z.string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters long.")
    .max(128, "Password must be at most 128 characters long.")
    .regex(/[a-z]/, "Password must include a lowercase letter.")
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/\d/, "Password must include a number.")
    .regex(/[^A-Za-z0-9]/, "Password must include a special character.");

// HTML inputs submit numbers as strings; accept numeric strings, reject
// anything else (booleans, null, "" and objects are not coerced to 0).
const toNumber = (value) =>
    typeof value === "string" && value.trim() !== "" ? Number(value) : value;

export const positiveInt = (label, max = 1_000_000) =>
    z.preprocess(toNumber, z.number({ error: `${label} must be a number` })
        .int(`${label} must be a whole number`)
        .min(1, `${label} must be at least 1`)
        .max(max, `${label} is too large`));

export const nonNegativeInt = (label, max = 1_000_000) =>
    z.preprocess(toNumber, z.number({ error: `${label} must be a number` })
        .int(`${label} must be a whole number`)
        .min(0, `${label} cannot be negative`)
        .max(max, `${label} is too large`));

export const money = (label, { allowZero = false } = {}) =>
    z.preprocess(toNumber, z.number({ error: `${label} must be a number` })
        .finite(`${label} must be a number`)
        .min(allowZero ? 0 : 0.01, allowZero ? `${label} cannot be negative` : `${label} must be greater than 0`)
        .max(100_000_000, `${label} is too large`));

const toDate = (value) =>
    typeof value === "string" || typeof value === "number" ? new Date(value) : value;

export const date = (label) =>
    z.preprocess(toDate, z.date({ error: `${label} must be a valid date` }));

export const futureDate = (label) =>
    date(label).refine((d) => d.getTime() > Date.now(), `${label} must be in the future`);

export const httpsUrl = (label) =>
    z.string().trim().max(2048, `${label} is too long`)
        .pipe(z.url({ protocol: /^https?$/, error: `${label} must be a valid URL` }));

// Route parameter objects, e.g. params: idParams("userId")
export const idParams = (...names) =>
    z.strictObject(Object.fromEntries(names.map((n) => [n, objectId])));

// Body with no fields expected (action endpoints such as approve/accept)
export const emptyBody = z.strictObject({});
