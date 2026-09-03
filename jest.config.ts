import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Path to your Next.js app, so next/jest can load next.config.ts and .env files.
  dir: "./",
});

// Custom Jest config, passed to next/jest's createJestConfig.
const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  coverageProvider: "v8",
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
};

// createJestConfig is exported this way to ensure next/jest can load the Next.js config, which is async.
export default createJestConfig(config);
