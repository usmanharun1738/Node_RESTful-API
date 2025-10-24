const jwt = require("jsonwebtoken");
const User = require("../models/user");

const JWT_SECRET = process.env.JWT_SECRET || "secret";

function getTokenFromHeader(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const parts = auth.split(" ");
  if (parts.length !== 2) return null;
  return parts[1];
}

exports.required = async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: "Invalid token" });
    req.user = { id: String(user._id), email: user.email };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

exports.optional = async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (user) req.user = { id: String(user._id), email: user.email };
  } catch (err) {
    // ignore invalid token for optional
  }
  return next();
};
