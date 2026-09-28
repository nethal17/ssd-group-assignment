import mongoose from "mongoose";

// Credentials and one-time secrets. They are select:false, so no query returns
// them unless the caller opts in explicitly with .select("+field").
const SECRET_FIELDS = [
    "password",
    "resetPasswordToken",
    "resetPasswordExpire",
    "verificationToken",
    "verificationTokenExpire",
    "twoStepVerificationCode",
    "twoStepVerificationExpire",
    "twoStepVerificationAttempts",
    "mfaTicket",
    "mfaTicketExpire",
];

// Never serialised, even when a document was loaded with the secrets selected.
// loginHistory holds IP addresses and device fingerprints; it is only exposed
// through the dedicated /login-history endpoint.
// tokenVersion is internal session-revocation state.
const NON_SERIALISABLE_FIELDS = [...SECRET_FIELDS, "tokenVersion", "loginHistory", "__v"];

const UserSchema = new mongoose.Schema({

    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // Not required: Google doesn't give us a phone number on an OIDC login.
    phone: { type: String },
    // Not required: OAuth-only accounts have no password. select:false (from V11)
    // keeps the hash out of every query that doesn't explicitly ask for it.
    password: { type: String, select: false },
    authProviders: [{
        _id: false,
        provider: { type: String, enum: ["local", "google"], required: true },
        providerUserId: { type: String, required: true }
    }],
    role: { type: String, enum: ["farmer", "buyer", "admin", "truck_driver"], default: "buyer" },
    profilePic: { type: String, default: "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg" },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpire: { type: Date, select: false },
    twoStepVerificationCode: { type: String, select: false },
    twoStepVerificationExpire: { type: Date, select: false },
    twoStepVerificationAttempts: { type: Number, default: 0, select: false },
    mfaTicket: { type: String, select: false },
    mfaTicketExpire: { type: Date, select: false },
    twoFactorEnabled: { type: Boolean, default: false },
    loginHistory: [{
        timestamp: { type: Date, default: Date.now },
        ipAddress: String,
        deviceInfo: String,
        status: { type: String, enum: ["success", "failed"], required: true }
    }],
    lastSecurityUpdate: { type: Date, default: null },
    // Embedded in every access token; incrementing it revokes all existing sessions.
    // Selected by default so every token-issuing path has it (never serialised - see above).
    tokenVersion: { type: Number, default: 0 }

}, { timestamps: true });

// Reset and verification links are looked up by the SHA-256 hash of their token
UserSchema.index({ resetPasswordToken: 1 }, { sparse: true });
UserSchema.index({ verificationToken: 1 }, { sparse: true });

// Defence in depth: res.json() calls toJSON(), so a raw user document can
// never carry secrets out of the API even if a controller forgets to project.
UserSchema.set("toJSON", {
    transform: (doc, ret) => {
        for (const field of NON_SERIALISABLE_FIELDS) {
            delete ret[field];
        }
        return ret;
    },
});

export const User = mongoose.model("User", UserSchema);
