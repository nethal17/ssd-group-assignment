import { User } from "../models/user.js";
import { RefreshToken } from "../models/refreshToken.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { 
    signAccessToken, 
    generateRefreshToken, 
    hashRefreshToken, 
    setRefreshTokenCookie, 
    clearRefreshTokenCookie 
} from "../utils/token.js";
import { USER_SAFE_FIELDS, toUserDTO, toAdminUserSummary } from "../utils/userSerializer.js";

// 2FA state is select:false on the model; verifyTwoStepCode must opt in to read it
const TWO_FACTOR_FIELDS =
    "+twoStepVerificationCode +twoStepVerificationExpire +twoStepVerificationAttempts +mfaTicket +mfaTicketExpire";

export const generateVerificationCode = () => {
    // Cryptographically secure 6-digit random code (100000 - 999999)
    return crypto.randomInt(100000, 1000000).toString();
};

export const sendVerificationCode = async (email, code) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const mailOptions = {
        to: email,
        from: process.env.EMAIL_USER,
        subject: "Your Verification Code - Agri-Waste Marketplace",
        html: `
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <tr>
                    <td style="padding: 20px; text-align: center;">
                        <h1 style="color: #2c3e50; margin-bottom: 10px;">Verification Code</h1>
                        <p style="color: #7f8c8d; font-size: 16px;">Please use this code to verify your account</p>
                    </td>
                </tr>
                <tr>
                    <td style="background-color: #f8f9fa; padding: 20px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td style="padding: 20px; text-align: center;">
                                    <p style="color: #34495e; margin-bottom: 20px;">Your verification code is:</p>
                                    
                                    <table style="margin: 20px auto;">
                                        <tr>
                                            <td style="background-color: #ffffff; padding: 15px 30px; border-radius: 4px;">
                                                <span style="font-size: 32px; color: #27ae60; letter-spacing: 5px; font-weight: bold;">${code}</span>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="color: #34495e; margin: 20px 0;">This verification code will expire in <strong>10 minutes</strong>.</p>
                                    
                                    <table style="background-color: #fff3cd; color: #856404; padding: 15px; margin: 20px 0; text-align: left; width: 100%;">
                                        <tr>
                                            <td>
                                                <p style="margin: 0;"><strong>Important:</strong> Please do not share this code with anyone. Our team will never ask for your verification code.</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: center; color: #7f8c8d; font-size: 14px; padding: 20px;">
                        <p>This is an automated message. Please do not reply to this email.</p>
                    </td>
                </tr>
                <tr>
                    <td style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                        <p style="color: #7f8c8d; font-size: 12px;">© 2024 Agri-Waste Marketplace. All rights reserved.</p>
                    </td>
                </tr>
            </table>
        `
    };

    await transporter.sendMail(mailOptions);
};

export const verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ msg: "Invalid or expired token" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        // Redirect to the success page
        res.redirect('http://localhost:5173/email-verification-success');
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Server Error" });
    }
};

