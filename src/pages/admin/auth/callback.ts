import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get('code');
  if (!code) {
    return new Response('No authorization code provided by GitHub.', { status: 400 });
  }

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;
  const redirectUri = env.GITHUB_REDIRECT_URI || 'http://localhost:4321/admin/auth/callback';

  if (!clientId || !clientSecret) {
    return new Response('GitHub OAuth credentials are not fully configured in Cloudflare environment.', { status: 500 });
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json() as { access_token?: string; error?: string; error_description?: string };

    if (tokenData.error || !tokenData.access_token) {
      return new Response(`GitHub OAuth Error: ${tokenData.error_description || tokenData.error}`, { status: 400 });
    }

    // Set cookie
    cookies.set('admin_github_token', tokenData.access_token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return redirect('/admin');
  } catch (error: any) {
    return new Response(`Authentication failed: ${error.message}`, { status: 500 });
  }
};
