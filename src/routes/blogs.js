const express = require("express");
const blogs = require("../controllers/blogs");
const auth = require("../middleware/auth");

const router = express.Router();

// Public list and get
router.get("/", auth.optional, blogs.list);
router.get("/:id", auth.optional, blogs.get);

// Protected actions
router.post("/", auth.required, blogs.create);
router.put("/:id", auth.required, blogs.update);
router.delete("/:id", auth.required, blogs.remove);
router.post("/:id/publish", auth.required, blogs.publish);
router.get("/me/list", auth.required, blogs.own);

module.exports = router;
