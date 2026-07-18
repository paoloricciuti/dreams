import { DEPLOY_URL } from '$app/env/private';

/**
 * Asks Coolify to rebuild and redeploy the app, so the prerendered pages (the
 * homepage and the dream pages) get rebuilt with whatever just changed in the
 * diary. `force=true` skips the build cache — the git repo hasn't changed,
 * only the data, so a cached build could prerender stale pages.
 *
 * A failure here never fails the mutation that triggered it: the dream is
 * already safely in the repo, the site is just stale until the next deploy.
 */
export async function trigger_deployment(): Promise<void> {
	if (!DEPLOY_URL) {
		console.warn('DEPLOY_URL is not set — skipping redeploy, the prerendered pages will go stale');
		return;
	}

	try {
		const response = await fetch(`${DEPLOY_URL}?buildCache=false`, {
			method: 'POST'
		});
		if (!response.ok) {
			throw new Error(
				`Deployment trigger responded with ${response.status}: ${await response.text()}`
			);
		}
	} catch (error) {
		console.error(
			'Failed to trigger a redeploy — the prerendered pages are stale until the next deployment',
			error
		);
	}
}
