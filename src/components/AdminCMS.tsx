import {
	AlertTriangle,
	CheckCircle2,
	Edit3,
	Eye,
	FileText,
	Loader2,
	LogOut,
	Plus,
	Save,
	Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface BlogFile {
	name: string;
	path: string;
	sha: string;
	rawContent: string;
}

interface parsedData {
	frontmatter: {
		title: string;
		description: string;
		pubDate: string;
		updatedDate?: string;
		heroImage?: string;
	};
	content: string;
}

interface AdminCMSProps {
	initialFiles: BlogFile[];
	adminUser: {
		login: string;
		avatar_url: string;
		html_url: string;
	};
}

// Simple client-side Markdown to HTML parser
function parseMarkdownToHtml(md: string): string {
	if (!md) return '<p class="text-slate-500 italic">No content yet...</p>';

	let html = md
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");

	// Headers
	html = html.replace(
		/^### (.*$)/gim,
		'<h3 class="text-lg font-bold text-slate-100 mt-4 mb-2">$1</h3>',
	);
	html = html.replace(
		/^## (.*$)/gim,
		'<h2 class="text-xl font-bold text-slate-100 mt-5 mb-3 border-b border-slate-800 pb-1">$1</h2>',
	);
	html = html.replace(
		/^# (.*$)/gim,
		'<h1 class="text-2xl font-extrabold text-slate-50 mt-6 mb-4">$1</h1>',
	);

	// Bold / Italic
	html = html.replace(
		/\*\*(.*?)\*\*/g,
		'<strong class="font-bold text-slate-100">$1</strong>',
	);
	html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

	// Code Blocks & Inline Code
	html = html.replace(
		/```([\s\S]*?)```/g,
		'<pre class="bg-slate-950 p-4 rounded-lg my-4 overflow-x-auto border border-slate-800 text-xs font-mono text-cyan-400">$1</pre>',
	);
	html = html.replace(
		/`(.*?)`/g,
		'<code class="bg-slate-950 px-1.5 py-0.5 rounded text-cyan-300 text-xs font-mono">$1</code>',
	);

	// Lists
	html = html.replace(
		/^\s*-\s+(.*$)/gim,
		'<li class="ml-4 list-disc text-slate-300">$1</li>',
	);
	html = html.replace(
		/^\s*\*\s+(.*$)/gim,
		'<li class="ml-4 list-disc text-slate-300">$1</li>',
	);

	// Line breaks & Paragraphs
	html = html
		.split("\n\n")
		.map((p) => {
			if (
				p.trim().startsWith("<h") ||
				p.trim().startsWith("<li") ||
				p.trim().startsWith("<pre")
			) {
				return p;
			}
			return `<p class="mb-4 text-slate-300 leading-relaxed">${p.trim().replace(/\n/g, "<br/>")}</p>`;
		})
		.join("\n");

	return html;
}

// Utility to parse frontmatter from raw markdown
function parseMarkdown(rawContent: string): parsedData {
	const frontmatterRegex = /^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/;
	const match = rawContent.match(frontmatterRegex);

	if (!match) {
		return {
			frontmatter: {
				title: "",
				description: "",
				pubDate: new Date().toISOString().split("T")[0],
			},
			content: rawContent,
		};
	}

	const yamlBlock = match[1];
	const content = match[2];
	const frontmatter: any = {};

	yamlBlock.split("\n").forEach((line) => {
		const separatorIdx = line.indexOf(":");
		if (separatorIdx > 0) {
			const key = line.substring(0, separatorIdx).trim();
			let value = line.substring(separatorIdx + 1).trim();
			// Remove enclosing quotes
			value = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
			frontmatter[key] = value;
		}
	});

	return {
		frontmatter: {
			title: frontmatter.title || "",
			description: frontmatter.description || "",
			pubDate: frontmatter.pubDate || new Date().toISOString().split("T")[0],
			heroImage: frontmatter.heroImage || "",
			updatedDate: frontmatter.updatedDate || "",
		},
		content,
	};
}

export function AdminCMS({ initialFiles, adminUser }: AdminCMSProps) {
	const [files, setFiles] = useState<BlogFile[]>(initialFiles);
	const [selectedFile, setSelectedFile] = useState<BlogFile | null>(
		initialFiles[0] || null,
	);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [pubDate, setPubDate] = useState("");
	const [heroImage, setHeroImage] = useState("");
	const [content, setContent] = useState("");

	const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
	const [isSaving, setIsSaving] = useState(false);
	const [_isCreating, _setIsCreating] = useState(false);
	const [toast, setToast] = useState<{
		message: string;
		type: "success" | "error";
	} | null>(null);

	// Parse selected file details
	useEffect(() => {
		if (selectedFile) {
			const parsed = parseMarkdown(selectedFile.rawContent);
			setTitle(parsed.frontmatter.title);
			setDescription(parsed.frontmatter.description);
			setPubDate(parsed.frontmatter.pubDate);
			setHeroImage(parsed.frontmatter.heroImage || "");
			setContent(parsed.content);
		} else {
			setTitle("");
			setDescription("");
			setPubDate(new Date().toISOString().split("T")[0]);
			setHeroImage("");
			setContent("");
		}
	}, [selectedFile]);

	// Show auto-dismiss toast
	const showToast = (message: string, type: "success" | "error") => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 4000);
	};

	// Sign out handler
	const handleSignOut = () => {
		document.cookie =
			"admin_github_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
		window.location.href = "/admin/login";
	};

	// Create New Post template
	const handleCreateNew = () => {
		const filename = `post-${Date.now()}.md`;
		const newFile: BlogFile = {
			name: filename,
			path: `src/content/blog/${filename}`,
			sha: "",
			rawContent: `---\ntitle: "New Post"\ndescription: "Write a short summary..."\npubDate: "${new Date().toISOString().split("T")[0]}"\nheroImage: ""\n---\n\nWrite your blog content here in markdown...`,
		};

		setFiles([newFile, ...files]);
		setSelectedFile(newFile);
		showToast("New post draft created!", "success");
	};

	// Save changes via API
	const handleSave = async () => {
		if (!selectedFile) return;
		setIsSaving(true);

		try {
			const frontmatter = {
				title,
				description,
				pubDate,
				heroImage: heroImage || undefined,
				updatedDate: new Date().toISOString().split("T")[0],
			};

			const response = await fetch("/api/admin/save-content", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					path: selectedFile.path,
					frontmatter,
					content,
				}),
			});

			const result = (await response.json()) as {
				success: boolean;
				error?: string;
			};

			if (result.success) {
				// Re-construct raw content to save locally in state
				let updatedRaw = "---\n";
				updatedRaw += `title: "${title}"\n`;
				updatedRaw += `description: "${description}"\n`;
				updatedRaw += `pubDate: "${pubDate}"\n`;
				if (heroImage) updatedRaw += `heroImage: "${heroImage}"\n`;
				updatedRaw += `updatedDate: "${new Date().toISOString().split("T")[0]}"\n`;
				updatedRaw += `---\n\n${content}`;

				const updatedFiles = files.map((f) =>
					f.path === selectedFile.path ? { ...f, rawContent: updatedRaw } : f,
				);

				setFiles(updatedFiles);
				showToast("Changes pushed to GitHub successfully!", "success");
			} else {
				showToast(result.error || "Failed to save file", "error");
			}
		} catch (err: any) {
			showToast(err.message || "An error occurred", "error");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
			{/* Toast Notification */}
			{toast && (
				<div
					className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl transition-all duration-300 animate-slide-in ${
						toast.type === "success"
							? "bg-emerald-950/80 border-emerald-800 text-emerald-300 backdrop-blur"
							: "bg-rose-950/80 border-rose-800 text-rose-300 backdrop-blur"
					}`}
				>
					{toast.type === "success" ? (
						<CheckCircle2 className="h-5 w-5 text-emerald-400" />
					) : (
						<AlertTriangle className="h-5 w-5 text-rose-400" />
					)}
					<span className="text-sm font-medium">{toast.message}</span>
				</div>
			)}

			{/* Header bar */}
			<header className="h-16 border-b border-slate-900 bg-slate-900/40 backdrop-blur px-6 flex items-center justify-between z-20">
				<div className="flex items-center gap-2">
					<Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
					<span className="font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent text-lg">
						Maybesoft CMS
					</span>
					<span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
						v1.0.0
					</span>
				</div>

				<div className="flex items-center gap-4">
					<a
						href={adminUser.html_url}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 hover:bg-slate-800/50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-slate-800"
					>
						<img
							src={adminUser.avatar_url}
							alt={adminUser.login}
							className="h-6 w-6 rounded-full ring-1 ring-purple-500/50"
						/>
						<span className="text-xs text-slate-300 font-medium">
							@{adminUser.login}
						</span>
					</a>
					<button
						onClick={handleSignOut}
						className="flex items-center gap-1.5 text-xs text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/50 px-3 py-1.5 rounded-lg transition-all"
					>
						<LogOut className="h-4.5 w-4.5" />
						Sign Out
					</button>
				</div>
			</header>

			{/* Main Grid Workspace */}
			<div className="flex-1 flex overflow-hidden">
				{/* Sidebar file list */}
				<aside className="w-80 border-r border-slate-900 bg-slate-950/90 flex flex-col flex-shrink-0">
					<div className="p-4 border-b border-slate-900 flex justify-between items-center gap-2 bg-slate-900/10">
						<h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
							<FileText className="h-4 w-4" /> Articles
						</h2>
						<Button
							onClick={handleCreateNew}
							variant="outline"
							size="sm"
							className="h-8 border-purple-900/40 hover:border-purple-600 bg-purple-950/20 text-purple-300 hover:text-white flex items-center gap-1 px-2.5 rounded-lg"
						>
							<Plus className="h-3.5 w-3.5" /> New
						</Button>
					</div>

					<div className="flex-1 overflow-y-auto p-3 space-y-1">
						{files.length === 0 ? (
							<div className="text-center py-8 text-slate-500 text-sm">
								No articles found. Create your first post!
							</div>
						) : (
							files.map((file) => {
								const isSelected = selectedFile?.path === file.path;
								const parsed = parseMarkdown(file.rawContent);
								return (
									<button
										key={file.path}
										onClick={() => setSelectedFile(file)}
										className={`w-full text-left p-3.5 rounded-xl transition-all border text-slate-300 flex flex-col gap-1.5 ${
											isSelected
												? "bg-slate-900 border-slate-800 ring-1 ring-purple-500/20 shadow-md"
												: "bg-transparent border-transparent hover:bg-slate-900/40"
										}`}
									>
										<div className="font-semibold text-slate-200 text-sm line-clamp-1 group-hover:text-white">
											{parsed.frontmatter.title || file.name}
										</div>
										<div className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
											{parsed.frontmatter.description ||
												"No description provided."}
										</div>
										<div className="flex items-center justify-between text-[10px] text-slate-600 font-medium pt-1">
											<span>{file.name}</span>
											<span>{parsed.frontmatter.pubDate}</span>
										</div>
									</button>
								);
							})
						)}
					</div>
				</aside>

				{/* Content editing space */}
				{selectedFile ? (
					<main className="flex-1 flex flex-col overflow-hidden bg-slate-900/20">
						{/* Action Bar */}
						<div className="h-14 border-b border-slate-900 px-6 flex items-center justify-between bg-slate-900/10 flex-shrink-0">
							<div className="flex items-center gap-3">
								<span className="text-sm font-semibold text-slate-300 font-mono line-clamp-1">
									{selectedFile.path}
								</span>
								{selectedFile.sha === "" && (
									<span className="text-[10px] bg-amber-950/50 border border-amber-900 text-amber-400 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider animate-pulse">
										Draft
									</span>
								)}
							</div>

							<div className="flex items-center gap-3">
								{/* Mobile/Small Screen Tab Switchers */}
								<div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
									<button
										onClick={() => setActiveTab("edit")}
										className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
											activeTab === "edit"
												? "bg-slate-900 text-white shadow"
												: "text-slate-400 hover:text-slate-200"
										}`}
									>
										<Edit3 className="h-3.5 w-3.5" /> Edit
									</button>
									<button
										onClick={() => setActiveTab("preview")}
										className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
											activeTab === "preview"
												? "bg-slate-900 text-white shadow"
												: "text-slate-400 hover:text-slate-200"
										}`}
									>
										<Eye className="h-3.5 w-3.5" /> Live Preview
									</button>
								</div>

								<Button
									onClick={handleSave}
									disabled={isSaving}
									className="h-9 px-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white border-none rounded-lg font-semibold flex items-center gap-1.5 shadow shadow-purple-600/20"
								>
									{isSaving ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Save className="h-4 w-4" />
									)}
									{isSaving ? "Saving..." : "Save to GitHub"}
								</Button>
							</div>
						</div>

						{/* Split Screen Panel */}
						<div className="flex-1 flex overflow-hidden">
							{/* Left Pane: Form Editor */}
							<div
								className={`w-full md:w-1/2 flex flex-col overflow-y-auto p-6 space-y-6 ${activeTab === "edit" ? "block" : "hidden md:block"} border-r border-slate-950`}
							>
								{/* Frontmatter Metadata Form */}
								<div className="space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-900/60 shadow-inner">
									<h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
										Metadata Frontmatter
									</h3>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="title" className="text-xs text-slate-400">
												Post Title
											</Label>
											<Input
												id="title"
												value={title}
												onChange={(e) => setTitle(e.target.value)}
												placeholder="My Awesome Post"
												className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-purple-500/50 rounded-xl"
											/>
										</div>

										<div className="space-y-2">
											<Label
												htmlFor="pubDate"
												className="text-xs text-slate-400"
											>
												Publish Date
											</Label>
											<Input
												id="pubDate"
												type="date"
												value={pubDate}
												onChange={(e) => setPubDate(e.target.value)}
												className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-purple-500/50 rounded-xl"
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label
											htmlFor="description"
											className="text-xs text-slate-400"
										>
											Meta Description
										</Label>
										<Input
											id="description"
											value={description}
											onChange={(e) => setDescription(e.target.value)}
											placeholder="A comprehensive breakdown of our new software framework..."
											className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-purple-500/50 rounded-xl"
										/>
									</div>

									<div className="space-y-2">
										<Label
											htmlFor="heroImage"
											className="text-xs text-slate-400"
										>
											Hero Image URL
										</Label>
										<Input
											id="heroImage"
											value={heroImage}
											onChange={(e) => setHeroImage(e.target.value)}
											placeholder="/images/hero-photo.png"
											className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-purple-500/50 rounded-xl"
										/>
									</div>
								</div>

								{/* Body Content Editor */}
								<div className="flex-1 flex flex-col min-h-[400px]">
									<Label
										htmlFor="editor-textarea"
										className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"
									>
										Markdown Content Body
									</Label>
									<textarea
										id="editor-textarea"
										value={content}
										onChange={(e) => setContent(e.target.value)}
										className="flex-1 w-full bg-slate-950/80 border border-slate-800 focus:border-purple-500 focus:outline-none text-slate-200 p-5 rounded-2xl font-mono text-sm leading-relaxed resize-none shadow-inner"
										placeholder="# Hello World&#10;&#10;Write your post body here using raw markdown..."
									/>
								</div>
							</div>

							{/* Right Pane: Live HTML Preview */}
							<div
								className={`w-full md:w-1/2 flex flex-col bg-slate-950/30 overflow-y-auto p-8 space-y-6 ${activeTab === "preview" ? "block" : "hidden md:block"}`}
							>
								<div className="max-w-xl mx-auto w-full">
									{/* Fake post header */}
									{title && (
										<header className="border-b border-slate-900 pb-5 mb-6">
											{heroImage && (
												<img
													src={heroImage}
													alt={title}
													className="w-full h-48 object-cover rounded-2xl mb-4 border border-slate-800 shadow"
													onError={(e) =>
														(e.currentTarget.style.display = "none")
													}
												/>
											)}
											<h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
												{title}
											</h1>
											<div className="flex items-center gap-3 text-xs text-slate-500">
												<span>
													Published: <strong>{pubDate}</strong>
												</span>
												{description && (
													<span className="text-slate-700">|</span>
												)}
												<span className="italic">{description}</span>
											</div>
										</header>
									)}

									{/* Rendered HTML */}
									<article
										className="prose prose-invert prose-slate"
										dangerouslySetInnerHTML={{
											__html: parseMarkdownToHtml(content),
										}}
									/>
								</div>
							</div>
						</div>
					</main>
				) : (
					<main className="flex-1 flex flex-col items-center justify-center bg-slate-900/10">
						<div className="text-center p-8 space-y-4 max-w-sm">
							<div className="h-16 w-16 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center text-purple-400 mx-auto animate-bounce">
								<FileText className="h-8 w-8" />
							</div>
							<h2 className="text-xl font-bold text-white">
								No article selected
							</h2>
							<p className="text-slate-500 text-xs leading-relaxed">
								Select an article from the left sidebar to edit, or create a
								brand new draft to publish to your site.
							</p>
							<Button
								onClick={handleCreateNew}
								className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow shadow-purple-600/20"
							>
								<Plus className="h-4 w-4 mr-1.5" /> Create New Post
							</Button>
						</div>
					</main>
				)}
			</div>
		</div>
	);
}
