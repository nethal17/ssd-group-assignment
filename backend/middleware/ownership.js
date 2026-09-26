const ADMIN_ROLE = "admin";

// Allows admins, or a user acting on their own record. Everything else gets 403.
// Runs after authMiddleware, which sets req.user.
export const requireSelfOrAdmin = (param = "id") => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ msg: "No token, authorization denied" });
        }

        if (req.user.role === ADMIN_ROLE) {
            return next();
        }

        const targetId = req.params[param];
        const callerId = req.user.id || req.user._id;

        if (targetId && callerId && String(targetId) === String(callerId)) {
            return next();
        }

        return res.status(403).json({ msg: "Access denied. You can only access your own resources." });
    };
};
