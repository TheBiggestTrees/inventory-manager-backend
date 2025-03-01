// middleware/admin.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const admin = (req, res, next) => {
    // Check if user exists (auth middleware should run first)
    if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user has admin privileges
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
    }

    next();
};

module.exports = admin;
