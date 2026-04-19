const dotenv = require("dotenv");
const { execSync } = require("child_process");
const fs = require("fs");

process.env.NODE_ENV = "test";

if (!fs.existsSync(".env.test")) {
  throw new Error(
    "Missing .env.test. Create it from .env.example and point POSTGRES_DB to a test database.",
  );
}

dotenv.config({ path: ".env.test" });

try {
  execSync("node ./node_modules/db-migrate/bin/db-migrate up --env test", {
    stdio: "inherit",
  });
} catch (error) {
  throw new Error(
    `Test database migration failed. Ensure PostgreSQL is running and .env.test is valid. ${error}`,
  );
}
