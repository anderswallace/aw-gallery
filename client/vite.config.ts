/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

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
  plugins: [react(), tailwindcss()],
});
