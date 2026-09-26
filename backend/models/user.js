import mongoose from "mongoose";

// Credentials and one-time secrets. They are select:false, so no query returns
// them unless the caller opts in explicitly with .select("+field").
const SECRET_FIELDS = [
    "password",
    "resetPasswordToken",
    "resetPasswordExpire",
    "verificationToken",
    "twoStepVerificationCode",
    "twoStepVerificationExpire",
    "twoStepVerificationAttempts",
    "mfaTicket",
    "mfaTicketExpire",
];

// Never serialised, even when a document was loaded with the secrets selected.
// loginHistory holds IP addresses and device fingerprints; it is only exposed
// through the dedicated /login-history endpoint.
const NON_SERIALISABLE_FIELDS = [...SECRET_FIELDS, "loginHistory", "__v"];

const UserSchema = new mongoose.Schema({

    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["farmer", "buyer", "admin", "truck_driver"], default: "buyer" },
    profilePic: { type: String, default: "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg" },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
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
    lastSecurityUpdate: { type: Date, default: null }

}, { timestamps: true });

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
