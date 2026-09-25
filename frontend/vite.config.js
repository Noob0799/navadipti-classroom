import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";

// CRA-era source uses .js files containing JSX. Vite's built-in
// `esbuild.include` option for this is documented but flaky on Windows
// path separators, so we use an explicit transform plugin instead: it
// strips JSX out of any src/*.js file before the rest of the pipeline
// sees it. Files transformed this way don't get React Fast Refresh
// (only .jsx/.tsx do) — acceptable since Workstream 1 converts every
// file to .tsx shortly, which regains it.
const jsxInJsPlugin = {
  name: "treat-js-files-as-jsx",
  async transform(code, id) {
    if (!id.match(/[\\/]src[\\/].*\.js$/)) return null;
    return transformWithEsbuild(code, id, {
      loader: "jsx",
      jsx: "automatic",
    });
  },
};

export default defineConfig(({ mode }) => ({
  plugins: [jsxInJsPlugin, react()],
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
