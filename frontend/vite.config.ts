import path from "node:path";
import { defineConfig, transformWithEsbuild, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// CRA-era source uses .js files containing JSX. Vite's built-in
// `esbuild.include` option for this is documented but flaky on Windows
// path separators, so we use an explicit transform plugin instead: it
// strips JSX out of any src/*.js file before the rest of the pipeline
// sees it. Files transformed this way don't get React Fast Refresh
// (only .jsx/.tsx do) — resolves itself as each file is converted to
// .tsx during the ongoing TypeScript migration.
const jsxInJsPlugin: Plugin = {
  name: "treat-js-files-as-jsx",
  async transform(code, id) {
    if (!id.match(/[\\/]src[\\/].*\.js$/)) return null;
    // esbuild's SourceMap type doesn't line up exactly with Rollup's
    // (nullable sourcesContent entries); cast since this is tooling glue,
    // not application logic where the mismatch would matter.
    const result = await transformWithEsbuild(code, id, {
      loader: "jsx",
      jsx: "automatic",
    });
    return { code: result.code, map: result.map as any };
  },
};

export default defineConfig(({ mode }) => ({
  plugins: [jsxInJsPlugin, react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { ".js": "jsx" },
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
  },
  build: {
    outDir: "build",
  },
  server: {
    port: 3000,
    proxy: {
      "/auth": "http://localhost:5000",
      "/task": "http://localhost:5000",
      "/syllabus": "http://localhost:5000",
      "/announcement": "http://localhost:5000",
    },
  },
}));
