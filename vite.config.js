import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: './', // Ensure this is set to relative path
  plugins: [vue()],
});
