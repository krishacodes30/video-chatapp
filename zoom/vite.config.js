// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import nodePolyfills from "rollup-plugin-node-polyfills";

export default defineConfig({
  plugins: [react()],

  define: {
    global: "globalThis",   // ⭐ FIX GLOBAL
  },

  resolve: {
    alias: {
      buffer: "buffer",
    },
  },

  build: {
    rollupOptions: {
      plugins: [
        nodePolyfills()     // ⭐ POLYFILL NODE MODULES
      ],
    },
  },
});
