const dotenv = require("dotenv");
const { execSync } = require("child_process");

process.env.NODE_ENV = "test";
dotenv.config({ path: ".env.test" });

execSync("yarn db-migrate up", { stdio: "inherit" });
