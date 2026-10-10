require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/db");
const required = ["MONGODB_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}
const port = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    const server = app.listen(port, () =>
      console.log(`Inkline API listening on port ${port}`),
    );
    const shutdown = async () => {
      server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
    };
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
})();
