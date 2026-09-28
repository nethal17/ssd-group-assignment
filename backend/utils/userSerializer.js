// The only user fields that may leave the API. Use as a query projection
// (User.find().select(USER_SAFE_FIELDS)) and shape responses with toUserDTO,
// so a user document is never serialised directly.
export const USER_SAFE_FIELDS =
    "name email phone role profilePic isVerified twoFactorEnabled lastSecurityUpdate createdAt updatedAt";

export const toUserDTO = (user) => {
    if (!user) return null;

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePic: user.profilePic,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        lastSecurityUpdate: user.lastSecurityUpdate,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

// Admin listing view: the safe fields plus the most recent successful login.
// Only the timestamp and device are exposed - never IP addresses or the full history.
export const toAdminUserSummary = (user) => {
    const lastLogin = (user.loginHistory || [])
        .filter((entry) => entry.status === "success")
        .reduce((latest, entry) => (!latest || entry.timestamp > latest.timestamp ? entry : latest), null);

    return {
        ...toUserDTO(user),
        lastLogin: lastLogin
            ? { timestamp: lastLogin.timestamp, deviceInfo: lastLogin.deviceInfo }
            : null,
    };
};
