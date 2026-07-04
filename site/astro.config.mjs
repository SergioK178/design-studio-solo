// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// SSG (tech-spec §3); островки Svelte добавятся вместе с брифом.
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
