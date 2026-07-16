import {
	ATPROTO_APP_PASSWORD,
	ATPROTO_DID,
	ATPROTO_HANDLE,
	ATPROTO_SERVICE
} from '$app/env/private';
import type { Dream } from '$lib/dreams';
import * as dream from '$lib/lexicons/me/ricciuti/dreams/dream';
import { Client, getBlobCidString, l, type AtIdentifierString } from '@atproto/lex';
import { PasswordSession } from '@atproto/lex-password-session';
import { imageSize } from 'image-size';

type Identity = {
	did: AtIdentifierString;
	/** base URL of the personal data server hosting the repo */
	service: string;
};

async function fetch_json(url: string): Promise<Record<string, unknown>> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`${url} responded with ${response.status}`);
	}
	return response.json();
}

async function resolve_identity(handle: string): Promise<Identity> {
	const did =
		ATPROTO_DID ??
		((
			await fetch_json(
				`https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`
			)
		).did as string);

	if (ATPROTO_SERVICE) return { did: did as AtIdentifierString, service: ATPROTO_SERVICE };

	const did_doc = did.startsWith('did:plc:')
		? await fetch_json(`https://plc.directory/${did}`)
		: await fetch_json(`https://${did.replace('did:web:', '')}/.well-known/did.json`);

	const services = did_doc.service as Array<{ id: string; serviceEndpoint: string }>;
	const pds = services.find((s) => s.id === '#atproto_pds');
	if (!pds) throw new Error(`No PDS found in the DID document for ${handle} (${did})`);

	return { did: did as AtIdentifierString, service: pds.serviceEndpoint };
}

let identity: Promise<Identity> | undefined;

export function get_identity(): Promise<Identity> {
	identity ??= resolve_identity(ATPROTO_HANDLE);
	// if resolution fails, allow the next request to retry instead of caching the error
	identity.catch(() => (identity = undefined));
	return identity;
}

function to_dream(uri: string, record: dream.Main, { did, service }: Identity): Dream {
	const slug = uri.split('/').at(-1)!;
	return {
		slug,
		title: record.title,
		date: record.date,
		image_url: `./${slug}/${getBlobCidString(record.image)}/img.png`,
		og_image_url: `${service}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${getBlobCidString(record.image)}`,
		aspect: record.aspectWidth / record.aspectHeight,
		fragment: record.fragment,
		alt: record.alt,
		story: record.story
	};
}

const CACHE_TTL_MS = 60_000;

let cache: { dreams: Dream[]; expires: number } | undefined;

/** All dreams in the diary, chronological (oldest first). */
export async function list_dreams(): Promise<Dream[]> {
	if (cache && cache.expires > Date.now()) return cache.dreams;

	const identity = await get_identity();
	const client = new Client(identity.service);

	const dreams: Dream[] = [];
	let cursor: string | undefined;
	do {
		const result = await client.list(dream.main, { repo: identity.did, limit: 100, cursor });
		for (const record of result.records) {
			if (record.valid) {
				dreams.push(to_dream(record.uri, record.value, identity));
			} else {
				console.warn('Skipping dream record that failed validation:', record.uri);
			}
		}
		cursor = result.cursor;
	} while (cursor);

	dreams.sort((a, b) => a.date.localeCompare(b.date));

	cache = { dreams, expires: Date.now() + CACHE_TTL_MS };
	return dreams;
}

let author_client: Promise<Client> | undefined;

/** A client authenticated as the diary's author, for writing dreams. */
function get_author_client(): Promise<Client> {
	author_client ??= (async () => {
		if (!ATPROTO_APP_PASSWORD) {
			throw new Error('ATPROTO_APP_PASSWORD is not set — the diary is read-only');
		}
		const { service } = await get_identity();
		const session = await PasswordSession.login({
			service,
			identifier: ATPROTO_HANDLE,
			password: ATPROTO_APP_PASSWORD
		});
		return new Client(session);
	})();
	// if login fails, allow the next attempt to retry instead of caching the error
	author_client.catch(() => (author_client = undefined));
	return author_client;
}

export type NewDream = {
	slug: string;
	title: string;
	date: string;
	fragment: string;
	alt: string;
	story: string[];
	image: File;
};

/** Uploads the image as a blob and writes the dream record, keyed by its slug. */
export async function create_dream(input: NewDream): Promise<void> {
	const client = await get_author_client();

	const bytes = new Uint8Array(await input.image.arrayBuffer());
	const { width, height } = imageSize(bytes);
	const upload = await client.uploadBlob(input.image);

	const record = dream.$build({
		title: input.title,
		date: input.date,
		image: upload.body.blob,
		aspectWidth: width,
		aspectHeight: height,
		fragment: input.fragment,
		alt: input.alt,
		story: input.story,
		createdAt: l.currentDatetimeString()
	});
	await client.put(dream.main, record, { rkey: input.slug });

	cache = undefined;
}

/**
 * Rewrites an existing dream record. The slug (record key) never changes, and
 * the stored image and createdAt are kept unless a new image is provided.
 */
export async function update_dream(input: Omit<NewDream, 'image'> & { image?: File }) {
	const client = await get_author_client();
	const existing = await client.get(dream.main, { rkey: input.slug });

	let image = existing.value.image;
	let width = existing.value.aspectWidth;
	let height = existing.value.aspectHeight;
	if (input.image) {
		const bytes = new Uint8Array(await input.image.arrayBuffer());
		({ width, height } = imageSize(bytes));
		image = (await client.uploadBlob(input.image)).body.blob;
	}

	const record = dream.$build({
		title: input.title,
		date: input.date,
		image,
		aspectWidth: width,
		aspectHeight: height,
		fragment: input.fragment,
		alt: input.alt,
		story: input.story,
		createdAt: existing.value.createdAt
	});
	await client.put(dream.main, record, { rkey: input.slug });

	cache = undefined;
}

/** Removes a dream record. The blob is garbage-collected by the PDS. */
export async function delete_dream(slug: string): Promise<void> {
	const client = await get_author_client();
	await client.delete(dream.main, { rkey: slug });

	cache = undefined;
}
