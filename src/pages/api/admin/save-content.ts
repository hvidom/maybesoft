import type { APIRoute } from "astro";
import { Octokit } from "octokit";

export const prerender = false;

const toBase64 = (str: string) => {
	// Use TextEncoder + Uint8Array → base64 (fully compatible with Cloudflare Workers / workerd)
	const bytes = new TextEncoder().encode(str);
	let binary = "";
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
};

export const POST: APIRoute = async ({ request, cookies }) => {
	const token = cookies.get("admin_github_token")?.value;

	if (!token) {
		return new Response(
			JSON.stringify({ success: false, error: "Unauthorized" }),
			{ status: 401 },
		);
	}

	try {
		const { path, frontmatter, content } = (await request.json()) as {
			path: string;
			frontmatter: any;
			content: string;
		};

		if (!path || !frontmatter || content === undefined) {
			return new Response(
				JSON.stringify({ success: false, error: "Missing required fields" }),
				{ status: 400 },
			);
		}

		// Build markdown content with frontmatter
		let fileContent = "---\n";
		for (const [key, value] of Object.entries(frontmatter)) {
			if (value !== undefined && value !== null) {
				if (value instanceof Date) {
					fileContent += `${key}: ${value.toISOString().split("T")[0]}\n`;
				} else if (typeof value === "string" && value.includes("\n")) {
					fileContent += `${key}: |\n  ${value.replace(/\n/g, "\n  ")}\n`;
				} else {
					fileContent += `${key}: "${value}"\n`;
				}
			}
		}
		fileContent += `---\n\n${content}`;

		const octokit = new Octokit({ auth: token });
		const owner = "hvidom";
		const repo = "maybesoft";

		// Get the current file details to retrieve the SHA hash (required for update)
		let sha: string | undefined;
		try {
			const { data } = await octokit.rest.repos.getContent({
				owner,
				repo,
				path,
			});
			if (data && !Array.isArray(data)) {
				sha = data.sha;
			}
		} catch (_e) {
			// File might not exist yet (creating new file)
			console.log("File does not exist, creating a new file.");
		}

		// Create or update file contents on GitHub
		await octokit.rest.repos.createOrUpdateFileContents({
			owner,
			repo,
			path,
			message: `Update ${path.split("/").pop()} via Admin Panel`,
			content: toBase64(fileContent),
			sha,
		});

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error: any) {
		console.error("Error saving content:", error);
		return new Response(
			JSON.stringify({ success: false, error: error.message }),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}
};
