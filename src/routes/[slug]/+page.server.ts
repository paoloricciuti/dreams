import { list_dreams } from '$lib/server/atproto';

export const prerender = 'auto';

export function entries() {
	return list_dreams().then((dreams) => dreams.map((dream) => ({ slug: dream.slug })));
}
