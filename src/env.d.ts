/// <reference types="astro/client" />

interface ImportMetaEnv {
	// Explicitly declare your environment variables types here
	readonly GITHUB_TOKEN: string;
	readonly GITHUB_CLIENT_ID: string;
	readonly GITHUB_CLIENT_SECRET: string;
	readonly GITHUB_REDIRECT_URI: string;
	readonly BETTER_AUTH_SECRET: string;
	readonly BETTER_AUTH_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {
		[x: string]: any;
	}
}

/** Merge with `worker-configuration.d.ts` so `env` from `cloudflare:workers` is typed. */
declare namespace Cloudflare {
	interface Env {
		d1_prod: D1Database;
		ASSETS: Fetcher;
		CLOUDFLARE_ACCOUNT_ID: string;
		CLOUDFLARE_D1_DATABASE_ID: string;
		CLOUDFLARE_D1_TOKEN: string;
		LOCAL_DB_PATH: string;

		GITHUB_TOKEN: string;
		GITHUB_CLIENT_ID: string;
		GITHUB_CLIENT_SECRET: string;
		GITHUB_REDIRECT_URI: string;
		BETTER_AUTH_SECRET: string;
		BETTER_AUTH_URL: string;
	}
}
