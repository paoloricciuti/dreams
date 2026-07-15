import * as v from 'valibot';
import { error, invalid, redirect } from '@sveltejs/kit';
import { form, query } from '$app/server';
import {
	assert_admin,
	check_password,
	end_admin_session,
	is_admin,
	start_admin_session
} from '$lib/server/admin';
import { create_dream, delete_dream, list_dreams, update_dream } from '$lib/server/atproto';
import { trigger_deployment } from '$lib/server/deploy';
import { IMAGE_TYPES, IMAGE_MAX_SIZE } from '$lib/dream_form';

export const get_admin_status = query(async () => is_admin());

/**
 * All dreams, chronological — live from the PDS. The public list is
 * prerendered and only updates on redeploy; the desk must see changes as soon
 * as they are made.
 */
export const get_dreams_admin = query(async () => list_dreams());

/** A single dream, live from the PDS — the edit form must never see a prerendered snapshot. */
export const get_dream_admin = query(v.string(), async (slug) => {
	const dreams = await list_dreams();
	const dream = dreams.find((d) => d.slug === slug);
	if (!dream) error(404, 'No such dream was logged.');
	return dream;
});

export const admin_login = form(
	v.object({
		_password: v.pipe(v.string(), v.nonEmpty('the fog expects a password'))
	}),
	async ({ _password }, issue) => {
		if (!check_password(_password)) {
			invalid(issue._password('that is not the password'));
		}
		start_admin_session();
	}
);

export const admin_logout = form(async () => {
	end_admin_session();
});

function slugify(title: string): string {
	return title
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export const log_dream = form(
	v.object({
		title: v.pipe(v.string(), v.nonEmpty('every dream has a title, even the untitled ones')),
		date: v.pipe(v.string(), v.isoDate('when was it dreamed?')),
		fragment: v.pipe(v.string(), v.nonEmpty('one line the dream said')),
		alt: v.pipe(v.string(), v.nonEmpty('describe the image the way the diary would')),
		story: v.pipe(v.string(), v.nonEmpty('the dream itself is missing')),
		image: v.pipe(
			v.file('the dream needs its image'),
			v.mimeType(IMAGE_TYPES, 'jpg, png, webp or avif'),
			v.maxSize(IMAGE_MAX_SIZE, 'the image must stay under 5MB')
		)
	}),
	async (data, issue) => {
		assert_admin();

		const slug = slugify(data.title);
		if (!slug) invalid(issue.title('this title does not survive becoming a slug'));

		const dreams = await list_dreams();
		if (dreams.some((d) => d.slug === slug)) {
			invalid(issue.title(`“${slug}” is already in the diary`));
		}

		const story = data.story
			.split(/\n\s*\n/)
			.map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
			.filter(Boolean);

		await create_dream({
			slug,
			title: data.title.trim(),
			date: data.date,
			fragment: data.fragment.trim(),
			alt: data.alt.trim(),
			story,
			image: data.image
		});

		// it's safe to throw away the promise — the framework awaits it before responding
		void get_dreams_admin().refresh();

		// the public pages are prerendered — rebuild them with the new dream
		await trigger_deployment();

		redirect(303, `/${slug}`);
	}
);

export const edit_dream = form(
	v.object({
		slug: v.pipe(v.string(), v.nonEmpty()),
		title: v.pipe(v.string(), v.nonEmpty('every dream has a title, even the untitled ones')),
		date: v.pipe(v.string(), v.isoDate('when was it dreamed?')),
		fragment: v.pipe(v.string(), v.nonEmpty('one line the dream said')),
		alt: v.pipe(v.string(), v.nonEmpty('describe the image the way the diary would')),
		story: v.pipe(v.string(), v.nonEmpty('the dream itself is missing')),
		// optional: an empty file input means "keep the current image"
		image: v.optional(v.file())
	}),
	async (data, issue) => {
		assert_admin();

		const dreams = await list_dreams();
		if (!dreams.some((d) => d.slug === data.slug)) {
			invalid(`no dream called “${data.slug}” is in the diary`);
		}

		// browsers submit an empty File when the input is left blank
		const image = data.image && data.image.size > 0 ? data.image : undefined;
		if (image) {
			if (!(IMAGE_TYPES as readonly string[]).includes(image.type)) {
				invalid(issue.image('jpg, png, webp or avif'));
			}
			if (image.size > IMAGE_MAX_SIZE) {
				invalid(issue.image('the image must stay under 5MB'));
			}
		}

		const story = data.story
			.split(/\n\s*\n/)
			.map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
			.filter(Boolean);

		await update_dream({
			slug: data.slug,
			title: data.title.trim(),
			date: data.date,
			fragment: data.fragment.trim(),
			alt: data.alt.trim(),
			story,
			image
		});

		void get_dreams_admin().refresh();
		void get_dream_admin(data.slug).refresh();

		// the public pages are prerendered — rebuild them with the rewritten dream
		await trigger_deployment();

		redirect(303, `/${data.slug}`);
	}
);

export const remove_dream = form(
	v.object({
		slug: v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ slug }) => {
		assert_admin();

		await delete_dream(slug);

		void get_dreams_admin().refresh();

		// the public pages are prerendered — rebuild them without the faded dream
		await trigger_deployment();

		redirect(303, '/admin');
	}
);
