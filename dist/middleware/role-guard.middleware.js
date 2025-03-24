"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleGuard = void 0;
const roleGuard = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            res.status(403).json({ message: "Forbidden: Insufficient permissions." });
            return;
        }
        next();
    };
};
exports.roleGuard = roleGuard;
