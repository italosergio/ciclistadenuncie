import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["app/**/*.test.ts", "app/**/*.test.tsx"],
    setupFiles: ["./app/test-setup.ts"],
    // environmentMatch removido — não existe no Vitest 4.x
    // Usar comentários @vitest-environment node nos arquivos que precisam
  },
});
