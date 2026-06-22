import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      process.env.VITE_ALLOWED_HOST || ".elb.amazonaws.com",
      "localhost",
      "0.0.0.0"
    ]
  }
});
