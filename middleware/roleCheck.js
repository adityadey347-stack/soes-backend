/**
 * Role-Based Authorization Middleware
 * Restricts access to routes based on user role
 * @param  {...String} roles - Allowed roles (e.g., 'admin', 'student')
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        // Check if user exists (should be set by protect middleware)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
        }

        // Check if user's role is in the allowed roles
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Only ${roles.join(' or ')} can access this route`,
            });
        }

        next();
    };
};
