import { defineEnvVars } from '@sveltejs/kit/hooks';
import * as v from 'valibot';

export const variables = defineEnvVars({
	ATPROTO_HANDLE: {
		description: 'The atproto handle whose repo holds the dreams',
		schema: v.optional(v.string(), 'paolo.ricciuti.me')
	},
	ATPROTO_DID: {
		description: 'Optional: pin the DID instead of resolving the handle',
		schema: v.optional(v.string())
	},
	ATPROTO_SERVICE: {
		description: 'Optional: pin the PDS URL instead of resolving it from the DID document',
		schema: v.optional(v.string())
	},
	ATPROTO_APP_PASSWORD: {
		description: 'App password created on the PDS — lets the admin dashboard write dreams',
		schema: v.optional(v.string())
	},
	ADMIN_PASSWORD: {
		description: 'Password that guards the /admin dashboard',
		schema: v.optional(v.string())
	}
});
