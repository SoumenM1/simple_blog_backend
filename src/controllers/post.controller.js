const service = require("../services/post.service");
const asyncHandler = require("../utils/asyncHandler");
exports.list = asyncHandler(async (req, res) =>
  res.json({
    success: true,
    data: await service.list(req.query, req.user, false),
  }),
);
exports.get = asyncHandler(async (req, res) =>
  res.json({
    success: true,
    data: { post: await service.getBySlug(req.params.slug) },
  }),
);
exports.create = asyncHandler(async (req, res) => {
  req.activityAction = "post.create";
  req.activityResourceType = "post";
  console.log("req.body in post.controller.js create:", req.body);
  const post = await service.create(req.body, req.user);
  req.activityResourceId = post._id.toString();
  res.status(201).json({ success: true, data: { post } });
});

exports.mine = asyncHandler(async (req, res) =>
  res.json({ success: true, data: await service.mine(req.user, req.query) }),
);
exports.update = asyncHandler(async (req, res) => {
  req.activityAction = "post.update";
  req.activityResourceType = "post";
  req.activityResourceId = req.params.id;
  const post = await service.update(req.params.id, req.body, req.user, false);
  res.json({ success: true, data: { post } });
});
exports.remove = asyncHandler(async (req, res) => {
  req.activityAction = "post.soft_delete";
  req.activityResourceType = "post";
  req.activityResourceId = req.params.id;
  await service.softDelete(req.params.id, req.user, false);
  res.json({ success: true, message: "Post moved to trash" });
});
