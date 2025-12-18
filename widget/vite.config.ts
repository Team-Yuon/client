import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'YuonChat',
      formats: ['umd'],
      fileName: () => 'yuon-widget.js',
    },
    rollupOptions: {
      output: {
        // CSS를 JS에 인라인
        inlineDynamicImports: true,
        // 전역 변수로 노출
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    cssCodeSplit: false,
    // 최적화
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../'),
    },
  },
})
