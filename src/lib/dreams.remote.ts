import * as v from 'valibot';
import { error } from '@sveltejs/kit';
import { prerender } from '$app/server';
import { list_dreams } from '$lib/server/atproto';
import type { Dream } from '$lib/dreams';

export type DreamPage = {
	dream: Dream;
	/** the dream logged before this one, if any */
	night_before: Dream | undefined;
	/** the dream logged after this one, if any */
	night_after: Dream | undefined;
};

/**
 * All dreams in the diary, chronological (oldest first). Prerendered — when
 * the diary changes, the admin dashboard triggers a redeploy to rebuild it.
 */
export const get_dreams = prerender(async (): Promise<Dream[]> => {
	return list_dreams();
});

/** A single dream and its neighbouring nights. */
export const get_dream = prerender(
	v.string(),
	async (slug): Promise<DreamPage> => {
		const dreams = await list_dreams();
		const index = dreams.findIndex((d) => d.slug === slug);
		if (index === -1) error(404, 'No such dream was logged.');
		return {
			dream: dreams[index],
			night_before: dreams[index - 1],
			night_after: dreams[index + 1]
		};
	},
	{
		dynamic: true
	}
);
