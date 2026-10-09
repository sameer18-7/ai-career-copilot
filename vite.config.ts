import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    port: 8080, // Standard local dev port
  },
  plugins: [
    // Handles Tailwind CSS V4
    tailwindcss(),
    // Resolves TypeScript paths/aliases based on tsconfig.json
    tsconfigPaths(),
    // Configures TanStack Start SSR (includes Router automatically)
    tanstackStart(),
    // Enables React support in Vite
    react(),
  ],
});
