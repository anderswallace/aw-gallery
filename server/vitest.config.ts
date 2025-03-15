/// <reference types="vitest" />
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text"],
      exclude: ["**/node_modules/**", "**/*.config.*/**"],
      all: true,
      // outputDirectory: './coverage',
    },
  },
});
