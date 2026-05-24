import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import { siteConfig } from "./src/site.config";

const SITE = import.meta.env.PROD ? siteConfig.url : "http://localhost:4321";
// https://astro.build/config
export default defineConfig({
	site: SITE,
	output: "server",
	prefetch: {
		prefetchAll: true,
	},
	server: {
		port: 4321,
	},
	integrations: [react(), sitemap(), mdx()],
	adapter: cloudflare(),
	vite: {
		plugins: [tailwindcss()],
	},
});
