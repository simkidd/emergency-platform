"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuperAdmin = void 0;
const isSuperAdmin = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "super_admin") {
        return res
            .status(403)
            .json({ message: "Access denied. Super admin privileges required." });
    }
    next();
};
exports.isSuperAdmin = isSuperAdmin;
