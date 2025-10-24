const Blog = require("../models/blog");
const logger = require("../utils/logger");

// Helper to build query for list
function buildQuery({ state, search }) {
  const q = {};
  if (state) q.state = state;
  if (search) {
    const re = new RegExp(search, "i");
    q.$or = [{ title: re }, { tags: re }];
  }
  return q;
}

exports.create = async (req, res) => {
  const { title, description, tags, body } = req.body;
  const author = req.user.id;
  const blog = new Blog({ title, description, tags, body, author });
  blog.estimateReadingTime();
  await blog.save();
  logger.info("Blog created", { blogId: blog._id, author });
  return res.status(201).json(blog);
};

exports.publish = async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  if (!blog) return res.status(404).json({ message: "Not found" });
  if (String(blog.author) !== req.user.id)
    return res.status(403).json({ message: "Forbidden" });
  blog.state = "published";
  await blog.save();
  logger.info("Blog published", { blogId: blog._id });
  return res.json(blog);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  if (!blog) return res.status(404).json({ message: "Not found" });
  if (String(blog.author) !== req.user.id)
    return res.status(403).json({ message: "Forbidden" });
  const allowed = ["title", "description", "tags", "body", "state"];
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) blog[f] = req.body[f];
  });
  if (req.body.body) blog.estimateReadingTime();
  await blog.save();
  logger.info("Blog updated", { blogId: blog._id });
  return res.json(blog);
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  if (!blog) return res.status(404).json({ message: "Not found" });
  if (String(blog.author) !== req.user.id)
    return res.status(403).json({ message: "Forbidden" });
  await blog.deleteOne();
  logger.info("Blog deleted", { blogId: id });
  return res.status(204).send();
};

exports.get = async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id).populate(
    "author",
    "first_name last_name email"
  );
  if (!blog) return res.status(404).json({ message: "Not found" });
  if (blog.state !== "published" && String(blog.author._id) !== req.user?.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  blog.read_count += 1;
  await blog.save();
  logger.info("Blog read", { blogId: id });
  return res.json(blog);
};

exports.list = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;
  const { state, search, sortBy, order } = req.query;
  const q = buildQuery({ state, search });
  // Only allow published for public
  if (!req.user) q.state = "published";
  let cursor = Blog.find(q).populate("author", "first_name last_name email");
  // search by author name
  if (req.query.author) {
    cursor = cursor.where("author").in([]); // placeholder — we'll filter after populate
  }
  // ordering
  if (sortBy) {
    const ord = order === "desc" ? -1 : 1;
    const sort = {};
    sort[sortBy] = ord;
    cursor = cursor.sort(sort);
  } else {
    cursor = cursor.sort({ createdAt: -1 });
  }
  const total = await Blog.countDocuments(q);
  const items = await cursor.skip(skip).limit(limit).exec();
  // If author filter by name
  let filtered = items;
  if (req.query.author) {
    const re = new RegExp(req.query.author, "i");
    filtered = items.filter((b) =>
      re.test(`${b.author.first_name} ${b.author.last_name}`)
    );
  }
  return res.json({ page, limit, total, items: filtered });
};

exports.own = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;
  const q = { author: req.user.id };
  if (req.query.state) q.state = req.query.state;
  const total = await Blog.countDocuments(q);
  const items = await Blog.find(q)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  return res.json({ page, limit, total, items });
};
