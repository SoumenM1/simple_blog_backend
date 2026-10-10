const ActivityLog = require("../models/ActivityLog");
module.exports = function activityLogger(req, res, next) {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (req.activityAction && res.statusCode < 400) {
      ActivityLog.create({
        user: req.user?._id || null,
        action: req.activityAction,
        resourceType: req.activityResourceType || "",
        resourceId: req.activityResourceId || "",
        ip: req.ip,
        userAgent: req.get("user-agent") || "",
      }).catch((err) => console.error("Activity log failed:", err.message));
    }
    return originalJson(body);
  };
  next();
};
