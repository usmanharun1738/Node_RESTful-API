const express = require("express");
require("express-async-errors");
const morgan = require("morgan");
const cors = require("cors");
const logger = require("./utils/logger");
const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blogs");
const errorHandler = require("./middleware/error");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

app.get("/", (req, res) => res.json({ ok: true }));

app.use(errorHandler);

module.exports = app;
