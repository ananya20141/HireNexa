/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if authenticated user has one of the allowed roles.
 */
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                message: "Access forbidden: Authentication required.",
                success: false
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Requires one of [${allowedRoles.join(', ')}] role.`,
                success: false
            });
        }

        next();
    };
};

export const isAdmin = authorizeRoles('admin');
export const isRecruiter = authorizeRoles('recruiter', 'admin');
export const isCandidate = authorizeRoles('student', 'admin');
