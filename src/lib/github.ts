// src/lib/github.ts

import matter from "gray-matter";
import { Octokit } from "octokit";

const octokit = new Octokit({
	auth: import.meta.env.GITHUB_TOKEN || "",
});

interface GitHubFileResponse {
	content: string;
	encoding: string;
}

// 1. MAKE SURE "export" IS HERE!
export async function getRemotePost(path: string) {
	try {
		const response = await octokit.request(
			"GET /repos/{owner}/{repo}/contents/{path}",
			{
				owner: "hvidom",
				repo: "maybesoft",
				path: path,
				headers: {
					"X-GitHub-Api-Version": "2022-11-28",
				},
			},
		);

		if ("content" in response.data && response.data.encoding === "base64") {
			const data = response.data as GitHubFileResponse;
			return Buffer.from(data.content, "base64").toString("utf-8");
		}

		throw new Error("Target path is not a single file.");
	} catch (error) {
		console.error(`[GitHub API Error] Failed to grab: ${path}`, error);
		return null;
	}
}

// 2. MAKE SURE "export" IS ALSO HERE!
export async function getAllRemotePosts() {
	try {
		const response = await octokit.request(
			"GET /repos/{owner}/{repo}/contents/{path}",
			{
				owner: "hvidom",
				repo: "maybesoft",
				path: "src/content/blog",
				headers: { "X-GitHub-Api-Version": "2022-11-28" },
			},
		);

		if (Array.isArray(response.data)) {
			const posts = [];

			for (const file of response.data) {
				if (file.name.endsWith(".md")) {
					const slug = file.name.replace(".md", "");

					// Calling the local helper function above
					const rawContent = await getRemotePost(file.path);

					if (rawContent) {
						const { data: frontmatter } = matter(rawContent);

						let displayImage =
							"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600";
						if (frontmatter.heroImage) {
							if (frontmatter.heroImage.startsWith("../../assets/")) {
								displayImage = "/fallback.png";
							} else {
								displayImage = frontmatter.heroImage;
							}
						}

						posts.push({
							slug,
							title: frontmatter.title || "Untitled Post",
							description: frontmatter.description || "",
							date: frontmatter.pubDate
								? new Date(frontmatter.pubDate).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})
								: "Unknown Date",
							image: displayImage,
						});
					}
				}
			}
			return posts;
		}
		return [];
	} catch (error) {
		console.error("Failed fetching collection metadata directory:", error);
		return [];
	}
}
