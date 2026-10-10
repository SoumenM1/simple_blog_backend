const { z } = require("zod");
const id = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");
const common = {
  params: z.record(z.any()).optional(),
  query: z.record(z.any()).optional(),
};
const register = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().email().max(254),
    password: z.string().min(8).max(128),
  }),
  ...common,
});
const login = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1).max(128),
  }),
  ...common,
});
const postCreate = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(180),
    
    content: z.string().min(1).max(100000),
    category: z.string().trim().max(80).optional(),
    status: z.enum(["draft", "pending", "published", "archived"]).optional(),
  }),
  ...common,
});
const postUpdate = z.object({
  body: z
    .object({
      title: z.string().trim().min(3).max(180).optional(),
      content: z.string().min(1).max(100000).optional(),
      category: z.string().trim().max(80).optional(),
      status: z.enum(["draft", "pending", "published", "archived"]).optional(),
    })
    .refine((v) => Object.keys(v).length > 0, "At least one field is required"),
  params: z.object({ id }),
  query: z.record(z.any()).optional(),
});
const commentCreate = z.object({
  body: z.object({ content: z.string().trim().min(1).max(3000) }),
  params: z.object({ postId: id }),
  query: z.record(z.any()).optional(),
});
const commentUpdate = z.object({
  body: z.object({ content: z.string().trim().min(1).max(3000) }),
  params: z.object({ id }),
  query: z.record(z.any()).optional(),
});
module.exports = {
  register,
  login,
  postCreate,
  postUpdate,
  commentCreate,
  commentUpdate,
};
