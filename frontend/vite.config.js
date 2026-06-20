import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "blacktickets-dev-alb-821224321.us-east-1.elb.amazonaws.com",
      "localhost",
      "0.0.0.0"
    ]
  }
});
