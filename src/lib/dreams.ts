export type Dream = {
	slug: string;
	title: string;
	/** ISO date the dream was logged */
	date: string;
	/** URL of the dream image, served from the author's PDS blob store */
	image_url: string;
	/** width / height of the source image */
	aspect: number;
	/** one line the dream said, set in the serif voice */
	fragment: string;
	/** alt text, written the way the diary would describe the image */
	alt: string;
	/** the whole story, one entry per paragraph */
	story: string[];
};

/**
 * Stable `view-transition-name` for a dream's parts, shared by the field and
 * the clearing so the image/title morph between pages. Slugs are atproto
 * record keys and may contain characters that aren't valid in a CSS ident,
 * so anything unsafe is escaped to its char code.
 */
export function dream_transition_name(part: 'image' | 'title', slug: string): string {
	const safe = slug.replace(/[^a-zA-Z0-9_-]/g, (ch) => `_${ch.charCodeAt(0)}`);
	return `dream-${part}-${safe}`;
}

export function format_date(iso: string): string {
	return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}
