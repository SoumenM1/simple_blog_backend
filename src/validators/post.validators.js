const { z } = require("zod");

const postBodySchema = z
  .object({
    title: z.string().trim().min(3).max(180),
    excerpt: z.string().trim().max(500).optional().default(""),
    content: z.string().min(1).max(200000),
    coverImage: z.string().trim().max(2000).optional().default(""),
    category: z.string().trim().max(80).optional().default("Uncategorized"),
    tags: z
      .array(z.string().trim().min(1).max(40))
      .max(20)
      .optional()
      .default([]),
    status: z.enum(["draft", "published", "pending", "archived"]).optional(),
  })
  .strict();

const statusSchema = z
  .object({
    status: z.enum(["draft", "published", "pending", "archived"]),
  })
  .strict();

const roleSchema = z
  .object({
    role: z.enum(["user", "admin"]),
  })
  .strict();

module.exports = { postBodySchema, statusSchema, roleSchema };
