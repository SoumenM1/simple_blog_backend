const mongoose = require("mongoose");
module.exports = mongoose.model(
  "ActivityLog",
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true,
      },
      action: { type: String, required: true, index: true },
      resourceType: { type: String, default: "" },
      resourceId: { type: String, default: "" },
      ip: { type: String, default: "" },
      userAgent: { type: String, default: "" },
      metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true },
  ),
);
