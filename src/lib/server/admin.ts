import { createHash, timingSafeEqual } from 'node:crypto';
import { error } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';
import { ADMIN_PASSWORD } from '$app/env/private';

const COOKIE_NAME = 'dreams_admin';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function hash(value: string): Buffer {
	return createHash('sha256').update(value).digest();
}

/** The value stored in the admin cookie — a digest, so the password itself never leaves the server. */
function session_token(): string {
	return hash(`dreams-admin:${ADMIN_PASSWORD}`).toString('hex');
}

export function check_password(password: string): boolean {
	if (!ADMIN_PASSWORD) return false;
	return timingSafeEqual(hash(password), hash(ADMIN_PASSWORD));
}

export function is_admin(): boolean {
	if (!ADMIN_PASSWORD) return false;
	const token = getRequestEvent().cookies.get(COOKIE_NAME);
	return token !== undefined && timingSafeEqual(hash(token), hash(session_token()));
}

export function assert_admin(): void {
	if (!is_admin()) error(401, 'The fog does not recognize you.');
}

/** Only call from `form`/`command` remote functions — queries cannot write cookies. */
export function start_admin_session(): void {
	getRequestEvent().cookies.set(COOKIE_NAME, session_token(), {
		path: '/',
		maxAge: COOKIE_MAX_AGE
	});
}

export function end_admin_session(): void {
	getRequestEvent().cookies.delete(COOKIE_NAME, { path: '/' });
}
