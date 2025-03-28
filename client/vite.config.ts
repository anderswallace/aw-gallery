/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

if (process.env.NODE_ENV === "production" && !process.env.VITE_API_URI) {
  throw new Error("VITE_API_URI is not defined at build time.");
}

// https://vite.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text"],
      exclude: ["**/node_modules/**", "**/*.config.*/**", "**/dist/**"],
      all: true,
      // outputDirectory: './coverage',
    },
  },
  plugins: [react(), tailwindcss()],
});
