/// <reference types="vite/client" />

// Vite's built-in asset-module types don't cover .jfif (used by one of the
// original background images); declare it the same way Vite declares .jpg.
declare module "*.jfif" {
  const src: string;
  export default src;
}
