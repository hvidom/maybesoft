import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

import { siteConfig } from './src/site.config';
const SITE = import.meta.env.PROD ? siteConfig.url : 'http://localhost:4321';
// https://astro.build/config
export default defineConfig({
  site: SITE,
  server: {
    port: 4321,
  },
  integrations: [react(), sitemap(), mdx()],
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()]
  }
});