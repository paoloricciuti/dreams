import { get_identity } from '$lib/server/atproto';

export const prerender = true;

export async function GET({ params: { cid } }) {
	const identity = await get_identity();

	const file = await fetch(
		`${identity.service}/xrpc/com.atproto.sync.getBlob?did=${identity.did}&cid=${cid}`
	);
	if (!file.ok) {
		return new Response('Failed to fetch image', { status: 500 });
	}
	const blob = await file.blob();
	return new Response(blob, {
		headers: {
			'Content-Type': blob.type
		}
	});
}
