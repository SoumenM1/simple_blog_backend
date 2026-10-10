const Post = require("../models/Post");
const Comment = require("../models/Comment");
const HttpError = require("../utils/httpError");
const slugify = require("slugify");
async function uniqueSlug(title, excludeId) {
  const base = slugify(title, { lower: true, strict: true }) || "post";
  let slug = base,
    n = 1;
  while (
    await Post.exists({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  )
    slug = `${base}-${++n}`;
  return slug;
}
async function create(data, user) {
  const post = await Post.create({
    ...data,
    slug: await uniqueSlug(data.title),
    author: user._id,
  });
  return post.populate("author", "name avatar");
}
async function list(
  { page = 1, limit = 10, search, status, category },
  user,
  admin = false,
) {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(50, Math.max(1, Number(limit) || 10));
  const filter = { isDeleted: false };
  if (!admin) {
    filter.status = "published";
  } else if (status) filter.status = status;
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "name avatar")
      .lean(),
    Post.countDocuments(filter),
  ]);
  return {
    posts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
async function getBySlug(slug) {
  const post = await Post.findOne({
    slug,
    status: "published",
    isDeleted: false,
  }).populate("author", "name avatar");
  if (!post) throw new HttpError(404, "Post not found");
  return post;
}
async function update(id, data, user, admin = false) {
  const post = await Post.findOne({ _id: id, isDeleted: false });
  if (!post) throw new HttpError(404, "Post not found");
  if (!admin && post.author.toString() !== user._id.toString())
    throw new HttpError(403, "You can only edit your own posts");
  if (data.title && data.title !== post.title)
    post.slug = await uniqueSlug(data.title, post._id);
  Object.assign(post, data);
  await post.save();
  return post.populate("author", "name avatar");
}
async function softDelete(id, user, admin = false) {
  const post = await Post.findOne({ _id: id, isDeleted: false });
  if (!post) throw new HttpError(404, "Post not found");
  if (!admin && post.author.toString() !== user._id.toString())
    throw new HttpError(403, "You can only delete your own posts");
  post.isDeleted = true;
  post.status = "archived";
  post.deletedAt = new Date();
  await post.save();
  await Comment.updateMany(
    { post: post._id, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date() } },
  );
  return post;
}
async function mine(user, { page = 1, limit = 10 } = {}) {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(50, Math.max(1, Number(limit) || 10));
  const filter = { author: user._id, isDeleted: false };
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Post.countDocuments(filter),
  ]);
  return {
    posts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
module.exports = { create, list, getBySlug, update, softDelete, mine };
