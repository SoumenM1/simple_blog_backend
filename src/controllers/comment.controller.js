const service = require("../services/comment.service");
const asyncHandler = require("../utils/asyncHandler");
exports.list = asyncHandler(async (req, res) =>
  res.json({
    success: true,
    data: await service.list(req.params.postId, req.query),
  }),
);
exports.create = asyncHandler(async (req, res) => {
  req.activityAction = "comment.create";
  req.activityResourceType = "comment";
  const comment = await service.create(
    req.params.postId,
    req.user,
    req.body.content,
  );
  req.activityResourceId = comment._id.toString();
  res.status(201).json({ success: true, data: { comment } });
});
exports.update = asyncHandler(async (req, res) => {
  req.activityAction = "comment.update";
  req.activityResourceType = "comment";
  req.activityResourceId = req.params.id;
  const comment = await service.update(
    req.params.id,
    req.user,
    req.body.content,
    false,
  );
  res.json({ success: true, data: { comment } });
});
exports.remove = asyncHandler(async (req, res) => {
  req.activityAction = "comment.soft_delete";
  req.activityResourceType = "comment";
  req.activityResourceId = req.params.id;
  await service.softDelete(req.params.id, req.user, false);
  res.json({ success: true, message: "Comment moved to trash" });
});