export const registerUser = async (req, res) => {
    const { name, email, phone, password, role } = req.body;

    
    if (!name || !email || !phone || !password || !role) {
        return res.status(400).json({ msg: "Please fill in all fields." });
    }

    const validateEmail = (email) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    if (!validateEmail(email)) {
        return res.status(400).json({ msg: "Invalid email format." });
    }

    if (password.length < 8) {
        return res.status(400).json({ msg: "Password must be at least 8 characters long." });
    }

    const validatePhone = (phone) => /^0\d{9}$/.test(phone);
    if (!validatePhone(phone)) {
        return res.status(400).json({ msg: "Invalid phone number format." });
    }

    const validRoles = ["farmer", "buyer", "truck_driver"];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ msg: "Invalid role provided." });
    }

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const verificationToken = crypto.randomBytes(32).toString("hex");

        user = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            role,
            verificationToken
        });

        await user.save();

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const verificationURL = `http://localhost:3000/api/auth/verify-email/${verificationToken}`;
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: "Welcome to Agri-Waste Marketplace - Verify Your Email",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2c3e50; margin-bottom: 10px;">Welcome to Agri-Waste Marketplace!</h1>
                        <p style="color: #7f8c8d; font-size: 16px;">Thank you for registering with us. We're excited to have you on board!</p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                        <p style="color: #34495e; margin-bottom: 20px;">To complete your registration and start using our platform, please verify your email address by clicking the button below:</p>
                        
                        <div style="text-align: center;">
                            <a href="${verificationURL}" style="display: inline-block; background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0;">Verify Email Address</a>
                        </div>
                        
                        <p style="color: #7f8c8d; font-size: 14px; margin-top: 20px;">If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
                        <p style="word-break: break-all; color: #3498db; font-size: 14px;">${verificationURL}</p>
                    </div>
                    
                    <div style="text-align: center; color: #7f8c8d; font-size: 14px;">
                        <p>This verification link will expire in 24 hours.</p>
                        <p>If you didn't create an account with us, please ignore this email.</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                        <p style="color: #7f8c8d; font-size: 12px;">© 2024 Agri-Waste Marketplace. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({
            msg: "User registered successfully. Please check your email to verify your account."
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Server Error" });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // password is select:false - opt in only where it is compared
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        // Progressive account lockout: check for 5+ failed attempts in the last 15 minutes
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const recentFailedAttempts = (user.loginHistory || []).filter(entry => 
            entry.status === "failed" && new Date(entry.timestamp) > fifteenMinutesAgo
        );

        if (recentFailedAttempts.length >= 5) {
            return res.status(429).json({ 
                msg: "Account temporarily locked due to multiple failed login attempts. Please try again after 15 minutes." 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Track failed login attempt
            user.loginHistory.push({
                ipAddress: req.ip,
                deviceInfo: req.headers['user-agent'],
                status: "failed",
                timestamp: new Date()
            });
            await user.save();

            if (recentFailedAttempts.length + 1 >= 5) {
                return res.status(429).json({ 
                    msg: "Account temporarily locked due to multiple failed login attempts. Please try again after 15 minutes." 
                });
            }

            return res.status(400).json({ msg: "Invalid credentials" });
        }

        if (!user.isVerified && !user.twoFactorEnabled) {
            return res.status(400).json({ msg: "Please verify your email first" });
        }

        // If 2FA is enabled, generate and send verification code
        if (user.twoFactorEnabled) {
            const verificationCode = generateVerificationCode();
            
            // Hash the 2FA code with bcrypt to protect it at rest in MongoDB
            const salt = await bcrypt.genSalt(10);
            user.twoStepVerificationCode = await bcrypt.hash(verificationCode, salt);
            user.twoStepVerificationExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
            user.twoStepVerificationAttempts = 0; // Reset attempts

            // Issue a cryptographically random, single-use mfaTicket bound to this login session
            const rawMfaTicket = crypto.randomBytes(32).toString("hex");
            user.mfaTicket = crypto.createHash("sha256").update(rawMfaTicket).digest("hex");
            user.mfaTicketExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

            await user.save();

            await sendVerificationCode(user.email, verificationCode);
            
            return res.json({ 
                requiresVerification: true,
                mfaTicket: rawMfaTicket,
                msg: "Verification code sent to your email"
            });
        }

        // Track successful login
        user.loginHistory.push({
            ipAddress: req.ip,
            deviceInfo: req.headers['user-agent'],
            status: "success"
        });
        await user.save();

        const token = signAccessToken(user);
        
        // Persist hashed refresh token with 7-day TTL and issue secure httpOnly cookie
        const rawRefreshToken = generateRefreshToken();
        const tokenHash = hashRefreshToken(rawRefreshToken);
        await RefreshToken.create({
            user: user._id,
            tokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        setRefreshTokenCookie(res, rawRefreshToken);

        // Send complete user data in response
        res.json({ 
            token, 
            user: { 
                _id: user._id,
                name: user.name, 
                email: user.email, 
                phone: user.phone,
                role: user.role,
                profilePic: user.profilePic,
                isVerified: user.isVerified,
                twoFactorEnabled: user.twoFactorEnabled,
                createdAt: user.createdAt
            } 
        });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ msg: "Server Error" });
    }
};

