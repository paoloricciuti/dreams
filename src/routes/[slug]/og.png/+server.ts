import { error } from '@sveltejs/kit';
import { render } from 'svelte/server';
import { ImageResponse } from '@ethercorps/sveltekit-og';
import { GoogleFont, resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import { list_dreams } from '$lib/server/atproto';
import { format_date } from '$lib/dreams';
import DreamOg from '$lib/og/dream_og.svelte';
import type { EntryGenerator, RequestHandler } from './$types';

// fully prerendered (not 'auto' like the dream pages): satori/resvg pull in
// wasm the node server bundle can't load, so the images only exist at build
// time. a dream logged after the last deploy has no og image until the
// redeploy the admin dashboard triggers anyway
export const prerender = true;

export const entries: EntryGenerator = async () => {
	const dreams = await list_dreams();
	return dreams.map((dream) => ({ slug: dream.slug }));
};

// the same fonts the site uses; fetched once and reused across every image
let fonts: ReturnType<typeof resolveFonts> | undefined;

function get_fonts(): ReturnType<typeof resolveFonts> {
	fonts ??= resolveFonts([new GoogleFont('Gloock'), new GoogleFont('Karla')]);
	fonts.catch(() => (fonts = undefined));
	return fonts;
}

export const GET: RequestHandler = async ({ params }) => {
	const dreams = await list_dreams();
	const dream = dreams.find((d) => d.slug === params.slug);
	if (!dream) error(404, 'No such dream was logged.');

	// the image stays a URL and satori fetches it itself: inlining it as a
	// data: URL puts megabytes into an html attribute, and satori-html's
	// parser is quadratic in attribute size — it hangs the process for minutes
	const { body, head } = render(DreamOg, {
		props: {
			image: dream.og_image_url,
			title: dream.title,
			date: format_date(dream.date),
			fragment: dream.fragment
		}
	});

	// render the component ourselves instead of letting ImageResponse do it:
	// svelte escapes `&` wherever it interpolates, satori-html never decodes
	// entities, and an `&amp;` in the image URL breaks satori's fetch of it
	const markup = (body + head).replaceAll('&amp;', '&');

	return new ImageResponse(markup, { width: 1200, height: 630, fonts: await get_fonts() });
};
