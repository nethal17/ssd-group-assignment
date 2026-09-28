import { z } from "zod";
import { email, objectId, phone, strongPassword, text, idParams } from "../common.js";

export const registerBody = z.strictObject({
    name: text("Name", 100),
    email,
    phone,
    password: strongPassword,
    // Admin accounts are never self-registered
    role: z.enum(["farmer", "buyer", "truck_driver"], { error: "Invalid role provided." }),
});

// No strength rule on login: existing accounts may predate the password policy
export const loginBody = z.strictObject({
    email,
    password: z.string({ error: "Password is required" }).min(1, "Password is required").max(128),
});

const optionalHexTicket = z.union([z.literal(""), z.string().regex(/^[a-f0-9]{64}$/, "Invalid verification session")]).optional();

export const verifyTwoStepBody = z.strictObject({
    code: z.string({ error: "Verification code is required" }).trim().regex(/^\d{6}$/, "Verification code must be 6 digits"),
    mfaTicket: optionalHexTicket,
    email: email.optional(),
    userId: objectId.optional(),
}).refine((b) => b.mfaTicket || b.email || b.userId, {
    message: "Invalid or expired verification session",
});

// Refresh token normally arrives in the httpOnly cookie; the body form is optional
export const refreshTokenBody = z.strictObject({
    refreshToken: z.string().max(256).optional(),
});

export const emailOnlyBody = z.strictObject({ email });

export const resetPasswordBody = z.strictObject({ password: strongPassword });

export const changePasswordParams = idParams("userId");
export const changePasswordBody = z.strictObject({
    currentPassword: z.string({ error: "Current password is required" }).min(1, "Current password is required").max(128),
    newPassword: strongPassword,
    confirmNewPassword: z.string({ error: "Please confirm the new password" }),
}).refine((b) => b.newPassword === b.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
});

// Email and password are deliberately not accepted here (V8): email changes and
// password changes have their own verified flows.
export const updateUserParams = idParams("id");
export const updateUserBody = z.strictObject({
    name: text("Name", 100),
    phone,
});

export const toggleTwoFactorBody = z.strictObject({
    enable: z.boolean({ error: "enable must be true or false" }),
});

export const userIdParams = idParams("id");
export const photoUploadParams = idParams("userId");
