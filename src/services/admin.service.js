const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const HttpError = require("../utils/httpError");
async function dashboard() {
  const [users, posts, comments, publishedPosts] = await Promise.all([
    User.countDocuments({ isDeleted: false }),
    Post.countDocuments({ isDeleted: false }),
    Comment.countDocuments({ isDeleted: false }),
    Post.countDocuments({ isDeleted: false, status: "published" }),
  ]);
  return { users, posts, comments, publishedPosts };
}
async function listUsers({ page = 1, limit = 20, search, role } = {}) {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(100, Math.max(1, Number(limit) || 20));
  const filter = { isDeleted: false };
  if (role) filter.role = role;
  if (search)
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);
  return {
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
async function changeRole(id, role, actor) {
  if (id === actor._id.toString() && role !== "admin")
    throw new HttpError(400, "You cannot remove your own admin role");
  const user = await User.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { role },
    { new: true, runValidators: true },
  );
  if (!user) throw new HttpError(404, "User not found");
  return user;
}
async function softDeleteUser(id, actor) {
  if (id === actor._id.toString())
    throw new HttpError(
      400,
      "You cannot delete your own account from admin panel",
    );
  const user = await User.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true },
  );
  if (!user) throw new HttpError(404, "User not found");
  return user;
}
async function listAllPosts({ page = 1, limit = 20, search, status } = {}) {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(100, Math.max(1, Number(limit) || 20));
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.$text = { $search: search };
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "name email")
      .lean(),
    Post.countDocuments(filter),
  ]);
  return {
    posts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getById(id) {
  const post = await Post.findOne({ _id
: id, isDeleted: false }).populate("author", "name email");
  if (!post) throw new HttpError(404, "Post not found");
  return post;
}

async function setPostStatus(id, status) {
  let isDeleted = false;

 if(status !== "published"){
   isDeleted = true;

 }  

  const post = await Post.findOneAndUpdate(
    { _id: id},
    { status, isDeleted: isDeleted },
    { new: true, runValidators: true },
  ).populate("author", "name email");
  if (!post) throw new HttpError(404, "Post not found");
  return post;
}   

async function updatePost(id, data) {
  const post = await Post.findOneAndUpdate(
    { _id: id},
    { ...data , isDeleted: false },
    { new: true, runValidators: true },
  ).populate("author", "name email");
  if (!post) throw new HttpError(404, "Post not found");
  return post;
}

async function deletePost(id) {
  const post = await Post.findOneAndDelete({_id: id});
  if (!post) throw new HttpError(404, "Post not found");
  return post;
}

module.exports = {
  dashboard,
  listUsers,
  changeRole,
  softDeleteUser,
  listAllPosts,
  getById,
  setPostStatus,
  updatePost,
  deletePost,
};
