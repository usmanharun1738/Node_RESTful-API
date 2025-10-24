const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    state: { type: String, enum: ["draft", "published"], default: "draft" },
    read_count: { type: Number, default: 0 },
    reading_time: { type: Number, default: 0 },
    tags: [{ type: String }],
    body: { type: String, required: true },
  },
  { timestamps: true }
);

// Simple reading time estimate: 200 words per minute
blogSchema.methods.estimateReadingTime = function estimateReadingTime() {
  const words = (this.body || "").split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  this.reading_time = minutes;
  return this.reading_time;
};

module.exports = mongoose.model("Blog", blogSchema);
