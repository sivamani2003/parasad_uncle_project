import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      'pdfmake': 'pdfmake/build/pdfmake',
      'pdfmake/build/vfs_fonts': 'pdfmake/build/vfs_fonts'
    }
  }
});
