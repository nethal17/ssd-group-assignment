import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({

    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // Not required: Google doesn't give us a phone number on an OIDC login.
    phone: { type: String },
    // Not required: OAuth-only accounts have no password. select:false keeps the
    // hash out of every query that doesn't explicitly ask for it.
    password: { type: String, select: false },
    authProviders: [{
        _id: false,
        provider: { type: String, enum: ["local", "google"], required: true },
        providerUserId: { type: String, required: true }
    }],
    role: { type: String, enum: ["farmer", "buyer", "admin", "truck_driver"], default: "buyer" },
    profilePic: { type: String, default: "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg" },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    isVerified: { type: Boolean, default: false }, 
    verificationToken: { type: String }, 
    twoStepVerificationCode: { type: String }, 
    twoStepVerificationExpire: { type: Date },
    twoStepVerificationAttempts: { type: Number, default: 0 },
    mfaTicket: { type: String },
    mfaTicketExpire: { type: Date },
    twoFactorEnabled: { type: Boolean, default: false },
    loginHistory: [{
        timestamp: { type: Date, default: Date.now },
        ipAddress: String,
        deviceInfo: String,
        status: { type: String, enum: ["success", "failed"], required: true }
    }],
    lastSecurityUpdate: { type: Date, default: null }

}, { timestamps: true });

export const User = mongoose.model("User", UserSchema);