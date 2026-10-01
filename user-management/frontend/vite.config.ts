import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// В режиме разработки запросы к API перенаправляются на локальный сервер
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { "/api": "http://localhost:8000" } },
});
