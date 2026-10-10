const mongoose = require("mongoose");
const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true, minlength: 1 },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "pending", "published", "archived"],
      default: "draft",
      index: true,
    },
    coverImage: { type: String, default: "" },
    category: { type: String, trim: true, default: "General", maxlength: 80 },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
postSchema.index({ status: 1, isDeleted: 1, createdAt: -1 });
postSchema.index({ title: "text", content: "text" });
module.exports = mongoose.model("Post", postSchema);
