import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['pdfmake/build/pdfmake', 'pdfmake/build/vfs_fonts']
    }
  }
});
