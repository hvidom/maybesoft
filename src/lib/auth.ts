import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "../db/db";
import * as schema from "../db/schema";

export function getAuth(env?: any) {
	const db = getDb(env);

	const secret =
		env?.BETTER_AUTH_SECRET ||
		(typeof process !== "undefined"
			? process.env?.BETTER_AUTH_SECRET
			: undefined);
	const url =
		env?.BETTER_AUTH_URL ||
		(typeof process !== "undefined"
			? process.env?.BETTER_AUTH_URL
			: undefined) ||
		"http://localhost:4321";

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "sqlite",
			schema: {
				user: schema.user,
				session: schema.session,
				account: schema.account,
				verification: schema.verification,
			},
		}),
		secret: secret,
		baseURL: url,
		emailAndPassword: {
			enabled: true,
			autoSignIn: true,
		},
		user: {
			fields: {
				role: "role",
			},
		},
	});
}

// Client-side config helper
export const authClientConfig = {
	baseURL:
		typeof window !== "undefined"
			? window.location.origin
			: "http://localhost:4321",
};
