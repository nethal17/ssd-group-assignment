import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    tokenHash: {
        type: String,
        required: true,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // MongoDB TTL index: auto-deletes expired records
    },
    revoked: {
        type: Boolean,
        default: false
    },
    replacedByTokenHash: {
        type: String,
        default: null
    }
}, { timestamps: true });

export const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);
