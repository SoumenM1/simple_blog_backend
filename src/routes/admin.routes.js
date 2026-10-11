const router = require("express").Router();
const c = require("../controllers/admin.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");
const { z } = require("zod");
const validate = require("../middleware/validate.middleware");
router.use(protect, requireRole("admin"));
router.get("/dashboard", c.dashboard);
router.get("/users", c.users);
router.patch(
  "/users/:id/role",
  validate(
    z.object({
      body: z.object({ role: z.enum(["user", "admin"]) }),
      params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) }),
      query: z.record(z.any()).optional(),
    }),
  ),
  c.changeRole,
);
router.delete("/users/:id", c.deleteUser);
router.get("/posts", c.posts);
router.get("/posts/:id", c.getPost);
router.put("/posts/:id", c.updatePost);
router.patch(
  "/posts/:id/status",
  validate(
    z.object({
      body: z.object({
        status: z.enum(["draft", "pending", "published", "archived"]),
      }),
      params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) }),
      query: z.record(z.any()).optional(),
    }),
  ),
  c.setPostStatus,
);
router.delete("/posts/:id", c.deletePost);
router.get("/comments", c.comments);
router.delete("/comments/:id", c.deleteComment);
router.get("/activities", c.activities);
module.exports = router;
