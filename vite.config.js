// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: "/Noorstudioo/", // 👈 اسم الريبو بتاعك
  plugins: [react()],
  server: {
    host: true
  },
  build: {
    minify: false, // تعطيل Minification لرؤية الأخطاء بوضوح
    sourcemap: true
  }
})





