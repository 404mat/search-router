import { defineConfig } from "cf/config";

/**
 * Secret-like files were detected but not read or migrated: .env.example. Only `secrets.required` entries are migrated.
 * @see https://developers.cloudflare.com/workers/configuration/secrets/
 */

export default defineConfig({
	worker: {
		name: "search-router",
		compatibilityDate: "2025-09-27",
		compatibilityFlags: [
			"nodejs_compat",
		],
		observability: {
			enabled: true,
		},
		assets: {
			notFoundHandling: "single-page-application",
		},
	},
});
