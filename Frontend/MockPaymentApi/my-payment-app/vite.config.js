import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Mở băng thông để mạng LAN nhìn thấy
    port: 5173,
    strictPort: true,
    cors: true, // Bật tính năng chia sẻ tài nguyên chéo cổng
    
    // 🔥 CÚ PHÁP CHUẨN CỦA VITE MỚI ĐỂ KHÔNG BỊ SẬP WEB:
    allowedHosts: true, // Dùng true thay vì 'all' bạn nhé!
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})