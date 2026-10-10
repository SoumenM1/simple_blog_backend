process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET = "test_access_secret_long_enough_123456789";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_long_enough_123456789";
const request = require("supertest");
const app = require("../../src/app");
describe("GET /api/v1/health", () => {
  test("returns a versioned health response", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ok");
  });
});
