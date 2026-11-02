// Plain Vite build for the Docker image (nginx serves static files).
// The standard config forces the Cloudflare Build Output directory,
// which is only what `cf` deployments need.
import { defineConfig } from "vite";

export default defineConfig({});
