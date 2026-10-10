const slugify = require("slugify");
describe("slug generation primitive", () => {
  test("creates a URL friendly slug", () => {
    expect(slugify("Hello Inkline Blog!", { lower: true, strict: true })).toBe(
      "hello-inkline-blog",
    );
  });
});
