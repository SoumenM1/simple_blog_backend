const admin = require("../services/admin.service");
const comments = require("../services/comment.service");
const asyncHandler = require("../utils/asyncHandler");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
exports.dashboard = asyncHandler(async (_req, res) =>
  res.json({ success: true, data: await admin.dashboard() }),
);
exports.users = asyncHandler(async (req, res) =>
  res.json({ success: true, data: await admin.listUsers(req.query) }),
);
exports.changeRole = asyncHandler(async (req, res) =>
  res.json({
    success: true,
    data: {
      user: await admin.changeRole(req.params.id, req.body.role, req.user),
    },
  }),
);
exports.deleteUser = asyncHandler(async (req, res) =>
  res.json({
    success: true,
    data: { user: await admin.softDeleteUser(req.params.id, req.user) },
  }),
);
exports.posts = asyncHandler(async (req, res) =>
  res.json({ success: true, data: await admin.listAllPosts(req.query) }),
);

exports.getPost = asyncHandler(async (req, res) => {
  const post = await admin.getById(req.params.id);
  if (!post)
    return res
      .status(404)
      .json({ success: false, error: { message: "Post not found" } });
  res.json({ success: true, data: { post } });
});

exports.updatePost = asyncHandler(async (req, res) => {
  const post = await admin.updatePost(req.params.id, req.body);
  console.log("Updated Post:", req.params.id, req.body);
  if (!post)
    return res
      .status(404)
      .json({ success: false, error: { message: "Post not found" } });
  res.json({ success: true, data: { post } });
  
});

exports.setPostStatus = asyncHandler(async (req, res) => {
  const post = await admin.setPostStatus(req.params.id, req.body.status);
  if (!post)
    return res
      .status(404)
      .json({ success: false, error: { message: "Post not found" } });
  res.json({ success: true, data: { post } });
});

exports.deletePost = asyncHandler(async (req, res) => {
  await admin.deletePost(req.params.id);
  res.json({ success: true, message: "Post moved to trash" });
});
exports.comments = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1),
    limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const filter = { isDeleted: false };
  const [items, total] = await Promise.all([
    Comment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "name email")
      .populate("post", "title slug")
      .lean(),
    Comment.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: {
      comments: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  });
});
exports.deleteComment = asyncHandler(async (req, res) => {
  await comments.softDelete(req.params.id, req.user, true);
  res.json({ success: true, message: "Comment moved to trash" });
});
exports.activities = asyncHandler(async (req, res) => {
  const ActivityLog = require("../models/ActivityLog");
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const logs = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("user", "name email")
    .lean();
  res.json({ success: true, data: { activities: logs } });
});
