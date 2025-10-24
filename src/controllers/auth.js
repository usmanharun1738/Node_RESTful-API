const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const logger = require("../utils/logger");

const JWT_SECRET = process.env.JWT_SECRET || "secret";

exports.signup = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ message: "Email already in use" });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    first_name,
    last_name,
    email,
    password: hash,
  });
  logger.info("User signed up", { userId: user._id, email: user.email });
  return res.status(201).json({ id: user._id, email: user.email });
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "1h",
  });
  logger.info("User signed in", { userId: user._id });
  return res.json({ token });
};
