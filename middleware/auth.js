// middleware/auth.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).json({ error: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, dotenv.config().parsed.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: "Token is not valid" });
  }
};

module.exports = auth;
