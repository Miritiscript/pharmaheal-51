
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: true,
    },
    // Add cache control for development server
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Ensure all development tools work properly
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  // Add build-specific options
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: mode !== "production",
    // Disable cache for assets
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['next-themes', 'lucide-react'],
        },
        // Ensure file extensions are preserved and use content hash for cache busting
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      },
    },
  },
  // Explicitly define development behavior
  mode: process.env.NODE_ENV || mode,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || mode),
    'import.meta.env.DEV': mode === 'development',
    'import.meta.env.PROD': mode === 'production',
  },
}));