export const logoutUser = async (req, res) => {
    try {
        const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;
        if (incomingToken) {
            const incomingHash = hashRefreshToken(incomingToken);
            await RefreshToken.findOneAndUpdate({ tokenHash: incomingHash }, { revoked: true });
        }

        clearRefreshTokenCookie(res);
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
};

/**
 * Exchange a valid refresh token cookie for a new short-lived access token
 * with Refresh Token Rotation (RTR).
 */
export const refreshToken = async (req, res) => {
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingToken) {
        return res.status(401).json({ msg: "No refresh token provided" });
    }

    try {
        const incomingHash = hashRefreshToken(incomingToken);
        const tokenRecord = await RefreshToken.findOne({ tokenHash: incomingHash });

        if (!tokenRecord) {
            return res.status(401).json({ msg: "Invalid refresh token" });
        }

        if (tokenRecord.revoked) {
            // Token reuse detected - invalidate all sessions for this user as a safeguard
            await RefreshToken.updateMany({ user: tokenRecord.user }, { revoked: true });
            clearRefreshTokenCookie(res);
            return res.status(401).json({ msg: "Refresh token has been revoked" });
        }

        if (new Date(tokenRecord.expiresAt) <= new Date()) {
            clearRefreshTokenCookie(res);
            return res.status(401).json({ msg: "Refresh token has expired. Please log in again." });
        }

        const user = await User.findById(tokenRecord.user);
        if (!user) {
            clearRefreshTokenCookie(res);
            return res.status(401).json({ msg: "User no longer exists" });
        }

        // Refresh Token Rotation: revoke used token, record successor, and issue fresh token
        const newRawRefreshToken = generateRefreshToken();
        const newHash = hashRefreshToken(newRawRefreshToken);

        tokenRecord.revoked = true;
        tokenRecord.replacedByTokenHash = newHash;
        await tokenRecord.save();

        await RefreshToken.create({
            user: user._id,
            tokenHash: newHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        setRefreshTokenCookie(res, newRawRefreshToken);
        const newAccessToken = signAccessToken(user);

        return res.json({
            token: newAccessToken,
            user: toUserDTO(user)
        });
    } catch (err) {
        console.error("Error refreshing token:", err);
        return res.status(500).json({ msg: "Server Error" });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 7200000; // 1 hour expiration
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        const resetURL = `http://localhost:5173/reset-password/${resetToken}`;
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: "Password Reset Request - Agri-Waste Marketplace",
            html: `
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <tr>
                        <td style="padding: 20px; text-align: center;">
                            <h1 style="color: #2c3e50; margin-bottom: 10px;">Password Reset Request</h1>
                            <p style="color: #7f8c8d; font-size: 16px;">We received a request to reset your password</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="padding: 20px; text-align: center;">
                                        <p style="color: #34495e; margin-bottom: 20px;">Hello ${user.name},</p>
                                        <p style="color: #34495e; margin-bottom: 20px;">We received a request to reset your password for your Agri-Waste Marketplace account. If you didn't make this request, you can safely ignore this email.</p>
                                        
                                        <table style="margin: 30px auto;">
                                            <tr>
                                                <td>
                                                    <a href="${resetURL}" style="display: inline-block; background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <p style="color: #34495e; margin: 20px 0;">This password reset link will expire in 1 hour.</p>
                                        
                                        <table style="background-color: #fff3cd; color: #856404; padding: 15px; margin: 20px 0; text-align: left; width: 100%;">
                                            <tr>
                                                <td>
                                                    <p style="margin: 0;"><strong>Important:</strong> For security reasons, please do not share this link with anyone. Our team will never ask for your password or reset link.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; color: #7f8c8d; font-size: 14px; padding: 20px;">
                            <p>This is an automated message. Please do not reply to this email.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                            <p style="color: #7f8c8d; font-size: 12px;">© 2024 Agri-Waste Marketplace. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ msg: "Reset link sent to email" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Server Error" });
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ msg: "Invalid or expired token" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();

        // Invalidate all active refresh tokens across all devices
        await RefreshToken.updateMany({ user: user._id }, { revoked: true });
        clearRefreshTokenCookie(res);

        res.json({ msg: "Password successfully reset" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Server Error" });
    }
};

export const verifyTwoStepCode = async (req, res) => {
    const { email, userId, code, mfaTicket } = req.body;

    if (!code || (!email && !userId && !mfaTicket)) {
        return res.status(400).json({ msg: "Invalid or expired verification session" });
    }

    try {
        let user;
        // Prioritize resolving user by single-use mfaTicket
        if (mfaTicket) {
            const hashedTicket = crypto.createHash("sha256").update(mfaTicket).digest("hex");
            user = await User.findOne({
                mfaTicket: hashedTicket,
                mfaTicketExpire: { $gt: Date.now() }
            }).select(TWO_FACTOR_FIELDS);
        }

        // Fallback to email or userId if ticket was not provided
        if (!user && (email || userId)) {
            const query = email ? User.findOne({ email }) : User.findById(userId);
            user = await query.select(TWO_FACTOR_FIELDS);
        }

        // Generic error response to prevent account enumeration
        if (!user) {
            return res.status(400).json({ msg: "Invalid or expired verification code" });
        }

        // Check if code has expired
        if (!user.twoStepVerificationCode || !user.twoStepVerificationExpire || user.twoStepVerificationExpire <= Date.now()) {
            user.twoStepVerificationCode = undefined;
            user.twoStepVerificationExpire = undefined;
            user.mfaTicket = undefined;
            user.mfaTicketExpire = undefined;
            user.twoStepVerificationAttempts = 0;
            await user.save();
            return res.status(400).json({ msg: "Invalid or expired verification code" });
        }

        // Check if attempt limit has already been reached (capped at 5 attempts)
        if ((user.twoStepVerificationAttempts || 0) >= 5) {
            user.twoStepVerificationCode = undefined;
            user.twoStepVerificationExpire = undefined;
            user.mfaTicket = undefined;
            user.mfaTicketExpire = undefined;
            user.twoStepVerificationAttempts = 0;
            await user.save();
            return res.status(400).json({ msg: "Too many failed attempts. Verification code has been invalidated." });
        }

        // Compare supplied code against stored bcrypt hash
        const isMatch = await bcrypt.compare(String(code).trim(), user.twoStepVerificationCode);

        if (!isMatch) {
            user.twoStepVerificationAttempts = (user.twoStepVerificationAttempts || 0) + 1;

            if (user.twoStepVerificationAttempts >= 5) {
                // Burn the code immediately upon reaching 5 failed attempts
                user.twoStepVerificationCode = undefined;
                user.twoStepVerificationExpire = undefined;
                user.mfaTicket = undefined;
                user.mfaTicketExpire = undefined;
                user.twoStepVerificationAttempts = 0;
                await user.save();
                return res.status(400).json({ msg: "Too many failed attempts. Verification code has been invalidated." });
            }

            await user.save();
            return res.status(400).json({ 
                msg: "Invalid or expired verification code",
                attemptsRemaining: 5 - user.twoStepVerificationAttempts
            });
        }

        // Success: burn 2FA code and mfaTicket immediately to prevent reuse
        user.twoStepVerificationCode = undefined;
        user.twoStepVerificationExpire = undefined;
        user.mfaTicket = undefined;
        user.mfaTicketExpire = undefined;
        user.twoStepVerificationAttempts = 0;
        user.isVerified = true;

        user.loginHistory.push({
            ipAddress: req.ip,
            deviceInfo: req.headers['user-agent'],
            status: "success"
        });
        await user.save();

        const token = signAccessToken(user);

        // Persist hashed refresh token with 7-day TTL and issue secure httpOnly cookie
        const rawRefreshToken = generateRefreshToken();
        const tokenHash = hashRefreshToken(rawRefreshToken);
        await RefreshToken.create({
            user: user._id,
            tokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        setRefreshTokenCookie(res, rawRefreshToken);

        return res.json({ 
            token, 
            user: { 
                _id: user._id,
                name: user.name, 
                email: user.email, 
                phone: user.phone,
                role: user.role,
                profilePic: user.profilePic,
                isVerified: user.isVerified,
                twoFactorEnabled: user.twoFactorEnabled,
                createdAt: user.createdAt
            } 
        });

    } catch (err) {
        console.error("2FA Verification Error:", err);
        return res.status(500).json({ msg: "Server Error" });
    }
};


export const getUsers = async (req, res) => {
    try {
        // Project at the DB: only safe fields plus what lastLogin needs (no IPs)
        const users = await User.find({})
            .select(`${USER_SAFE_FIELDS} loginHistory.timestamp loginHistory.deviceInfo loginHistory.status`)
            .lean();

        const data = users.map(toAdminUserSummary);
        res.status(200).json({ count: data.length, data });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "An internal server error occurred" });
    }
};

export const getUserById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid user id" });
    }

    try {
        const user = await User.findById(id).select(USER_SAFE_FIELDS).lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(toUserDTO(user));

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "An internal server error occurred" });
    }
};

export const updateUserDetails = async (req, res) => {
    const { id } = req.params;

    try {
        // email is not updatable here - unverified changes = account takeover
        const { name, phone } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ message: "Name and phone are required" });
        }

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ message: "Name must be a non-empty string" });
        }

        if (!/^0\d{9}$/.test(phone)) {
            return res.status(400).json({ message: "Phone must be 10 digits starting with 0" });
        }

        // V8 keeps email out of the update; V11's allow-list projection decides
        // what comes back. updatedData is gone - only name and phone are writable.
        const result = await User.findByIdAndUpdate(
            id,
            { name: name.trim(), phone },
            { new: true, runValidators: true }
        )
            .select(USER_SAFE_FIELDS)
            .lean();

        if (!result) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", user: toUserDTO(result) });

    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateSecurityTimestamp = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByIdAndUpdate(
            id,
            { lastSecurityUpdate: new Date() },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Security timestamp updated", lastSecurityUpdate: user.lastSecurityUpdate });
    } catch (err) {
        console.error("Error updating security timestamp:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const changePassword = async (req, res) => {
    const { userId } = req.params;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    try {
        const user = await User.findById(userId).select("+password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "New passwords do not match" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.lastSecurityUpdate = new Date();
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();

        // Invalidate all active refresh tokens across all devices
        await RefreshToken.updateMany({ user: user._id }, { revoked: true });
        clearRefreshTokenCookie(res);

        res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
        console.error("Error changing password:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (user.isVerified === false) {
            // Store user email before deletion
            const userEmail = user.email;
            const userName = user.name;
            
            // Delete user from database
            const result = await User.findByIdAndDelete(id);
            
            if (!result) {
                return res.status(404).json({ message: "User not found" });
            }

            // Send deletion email notification
            const transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                to: userEmail,
                from: process.env.EMAIL_USER,
                subject: "Account Deletion Notice - Agri-Waste Marketplace",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #2c3e50; margin-bottom: 10px;">Account Deletion Notice</h1>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                            <p style="color: #34495e; margin-bottom: 20px;">Dear ${userName},</p>
                            
                            <p style="color: #34495e;">We regret to inform you that your account has been deleted from the Agri-Waste Marketplace platform.</p>
                            
                            <p style="color: #34495e;">If you wish to continue using our services, you can register a new account by clicking the button below:</p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="http://localhost:5173/register" style="display: inline-block; background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Register with Us</a>
                            </div>
                            
                            <p style="color: #34495e;">We look forward to having you back in our community!</p>
                        </div>
                        
                        <div style="text-align: center; color: #7f8c8d; font-size: 14px;">
                            <p>This is an automated message. Please do not reply to this email.</p>
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                            <p style="color: #7f8c8d; font-size: 12px;">© 2024 Agri-Waste Marketplace. All rights reserved.</p>
                        </div>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            
            return res.status(200).json({ message: "User deleted successfully" });
        }

        // If user is verified, deactivate their account instead of deleting
        user.isVerified = false;
        user.twoFactorEnabled = true;
        await user.save();

        // Send deactivation email notification
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: "Account Deactivation Notice - Agri-Waste Marketplace",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2c3e50; margin-bottom: 10px;">Account Deactivation Notice</h1>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                        <p style="color: #34495e; margin-bottom: 20px;">Dear ${user.name},</p>
                        
                        <p style="color: #34495e;">We regret to inform you that your account has been deactivated. This means you will no longer have access to the Agri-Waste Marketplace platform.</p>
                        
                        <p style="color: #34495e;">If you wish to reactivate your account, please login to your account using the button below:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:5173/login" style="display: inline-block; background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Login into your Account</a>
                        </div>
                        
                        <p style="color: #34495e;">We look forward to having you back in our community!</p>
                    </div>
                    
                    <div style="text-align: center; color: #7f8c8d; font-size: 14px;">
                        <p>This is an automated message. Please do not reply to this email.</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                        <p style="color: #7f8c8d; font-size: 12px;">© 2024 Agri-Waste Marketplace. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "User account deactivated successfully" });

    } catch (err) {
        console.error("Error in deleteUser:", err);
        res.status(500).json({ message: "An internal server error occurred" });
    }
};

export const getLoginHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('loginHistory');
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Sort login history by timestamp in descending order (most recent first)
        const sortedHistory = user.loginHistory.sort((a, b) => b.timestamp - a.timestamp);
        
        res.json({ loginHistory: sortedHistory });
    } catch (err) {
        console.error("Error fetching login history:", err);
        res.status(500).json({ msg: "Server Error" });
    }
};

export const toggleTwoFactorAuth = async (req, res) => {
  try {
    const { enable } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Record the 2FA toggle in login history
    user.loginHistory.push({
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent'],
      status: "success",
      action: `Two-factor authentication ${enable ? 'enabled' : 'disabled'}`
    });

    user.twoFactorEnabled = enable;
    user.lastSecurityUpdate = new Date();
    await user.save();

    res.json({ 
      msg: `Two-factor authentication ${enable ? 'enabled' : 'disabled'} successfully`,
      twoFactorEnabled: user.twoFactorEnabled 
    });
  } catch (err) {
    console.error("Error toggling two-factor authentication:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const exportUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('name email phone role isVerified createdAt loginHistory');

        // CSV Header
        const csvHeader = 'Name,Email,Phone,Role,Verification Status,Created At,Last Login\n';

        // CSV Rows
        const csvRows = users.map(user => {
            // Get most recent successful login
            const lastLogin = user.loginHistory && user.loginHistory.length > 0
                ? user.loginHistory
                    .filter(login => login.status === 'success')
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
                : null;

            // Role Formatting
            const role =
                user.role === 'farmer' ? 'Farmer' :
                user.role === 'buyer' ? 'Buyer' :
                user.role === 'truck_driver' ? 'Truck Driver' :
                'ADMIN';

            return [
                `"${user.name || ''}"`,
                `"${user.email || ''}"`,
                `"${user.phone || ''}"`,
                `"${role}"`,
                `"${user.isVerified ? 'Verified' : 'Unverified'}"`,
                `"${new Date(user.createdAt).toLocaleString()}"`,
                `"${lastLogin ? new Date(lastLogin.timestamp).toLocaleString() : 'Never'}"`
            ].join(',');
        }).join('\n');

        const csvContent = csvHeader + csvRows;

        // Set Headers for download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');

        // Send the file
        res.send(csvContent);

    } catch (err) {
        console.error('Error exporting users:', err);
        res.status(500).json({ message: 'Error exporting users' });
    }
};


