import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";

export const GET: APIRoute = ({ redirect }) => {
	const clientId = env.GITHUB_CLIENT_ID;
	const redirectUri =
		env.GITHUB_REDIRECT_URI || "http://localhost:4321/admin/auth/callback";

	if (!clientId) {
		return new Response(
			"GitHub Client ID is not configured in .env file or Cloudflare environment variables.",
			{ status: 500 },
		);
	}

	const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo`;

	return redirect(githubAuthUrl);
};
