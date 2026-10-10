const router = require("express").Router();
const c = require("../controllers/post.controller");
const comments = require("../controllers/comment.controller");
const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const s = require("../validators/schemas");
router.get("/", c.list);
router.get("/my-posts", protect, c.mine);
router.post("/", protect, validate(s.postCreate), c.create);
router.get("/:slug", c.get);
router.put("/:id", protect, validate(s.postUpdate), c.update);
router.delete("/:id", protect, c.remove);
router.get("/:postId/comments", comments.list);
router.post(
  "/:postId/comments",
  protect,
  validate(s.commentCreate),
  comments.create,
);
router.put(
  "/comments/:id",
  protect,
  validate(s.commentUpdate),
  comments.update,
);
router.delete("/comments/:id", protect, comments.remove);
module.exports = router;
